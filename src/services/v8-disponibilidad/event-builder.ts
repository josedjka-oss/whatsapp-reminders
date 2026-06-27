import { formatInTimeZone } from "date-fns-tz";
import {
  APP_TIMEZONE,
  GRUPO_MENSAJEROS,
  MENSAJERO_V8_BY_EMP,
} from "./constants";
import type { MessengerEmpId } from "./types";
import { getDayMeta, getMonthKeyFromDate, getMonthMeta } from "./calendar";
import {
  formatEventIdSuffix,
  formatFechaHora,
  hourDecimalToTimeParts,
  normAm,
  normPm,
  parseAm,
} from "./hours";
import {
  getEffectiveLunchForMessenger,
  minutesToFechaHoraParts,
  parseLunchRange,
} from "./lunch-messengers";
import type {
  DayMeta,
  PlanillaState,
  V8DisponibilidadEvento,
} from "./types";

const esAusenteTrio = (
  state: PlanillaState,
  empId: MessengerEmpId,
  dayNum: number
): boolean => {
  const raw =
    state.trioAusentePorDia?.[dayNum] ?? state.trioAusentePorDia?.[String(dayNum)];
  return String(raw) === empId;
};

const esDiaMarcadoNoLab = (
  state: PlanillaState,
  empId: MessengerEmpId,
  dayNum: number
): boolean =>
  Boolean(
    state.flagsDiaMarcadoNoLab?.[empId]?.[dayNum] ??
      state.flagsDiaMarcadoNoLab?.[empId]?.[String(dayNum)]
  );

const esEntradaAusenteCero = (am: string | undefined): boolean => {
  const v = String(am ?? "").trim();
  return v === "0" || v === "00";
};

const trabajaMensajeroDia = (
  state: PlanillaState,
  empId: MessengerEmpId,
  d: DayMeta
): boolean => {
  if (d.noLaborable || d.day == null) return false;
  if (esAusenteTrio(state, empId, d.day)) return false;
  if (esDiaMarcadoNoLab(state, empId, d.day)) return false;

  const cell =
    state.cells[empId]?.[d.day] ?? state.cells[empId]?.[String(d.day)];
  if (!cell) return false;

  const am = String(cell.am ?? "").trim();
  const pm = String(cell.pm ?? "").trim();
  if (!am && !pm) return false;
  if (esEntradaAusenteCero(am)) return false;

  return parseAm(am) != null && parseAm(am)! > 0;
};

const buildEventId = (
  fecha: string,
  mensajero: number,
  tipo: "act" | "des",
  suffix: string
): string => {
  const compact = fecha.replace(/-/g, "");
  return `wa_${compact}_m${mensajero}_${tipo}_${suffix}`;
};

const pushEvent = (
  eventos: V8DisponibilidadEvento[],
  params: {
    fecha: string;
    mensajero: number;
    disponible: boolean;
    hour: number;
    minute: number;
    motivo: string;
    tipo: "act" | "des";
  }
): void => {
  const suffix = formatEventIdSuffix(params.hour, params.minute);
  eventos.push({
    id: buildEventId(params.fecha, params.mensajero, params.tipo, suffix),
    mensajero: params.mensajero,
    disponible: params.disponible,
    fechaHora: formatFechaHora(params.fecha, params.hour, params.minute),
    motivo: params.motivo,
  });
};

export const buildEventsForMessengerDay = (
  state: PlanillaState,
  empId: MessengerEmpId,
  fecha: string,
  d: DayMeta,
  monthKey: string
): V8DisponibilidadEvento[] => {
  if (!trabajaMensajeroDia(state, empId, d)) return [];

  const dayNum = d.day!;
  const cell =
    state.cells[empId]?.[dayNum] ?? state.cells[empId]?.[String(dayNum)];
  const mensajero = MENSAJERO_V8_BY_EMP[empId];
  const eventos: V8DisponibilidadEvento[] = [];
  const amNorm = normAm(cell);
  const pmNorm = normPm(cell);
  const entrada = parseAm(amNorm);

  if (entrada == null) return [];

  // Antes de entrada si entra a las 10
  if (amNorm === "10") {
    pushEvent(eventos, {
      fecha,
      mensajero,
      disponible: false,
      hour: 9,
      minute: 0,
      motivo: "No disponible",
      tipo: "des",
    });
  }

  // Entrada → disponible
  const entradaParts = hourDecimalToTimeParts(entrada);
  pushEvent(eventos, {
    fecha,
    mensajero,
    disponible: true,
    hour: entradaParts.h,
    minute: entradaParts.m,
    motivo: "Disponible",
    tipo: "act",
  });

  // Almuerzo (planilla) = no disponible al inicio, disponible al fin (V8 solo ve flags)
  const meta = getMonthMeta(monthKey);
  const lunchFranja = getEffectiveLunchForMessenger(state, empId, d, monthKey, meta);
  const { startMin, endMin } = parseLunchRange(lunchFranja, d.esSabado);
  const lunchStart = minutesToFechaHoraParts(fecha, startMin);
  const lunchEnd = minutesToFechaHoraParts(fecha, endMin);

  pushEvent(eventos, {
    fecha,
    mensajero,
    disponible: false,
    hour: lunchStart.hour,
    minute: lunchStart.minute,
    motivo: "No disponible",
    tipo: "des",
  });

  pushEvent(eventos, {
    fecha,
    mensajero,
    disponible: true,
    hour: lunchEnd.hour,
    minute: lunchEnd.minute,
    motivo: "Disponible",
    tipo: "act",
  });

  // Salida pm=5 → 17:00
  if (pmNorm === "5") {
    pushEvent(eventos, {
      fecha,
      mensajero,
      disponible: false,
      hour: 17,
      minute: 0,
      motivo: "No disponible",
      tipo: "des",
    });
  }

  return eventos;
};

export const buildEventsForDay = (
  state: PlanillaState,
  fecha: string
): V8DisponibilidadEvento[] => {
  const monthKey = getMonthKeyFromDate(fecha);
  const meta = getMonthMeta(monthKey);
  const d = getDayMeta(fecha, meta);
  if (!d || d.noLaborable) return [];

  const all: V8DisponibilidadEvento[] = [];
  for (const empId of GRUPO_MENSAJEROS) {
    all.push(...buildEventsForMessengerDay(state, empId, fecha, d, monthKey));
  }

  all.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  return all;
};

export const filterEventsAtMinute = (
  eventos: V8DisponibilidadEvento[],
  fecha: string,
  hour: number,
  minute: number
): V8DisponibilidadEvento[] => {
  const target = formatFechaHora(fecha, hour, minute);
  return eventos.filter((e) => e.fechaHora === target);
};

/** Omite eventos cuya hora ya pasó (solo aplica si fecha es hoy en Bogotá). */
export const filterEventsNotBeforeNow = (
  eventos: V8DisponibilidadEvento[],
  fecha: string,
  now: Date = new Date()
): V8DisponibilidadEvento[] => {
  const today = formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd");
  if (fecha < today) return [];
  if (fecha > today) return eventos;
  const cutoff = formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd'T'HH:mm:00");
  return eventos.filter((e) => e.fechaHora >= cutoff);
};
