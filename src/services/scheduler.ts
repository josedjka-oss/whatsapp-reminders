import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { sendWhatsAppMessage } from "./twilio";
import { formatInTimeZone } from "date-fns-tz";
import { isBefore, addMinutes } from "date-fns";

const prisma = new PrismaClient();

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

    // Obtener recordatorios activos
    const reminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
      },
    });

    console.log(`[SCHEDULER] Encontrados ${reminders.length} recordatorios activos`);

    if (reminders.length === 0) {
      const duration = Date.now() - startTime;
      console.log(`[SCHEDULER] Verificación completada en ${duration}ms (sin recordatorios)`);
      return;
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const reminder of reminders) {
      try {
        const shouldSend = await shouldSendReminder(reminder);

        if (shouldSend) {
          console.log(
            `[SCHEDULER] ⏰ Recordatorio ${reminder.id} debe enviarse ahora (tipo: ${reminder.scheduleType}, destino: ${reminder.to})`
          );

          // Intentar enviar con reintentos
          let sent = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (!sent && attempts < maxAttempts) {
            try {
              await sendWhatsAppMessage({
                to: reminder.to,
                body: reminder.body,
              });

              // Actualizar lastRunAt
              await prisma.reminder.update({
                where: { id: reminder.id },
                data: { lastRunAt: new Date() },
              });

              // Si es "once", desactivar después de enviar
              if (reminder.scheduleType === "once") {
                await prisma.reminder.update({
                  where: { id: reminder.id },
                  data: { isActive: false },
                });
                console.log(`[SCHEDULER] ✅ Recordatorio 'once' ${reminder.id} enviado y desactivado`);
              } else {
                console.log(`[SCHEDULER] ✅ Recordatorio ${reminder.id} enviado exitosamente`);
              }

              sent = true;
              sentCount++;
            } catch (error: any) {
              attempts++;
              console.error(
                `[SCHEDULER] ❌ Error enviando recordatorio ${reminder.id} (intento ${attempts}/${maxAttempts}):`,
                error.message
              );

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
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[SCHEDULER] Verificación completada en ${duration}ms - Enviados: ${sentCount}, Errores: ${errorCount}`
    );
  } catch (error: any) {
    console.error(`[SCHEDULER] ❌ Error crítico procesando recordatorios:`, error.message);
    console.error(`[SCHEDULER] Stack trace:`, error.stack);
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
