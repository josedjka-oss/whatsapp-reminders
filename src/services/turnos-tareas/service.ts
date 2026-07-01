import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { prisma } from "../../db";
import { sendWhatsAppMessage } from "../twilio";
import { normalizeWhatsAppPhoneNumber } from "../../utils/whatsapp-phone-normalize";
import {
  buildTaskMaps,
  resolveEmpIdForTask,
} from "./assignment";
import { getDayMeta, getMonthMeta } from "./calendar";
import {
  APP_TIMEZONE,
  EMPLOYEE_NAMES,
  TASK_LABELS,
  TASK_ORDER,
} from "./constants";
import { loadEmployeePhone, loadPlanillaMonthFull } from "./firestore";
import {
  isTaskApplicableOnDay,
  isTaskDueNow,
  scheduledTimeLabel,
} from "./schedule";
import type {
  DayTasksPreview,
  PlanillaState,
  TaskAssignment,
  TaskKind,
} from "./types";

const buildReminderBody = (task: TaskKind, fecha: string): string => {
  const anchor = new Date(`${fecha}T12:00:00-05:00`);
  const datePart = formatInTimeZone(anchor, APP_TIMEZONE, "EEEE d 'de' MMMM yyyy", {
    locale: es,
  });
  const day = getDayMeta(fecha);
  const timePart = day ? scheduledTimeLabel(task, day) : "9:00 a.m.";
  return `${TASK_LABELS[task]} — ${datePart}, ${timePart}`;
};

export const isTurnosTareasEnabled = (): boolean =>
  process.env.TURNOS_TAREAS_ENABLED !== "false";

