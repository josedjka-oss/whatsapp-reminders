import type { DayMeta, TaskKind } from "./types";

/** Horario de envío por tarea — única fuente en Render */
export const scheduledTimeLabel = (task: TaskKind, day: DayMeta): string | null => {
  if (day.noLaborable) return null;

  if (task === "SACAR_BASURA") {
    if (![1, 3, 5].includes(day.dow)) return null;
    return "6:00 p.m.";
  }

  if (task === "ASEO_RECEPCION" || task === "COCINA_RECEPCION") {
    if (day.dow < 1 || day.dow > 6) return null;
    return day.esSabado ? "9:30 a.m." : "9:00 a.m.";
  }

  return null;
};

export const isTaskApplicableOnDay = (task: TaskKind, day: DayMeta): boolean =>
  scheduledTimeLabel(task, day) !== null;

/** Minutos desde medianoche (Bogotá) en que debe enviarse */
export const scheduledMinutes = (task: TaskKind, day: DayMeta): number | null => {
  const label = scheduledTimeLabel(task, day);
  if (!label) return null;
  if (label.startsWith("6:")) return 18 * 60;
  if (label.startsWith("9:30")) return 9 * 60 + 30;
  return 9 * 60;
};

export const isTaskDueNow = (
  task: TaskKind,
  day: DayMeta,
  hour: number,
  minute: number
): boolean => {
  const target = scheduledMinutes(task, day);
  if (target === null) return false;
  const now = hour * 60 + minute;
  return now >= target;
};
