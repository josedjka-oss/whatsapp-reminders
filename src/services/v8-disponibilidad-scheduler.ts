import cron from "node-cron";
import { APP_TIMEZONE } from "./v8-disponibilidad/constants";
import {
  isSchedulerEnabled,
  processDisponibilidadMinute,
} from "./v8-disponibilidad/service";

export const startV8DisponibilidadScheduler = (): void => {
  if (!isSchedulerEnabled()) {
    console.log(
      "[V8-DISP] Scheduler desactivado (falta V8_DISPONIBILIDAD_API_KEY o V8_DISPONIBILIDAD_ENABLED=false)"
    );
    return;
  }

  console.log("[V8-DISP] Iniciando scheduler disponibilidad mensajeros V8");
  console.log(`[V8-DISP] Timezone: ${APP_TIMEZONE} — cada minuto`);

  cron.schedule(
    "* * * * *",
    async () => {
      await processDisponibilidadMinute();
    },
    { scheduled: true, timezone: APP_TIMEZONE }
  );

  console.log("[V8-DISP] Scheduler activo — Harold (1), Diego (2), Dilan (3)");
};
