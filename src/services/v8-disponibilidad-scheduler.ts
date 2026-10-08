import cron from "node-cron";
import { APP_TIMEZONE } from "./v8-disponibilidad/constants";
import {
  isSchedulerEnabled,
  processDisponibilidadMinute,
} from "./v8-disponibilidad/service";

export const startV8DisponibilidadScheduler = (): void => {
  if (!isSchedulerEnabled()) {
    console.log(
      "[V8-DISP] Scheduler desactivado — disponibilidad V8 vía Turnos (Firebase). Para cron Render: V8_DISPONIBILIDAD_ENABLED=true"
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
