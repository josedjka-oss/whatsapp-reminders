import cron from "node-cron";
import { processDueTasks, isTurnosTareasEnabled } from "./turnos-tareas/service";
import { APP_TIMEZONE } from "./turnos-tareas/constants";

export const startTurnosTareasScheduler = (): void => {
  if (!isTurnosTareasEnabled()) {
    console.log(
      "[TURNOS-TAREAS] Scheduler desactivado (TURNOS_TAREAS_ENABLED=false)"
    );
    return;
  }

  console.log("[TURNOS-TAREAS] Iniciando scheduler aseo/cocina/basura");
  console.log(`[TURNOS-TAREAS] Timezone: ${APP_TIMEZONE} — cada minuto`);

  cron.schedule(
    "* * * * *",
    async () => {
      await processDueTasks();
    },
    { scheduled: true, timezone: APP_TIMEZONE }
  );

  console.log("[TURNOS-TAREAS] Scheduler activo — fuente: planilla Firebase");
};
