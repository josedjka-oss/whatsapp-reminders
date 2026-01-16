import cron from "node-cron";
import { prisma } from "../db";
import { sendWhatsAppMessage } from "./twilio";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { isBefore, addMinutes, differenceInSeconds } from "date-fns";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

/**
 * Verifica si un recordatorio debe enviarse ahora
 */
const shouldSendReminder = async (reminder: any): Promise<boolean> => {
  const now = new Date();
  const reminderTimezone = reminder.timezone || APP_TIMEZONE;

  // Si ya se ejecutó en los últimos 60 segundos, no enviar (evitar duplicados)
  if (reminder.lastRunAt) {
    const lastRunPlus60s = addMinutes(reminder.lastRunAt, 1);
    if (isBefore(now, lastRunPlus60s)) {
      return false; // Aún está en ventana de 60s
    }
  }

  switch (reminder.scheduleType) {
    case "once": {
      if (!reminder.sendAt) return false;
      
      // Convertir sendAt (UTC en DB) a zona horaria del recordatorio
      const sendAtDate = new Date(reminder.sendAt);
      const sendAtZoned = toZonedTime(sendAtDate, reminderTimezone);
      
      // Convertir now (UTC) a zona horaria del recordatorio
      const nowZoned = toZonedTime(now, reminderTimezone);
      
      // Comparar en la misma zona horaria
      // Verificar si ya pasó la fecha y estamos en el mismo minuto
      if (isBefore(nowZoned, sendAtZoned)) {
        return false; // Aún no es momento
      }
      
      // Verificar si estamos en el mismo minuto (con tolerancia de 60 segundos)
      // Comparar las fechas zonales, no las UTC
      const diffInSeconds = Math.abs(differenceInSeconds(nowZoned, sendAtZoned));
      return diffInSeconds <= 60; // Dentro de 60 segundos de la fecha programada
    }

    case "daily": {
      if (reminder.hour === null || reminder.minute === null) return false;
      // Usar timezone del recordatorio o el por defecto
      const currentHour = parseInt(formatInTimeZone(now, reminderTimezone, "HH"));
      const currentMinute = parseInt(formatInTimeZone(now, reminderTimezone, "mm"));
      return currentHour === reminder.hour && currentMinute === reminder.minute;
    }

    case "monthly": {
      if (
        reminder.dayOfMonth === null ||
        reminder.hour === null ||
        reminder.minute === null
      )
        return false;
      // Usar timezone del recordatorio o el por defecto
      const currentDay = parseInt(formatInTimeZone(now, reminderTimezone, "d"));
      const currentHour = parseInt(formatInTimeZone(now, reminderTimezone, "HH"));
      const currentMinute = parseInt(formatInTimeZone(now, reminderTimezone, "mm"));
      return (
        currentDay === reminder.dayOfMonth &&
        currentHour === reminder.hour &&
        currentMinute === reminder.minute
      );
    }

    default:
      return false;
  }
};

/**
 * Procesa y envía recordatorios pendientes
 */