const ensureContact = async (
  phone: string,
  name: string
): Promise<{ ok: true } | { ok: false; reason: string }> => {
  const normalized = normalizeWhatsAppPhoneNumber(phone);
  const existing = await prisma.contact.findUnique({ where: { phone: normalized } });
  if (existing) return { ok: true };

  try {
    await prisma.contact.create({
      data: { name, phone: normalized },
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: `Teléfono ${normalized} no está en contactos Render y no se pudo registrar`,
    };
  }
};

export const previewTasksForDate = async (
  fecha: string
): Promise<DayTasksPreview> => {
  const day = getDayMeta(fecha);
  if (!day) {
    return {
      date: fecha,
      noLaborable: true,
      tasks: TASK_ORDER.map((task) => ({
        task,
        empId: null,
        employeeName: null,
        phone: null,
        scheduledTime: "",
        wouldSend: false,
        reason: "Fecha inválida",
      })),
    };
  }

  const monthKey = fecha.slice(0, 7);
  const state = await loadPlanillaMonthFull(monthKey);
  if (!state?.cells || Object.keys(state.cells).length === 0) {
    return {
      date: fecha,
      noLaborable: day.noLaborable,
      tasks: TASK_ORDER.map((task) => ({
        task,
        empId: null,
        employeeName: null,
        phone: null,
        scheduledTime: scheduledTimeLabel(task, day) || "",
        wouldSend: false,
        reason: "Planilla no guardada en Firebase para este mes",
      })),
    };
  }

  const maps = buildTaskMaps(state, monthKey);
  const tasks: TaskAssignment[] = [];

  for (const task of TASK_ORDER) {
    const scheduledTime = scheduledTimeLabel(task, day) || "";
    if (!isTaskApplicableOnDay(task, day)) {
      tasks.push({
        task,
        empId: null,
        employeeName: null,
        phone: null,
        scheduledTime,
        wouldSend: false,
        reason: day.noLaborable ? "Día no laborable / festivo" : "No aplica este día",
      });
      continue;
    }

    const empId = resolveEmpIdForTask(task, day.day, maps);
    if (!empId) {
      tasks.push({
        task,
        empId: null,
        employeeName: null,
        phone: null,
        scheduledTime,
        wouldSend: false,
        reason: "Sin responsable asignado en planilla",
      });
      continue;
    }

    const phone = await loadEmployeePhone(empId);
    const employeeName = EMPLOYEE_NAMES[empId] || empId;
    tasks.push({
      task,
      empId,
      employeeName,
      phone,
      scheduledTime,
      wouldSend: Boolean(phone),
      reason: phone ? null : "Sin teléfono en empleadosTelefonos (Firebase)",
    });
  }

  return { date: fecha, noLaborable: day.noLaborable, tasks };
};

const alreadySentToday = async (
  fecha: string,
  task: TaskKind,
  phone: string
): Promise<boolean> => {
  const prefix = TASK_LABELS[task];
  const [year, month, dayNum] = fecha.split("-").map(Number);
  const startOfDay = new Date(Date.UTC(year, month - 1, dayNum, 5, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, dayNum + 1, 4, 59, 59, 999));

  const existing = await prisma.message.findFirst({
    where: {
      direction: "outbound",
      to: phone,
      body: { startsWith: prefix },
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
  });

  return Boolean(existing);
};

export const sendTaskForDate = async (
  fecha: string,
  task: TaskKind,
  options: { force?: boolean } = {}
): Promise<{
  ok: boolean;
  skipped?: boolean;
  empId?: string | null;
  phone?: string | null;
  twilioSid?: string;
  reason?: string;
  error?: string;
}> => {
  const preview = await previewTasksForDate(fecha);
  const item = preview.tasks.find((t) => t.task === task);
  if (!item) {
    return { ok: false, error: "Tarea desconocida" };
  }
  if (!item.wouldSend) {
    return { ok: false, skipped: true, reason: item.reason || "No se enviaría" };
  }

  const phone = normalizeWhatsAppPhoneNumber(item.phone!);
  const contactCheck = await ensureContact(phone, item.employeeName || item.empId!);
  if (!contactCheck.ok) {
    return { ok: false, error: contactCheck.reason };
  }

  if (!options.force && (await alreadySentToday(fecha, task, phone))) {
    return {
      ok: true,
      skipped: true,
      empId: item.empId,
      phone,
      reason: "Ya enviado hoy para esta tarea",
    };
  }

  const reminderText = buildReminderBody(task, fecha);
  try {
    const twilioSid = await sendWhatsAppMessage({ to: phone, reminderText });
    return {
      ok: true,
      empId: item.empId,
      phone,
      twilioSid,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, empId: item.empId, phone, error: message };
  }
};

export const processDueTasks = async (): Promise<void> => {
  if (!isTurnosTareasEnabled()) return;

  const now = new Date();
  const fecha = formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd");
  const hour = parseInt(formatInTimeZone(now, APP_TIMEZONE, "H"), 10);
  const minute = parseInt(formatInTimeZone(now, APP_TIMEZONE, "m"), 10);
  const day = getDayMeta(fecha);
  if (!day || day.noLaborable) return;

  for (const task of TASK_ORDER) {
    if (!isTaskDueNow(task, day, hour, minute)) continue;

    const result = await sendTaskForDate(fecha, task);
    if (result.ok && !result.skipped) {
      console.log(
        `[TURNOS-TAREAS] ✅ ${task} → ${result.empId} (${result.phone}) sid=${result.twilioSid}`
      );
    } else if (result.skipped) {
      console.log(`[TURNOS-TAREAS] ⏭️ ${task} omitido: ${result.reason}`);
    } else {
      console.warn(`[TURNOS-TAREAS] ❌ ${task}: ${result.error || result.reason}`);
    }
  }
};

/** Para tests: asignación con state en memoria */
export const previewWithState = (
  fecha: string,
  state: PlanillaState
): Omit<DayTasksPreview, "tasks"> & { maps: ReturnType<typeof buildTaskMaps> } => {
  const monthKey = fecha.slice(0, 7);
  const day = getDayMeta(fecha);
  const maps = buildTaskMaps(state, monthKey);
  return {
    date: fecha,
    noLaborable: day?.noLaborable ?? true,
    maps,
  };
};

export { getMonthMeta };
