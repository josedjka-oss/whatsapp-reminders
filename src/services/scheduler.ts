import cron from "node-cron";
import { prisma } from "../db";
import { sendWhatsAppMessage } from "./twilio";
import { formatInTimeZone } from "date-fns-tz";
import { isBefore, addMinutes } from "date-fns";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

/**
 * Verifica si un recordatorio debe enviarse ahora
 */
const shouldSendReminder = async (reminder: any): Promise<boolean> => {
  const now = new Date();

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
      const sendAtDate = new Date(reminder.sendAt);
      
      // Verificar si ya pasó la fecha y estamos en el mismo minuto
      // El scheduler se ejecuta cada minuto, así que verificamos si estamos en el minuto exacto
      if (isBefore(now, sendAtDate)) {
        return false; // Aún no es momento
      }
      
      // Verificar si estamos en el mismo minuto (con tolerancia de 60 segundos)
      const diffInSeconds = Math.abs((now.getTime() - sendAtDate.getTime()) / 1000);
      return diffInSeconds <= 60; // Dentro de 60 segundos de la fecha programada
    }

    case "daily": {
      if (reminder.hour === null || reminder.minute === null) return false;
      const currentHour = parseInt(formatInTimeZone(now, reminder.timezone, "HH"));
      const currentMinute = parseInt(formatInTimeZone(now, reminder.timezone, "mm"));
      return currentHour === reminder.hour && currentMinute === reminder.minute;
    }

    case "monthly": {
      if (
        reminder.dayOfMonth === null ||
        reminder.hour === null ||
        reminder.minute === null
      )
        return false;
      const currentDay = parseInt(formatInTimeZone(now, reminder.timezone, "d"));
      const currentHour = parseInt(formatInTimeZone(now, reminder.timezone, "HH"));
      const currentMinute = parseInt(formatInTimeZone(now, reminder.timezone, "mm"));
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
    console.log(`[SCHEDULER] ${now.toISOString()} - Verificando recordatorios activos...`);

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

          // Intentar enviar con reintentos
          let sent = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (!sent && attempts < maxAttempts) {
            try {
              const messageSid = await sendWhatsAppMessage({
                to: reminder.to,
                body: reminder.body,
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