const processReminders = async (): Promise<void> => {
  const startTime = Date.now();
  try {
    const now = new Date();
    const nowZoned = toZonedTime(now, APP_TIMEZONE);
    console.log(`[SCHEDULER] ${now.toISOString()} (UTC) - ${formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd HH:mm:ss")} (${APP_TIMEZONE}) - Verificando recordatorios activos...`);

    // Verificar conexión a base de datos primero
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError: any) {
      console.error(`[SCHEDULER] ❌ Error de conexión a base de datos:`, dbError.message);
      console.error(`[SCHEDULER] Stack trace:`, dbError.stack);
      return; // Salir temprano si no hay conexión a DB
    }

    // Obtener recordatorios activos
    let reminders;
    try {
      reminders = await prisma.reminder.findMany({
        where: {
          isActive: true,
        },
      });
      console.log(`[SCHEDULER] Encontrados ${reminders.length} recordatorios activos`);
    } catch (queryError: any) {
      console.error(`[SCHEDULER] ❌ Error consultando recordatorios:`);
      console.error(`[SCHEDULER] Mensaje:`, queryError.message || "Sin mensaje de error");
      console.error(`[SCHEDULER] Código:`, queryError.code || "Sin código de error");
      console.error(`[SCHEDULER] Tipo:`, queryError.constructor.name || "Desconocido");
      console.error(`[SCHEDULER] Stack trace:`, queryError.stack || "Sin stack trace");
      
      // Mensajes específicos para errores comunes
      if (queryError.code === "42P01") {
        console.error(`[SCHEDULER] ⚠️  ERROR: La tabla "Reminder" no existe. Las migraciones no se ejecutaron.`);
        console.error(`[SCHEDULER] ⚠️  SOLUCIÓN: Ejecuta 'npx prisma migrate deploy' en Render.`);
      } else if (queryError.code === "3D000") {
        console.error(`[SCHEDULER] ⚠️  ERROR: La base de datos no existe.`);
      } else if (queryError.code === "28P01") {
        console.error(`[SCHEDULER] ⚠️  ERROR: Credenciales de base de datos incorrectas.`);
      } else if (queryError.message?.includes("P1001")) {
        console.error(`[SCHEDULER] ⚠️  ERROR: No se puede conectar a la base de datos. Verifica DATABASE_URL.`);
      } else if (queryError.message?.includes("P2021")) {
        console.error(`[SCHEDULER] ⚠️  ERROR: La tabla no existe. Ejecuta las migraciones.`);
      }
      
      return; // Salir temprano si hay error en la consulta
    }

    if (reminders.length === 0) {
      const duration = Date.now() - startTime;
      console.log(`[SCHEDULER] Verificación completada en ${duration}ms (sin recordatorios)`);
      return;
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const reminder of reminders) {
      try {
        // Validar que el recordatorio tenga los campos necesarios
        if (!reminder.id || !reminder.to || !reminder.body) {
          console.warn(`[SCHEDULER] ⚠️  Recordatorio ${reminder.id} tiene campos inválidos, saltando...`);
          continue;
        }

        let shouldSend: boolean;
        try {
          shouldSend = await shouldSendReminder(reminder);
        } catch (validationError: any) {
          console.error(
            `[SCHEDULER] ❌ Error validando recordatorio ${reminder.id}:`,
            validationError.message
          );
          console.error(`[SCHEDULER] Stack trace:`, validationError.stack);
          errorCount++;
          continue; // Continuar con el siguiente recordatorio
        }

        if (shouldSend) {
          console.log(
            `[SCHEDULER] ⏰ Recordatorio ${reminder.id} debe enviarse ahora (tipo: ${reminder.scheduleType}, destino: ${reminder.to})`
          );
          console.log(`[SCHEDULER] 📝 Mensaje: "${reminder.body.substring(0, 50)}${reminder.body.length > 50 ? '...' : ''}"`);
          console.log(`[SCHEDULER] 📞 Verificando formato del número: ${reminder.to}`);

          // Validar formato del número antes de enviar
          if (!reminder.to.match(/^whatsapp:\+\d{10,15}$/)) {
            console.error(`[SCHEDULER] ❌ Formato de número inválido: ${reminder.to}. Debe ser 'whatsapp:+573001234567'`);
            errorCount++;
            continue;
          }

          // Validar que el número destino no sea el mismo que el origen
          // Obtener el número origen desde las credenciales de Twilio
          const twilioFromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim() || "whatsapp:+573043577875";
          if (reminder.to === twilioFromNumber) {
            console.error(`[SCHEDULER] ❌ No se puede enviar a sí mismo. El recordatorio ${reminder.id} tiene el mismo número de origen y destino: ${reminder.to}`);
            console.error(`[SCHEDULER] ⚠️  Desactivando recordatorio para evitar errores futuros`);
            // Desactivar el recordatorio para evitar intentos futuros
            try {
              await prisma.reminder.update({
                where: { id: reminder.id },
                data: { isActive: false },
              });
              console.log(`[SCHEDULER] ✅ Recordatorio ${reminder.id} desactivado`);
            } catch (updateError: any) {
              console.error(`[SCHEDULER] ❌ Error desactivando recordatorio:`, updateError.message);
            }
            errorCount++;
            continue;
          }

          // Intentar enviar con reintentos
          let sent = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (!sent && attempts < maxAttempts) {
            try {
              // Construir reminderText (el texto que va en {{1}} del template)
              const reminderText = reminder.body;
              
              console.log(`[SCHEDULER] 📤 Enviando recordatorio usando WhatsApp Business API...`);
              console.log(`[SCHEDULER] 📝 ReminderText: ${reminderText.substring(0, 50)}${reminderText.length > 50 ? '...' : ''}`);
              
              const messageSid = await sendWhatsAppMessage({
                to: reminder.to,
                reminderText: reminderText,
              });
              
              console.log(`[SCHEDULER] ✅ Mensaje enviado. SID: ${messageSid}`);

              // Actualizar lastRunAt
              try {
                await prisma.reminder.update({
                  where: { id: reminder.id },
                  data: { lastRunAt: new Date() },
                });
              } catch (updateError: any) {
                console.error(
                  `[SCHEDULER] ❌ Error actualizando lastRunAt para ${reminder.id}:`,
                  updateError.message
                );
                // Continuar aunque falle la actualización de lastRunAt
              }

              // Si es "once", desactivar después de enviar
              if (reminder.scheduleType === "once") {
                try {
                  await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: { isActive: false },
                  });
                  console.log(`[SCHEDULER] ✅ Recordatorio 'once' ${reminder.id} enviado y desactivado`);
                } catch (deactivateError: any) {
                  console.error(
                    `[SCHEDULER] ❌ Error desactivando recordatorio ${reminder.id}:`,
                    deactivateError.message
                  );
                  // Continuar aunque falle la desactivación
                }
              } else {
                console.log(`[SCHEDULER] ✅ Recordatorio ${reminder.id} enviado exitosamente`);
              }

              sent = true;
              sentCount++;
            } catch (sendError: any) {
              attempts++;
              console.error(
                `[SCHEDULER] ❌ Error enviando recordatorio ${reminder.id} (intento ${attempts}/${maxAttempts}):`,
                sendError.message
              );
              console.error(`[SCHEDULER] Stack trace:`, sendError.stack);

              if (attempts < maxAttempts) {
                // Backoff exponencial: 2s, 4s, 8s
                const delay = Math.pow(2, attempts) * 1000;
                console.log(`[SCHEDULER] ⏳ Reintentando en ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }
          }

          if (!sent) {
            errorCount++;
            console.error(
              `[SCHEDULER] ❌ Fallo crítico: No se pudo enviar recordatorio ${reminder.id} después de ${maxAttempts} intentos`
            );
          }
        }
      } catch (error: any) {
        errorCount++;
        console.error(`[SCHEDULER] ❌ Error procesando recordatorio ${reminder.id}:`, error.message);
        console.error(`[SCHEDULER] Stack trace:`, error.stack);
        // Continuar con el siguiente recordatorio en lugar de fallar completamente
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[SCHEDULER] Verificación completada en ${duration}ms - Enviados: ${sentCount}, Errores: ${errorCount}`
    );
  } catch (error: any) {
    console.error(`[SCHEDULER] ❌ Error crítico procesando recordatorios:`, error.message);
    console.error(`[SCHEDULER] Tipo de error:`, error.constructor.name);
    console.error(`[SCHEDULER] Stack trace:`, error.stack);
    // No relanzar el error para que el scheduler continúe ejecutándose
  }
};

/**
 * Inicializa el scheduler
 */
export const startScheduler = (): void => {
  console.log("[SCHEDULER] Iniciando scheduler de recordatorios...");
  console.log(`[SCHEDULER] Timezone configurado: ${APP_TIMEZONE}`);
  console.log("[SCHEDULER] Frecuencia: Cada minuto (* * * * *)");

  // Ejecutar cada minuto
  cron.schedule(
    "* * * * *",
    async () => {
      await processReminders();
    },
    {
      scheduled: true,
      timezone: APP_TIMEZONE,
    }
  );

  console.log("[SCHEDULER] ✅ Scheduler iniciado correctamente y programado");
};
