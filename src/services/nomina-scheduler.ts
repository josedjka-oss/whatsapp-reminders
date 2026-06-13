import cron from "node-cron";
import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "../db";
import {
  createOpenQuincena,
  generateSlipsForPeriod,
  getOrCreateScheduleConfig,
  resolvePeriodHalfForToday,
  sendAllSlipsWhatsApp,
} from "./nomina-service";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

export const processNominaAutoSend = async (): Promise<void> => {
  try {
    const config = await getOrCreateScheduleConfig();
    if (!config.autoSendEnabled) return;

    const now = new Date();
    const ymd = formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd");
    const year = parseInt(formatInTimeZone(now, APP_TIMEZONE, "yyyy"), 10);
    const month = parseInt(formatInTimeZone(now, APP_TIMEZONE, "M"), 10);
    const day = parseInt(formatInTimeZone(now, APP_TIMEZONE, "d"), 10);
    const hour = parseInt(formatInTimeZone(now, APP_TIMEZONE, "HH"), 10);
    const minute = parseInt(formatInTimeZone(now, APP_TIMEZONE, "mm"), 10);

    const half = resolvePeriodHalfForToday(year, month, day);
    if (!half) return;

    if (hour !== config.hour || minute !== config.minute) return;

    const runKey = `${ymd}-half${half}`;
    if (config.lastAutoRunKey === runKey) return;

    console.log(`[NOMINA] Envío automático quincena ${half} — ${ymd}`);

    await createOpenQuincena(year, month, half);
    const { period } = await generateSlipsForPeriod(year, month, half);
    const results = await sendAllSlipsWhatsApp(period.id);

    const okCount = results.filter((r) => r.ok).length;
    const failCount = results.length - okCount;
    console.log(`[NOMINA] Enviados ${okCount}/${results.length} (fallos: ${failCount})`);

    await prisma.nominaScheduleConfig.update({
      where: { id: "default" },
      data: { lastAutoRunKey: runKey },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[NOMINA] Error en envío automático:", message);
  }
};

export const startNominaScheduler = (): void => {
  console.log("[NOMINA] Scheduler activo — quincenas día 15 y último del mes");

  cron.schedule(
    "* * * * *",
    async () => {
      await processNominaAutoSend();
    },
    { scheduled: true, timezone: APP_TIMEZONE }
  );
};
