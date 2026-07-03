import cron from "node-cron";
import { processDueTasks, isTurnosTareasEnabled } from "./turnos-tareas/service";
import { APP_TIMEZONE } from "./turnos-tareas/constants";

export const startTurnosTareasScheduler = (): void => {
  if (!isTurnosTareasEnabled()) {
    console.log(
      "[TURNOS-TAREAS] Scheduler desactivado — envíos vía señales Turnos (POST /api/integration/firebase/whatsapp). Para reactivar cron interno: TURNOS_TAREAS_ENABLED=true"
    );
    return;
  }

  console.log("[TURNOS-TAREAS] Cron interno activo (legacy) — planilla Firebase + motor Render");
  console.log(`[TURNOS-TAREAS] Timezone: ${APP_TIMEZONE} — cada minuto`);

  cron.schedule(
    "* * * * *",
    async () => {
      await processDueTasks();
    },
    { scheduled: true, timezone: APP_TIMEZONE }
  );

  console.log("[TURNOS-TAREAS] Scheduler activo — fuente: planilla Firebase (legacy)");
};
