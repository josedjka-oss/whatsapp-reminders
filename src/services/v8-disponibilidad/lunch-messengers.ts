import {
  ALMUERZOS_MENSAJEROS,
  ALMUERZOS_SABADO,
  GRUPO_MENSAJEROS,
  MINUTOS_ALMUERZO_LUN_VIE,
  MINUTOS_ALMUERZO_SAB,
} from "./constants";
import type { MessengerEmpId } from "./types";
import { sabadoIndexEnMes } from "./calendar";
import { normAm } from "./hours";
import type { DayMeta, MonthMeta, PlanillaState } from "./types";

const PERMS6 = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

const hashDia = (monthKey: string, d: DayMeta, salt: string): number => {
  let h = 2166136261;
  const s = `${monthKey}|${d.ymd}|${d.day}|${d.dow}|${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const rotateRoster = <T>(ordered: T[], start: number): T[] => [
  ...ordered.slice(start),
  ...ordered.slice(0, start),
];

const getAusenteTrio = (state: PlanillaState, dayNum: number): MessengerEmpId | null => {
  const raw =
    state.trioAusentePorDia?.[dayNum] ?? state.trioAusentePorDia?.[String(dayNum)];
  if (!raw || !GRUPO_MENSAJEROS.includes(raw as MessengerEmpId)) return null;
  return raw as MessengerEmpId;
};

const assignTrioSabadoLunch = (
  ids: MessengerEmpId[],
  d: DayMeta,
  meta: MonthMeta
): Record<string, string> => {
  const ordered = [...ids].sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
  const satIdx = sabadoIndexEnMes(meta, d);
  const queue = rotateRoster(ordered, satIdx % ordered.length);
  const out: Record<string, string> = {};
  queue.forEach((id, pos) => {
    out[id] = ALMUERZOS_SABADO[pos];
  });
  return out;
};

const getLunchTrioDos = (
  state: PlanillaState,
  ids: MessengerEmpId[],
  d: DayMeta,
  monthKey: string,
  meta: MonthMeta
): Record<string, string> => {
  const dayNum = d.day!;
  if (d.esSabado) return assignTrioSabadoLunch(ids, d, meta);

  const conDiez = ids.filter((id) => normAm(state.cells[id]?.[dayNum]) === "10");
  const out: Record<string, string> = {};

  if (conDiez.length === 1) {
    out[conDiez[0]] = "2:00";
    const otro = ids.find((x) => x !== conDiez[0])!;
    const flip = hashDia(monthKey, d, `trio2|${conDiez[0]}`) & 1;
    out[otro] = flip ? "1:00" : "12:00";
  } else {
    const ordered = [...ids].sort(
      (a, b) => GRUPO_MENSAJEROS.indexOf(a) - GRUPO_MENSAJEROS.indexOf(b)
    );
    const flip =
      (hashDia(monthKey, d, "trio2-a") ^
        hashDia(monthKey, d, "trio2-b") ^
        d.day! ^
        (d.dow << 3)) &
      1;
    out[ordered[0]] = flip ? "1:00" : "12:00";
    out[ordered[1]] = flip ? "12:00" : "1:00";
  }

  return out;
};

export const getLunchTrio = (
  state: PlanillaState,
  d: DayMeta,
  monthKey: string,
  meta: MonthMeta
): Record<string, string> => {
  const dayNum = d.day!;
  const ausente = getAusenteTrio(state, dayNum);
  const ids: MessengerEmpId[] = ausente
    ? GRUPO_MENSAJEROS.filter((x) => x !== ausente)
    : [...GRUPO_MENSAJEROS];

  if (ids.length === 2) return getLunchTrioDos(state, ids, d, monthKey, meta);

  if (d.esSabado) return assignTrioSabadoLunch(ids, d, meta);

  const conDiez = ids.filter((id) => normAm(state.cells[id]?.[dayNum]) === "10");
  const conNueve = ids.filter((id) => normAm(state.cells[id]?.[dayNum]) !== "10");
  const out: Record<string, string> = {};

  if (conDiez.length === 1) {
    out[conDiez[0]] = "2:00";
    const ordered = [...conNueve].sort(
      (a, b) => GRUPO_MENSAJEROS.indexOf(a) - GRUPO_MENSAJEROS.indexOf(b)
    );
    const flip = hashDia(monthKey, d, `trio|${conDiez[0]}`) & 1;
    out[ordered[0]] = flip ? "1:00" : "12:00";
    out[ordered[1]] = flip ? "12:00" : "1:00";
  } else {
    const perm = PERMS6[hashDia(monthKey, d, "trio-roll3") % 6];
    ids.forEach((id, i) => {
      out[id] = ALMUERZOS_MENSAJEROS[perm[i]];
    });
    conDiez.forEach((id) => {
      out[id] = "2:00";
      const others = ids
        .filter((x) => x !== id)
        .sort((a, b) => GRUPO_MENSAJEROS.indexOf(a) - GRUPO_MENSAJEROS.indexOf(b));
      const flip = hashDia(monthKey, d, `trio-sub|${id}`) & 1;
      out[others[0]] = flip ? "1:00" : "12:00";
      out[others[1]] = flip ? "12:00" : "1:00";
    });
  }

  return out;
};

const normalizeSingleLunchTime = (raw: string): string => {
  let s = String(raw ?? "").trim().toLowerCase().replace(/\s/g, "");
  if (!s) return "";

  const shortcuts: Record<string, string> = {
    "12": "12:00",
    "12:0": "12:00",
    "12:00": "12:00",
    "1": "1:00",
    "1:0": "1:00",
    "1:00": "1:00",
    "2": "2:00",
    "2:0": "2:00",
    "2:00": "2:00",
    "12:30": "12:30",
    "1:30": "1:30",
  };
  if (shortcuts[s]) return shortcuts[s];

  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(s);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const mi = m[2] != null ? parseInt(m[2], 10) : 0;
  if (Number.isNaN(h) || Number.isNaN(mi) || mi < 0 || mi > 59) return "";
  if (h === 13) h = 1;
  else if (h === 14) h = 2;
  else if (h === 15) h = 3;
  else if (h === 16) h = 4;
  if (h < 1 || h > 12) return "";
  return mi === 0 ? `${h}:00` : `${h}:${String(mi).padStart(2, "0")}`;
};

export const normalizeLunchTime = (raw: string): string => {
  const s = String(raw ?? "").trim();
  if (!s) return "";

  const rangeMatch = /^(.+?)\s*(?:-|–|—|a|to)\s*(.+)$/i.exec(s);
  if (rangeMatch) {
    const start = normalizeSingleLunchTime(rangeMatch[1]);
    const end = normalizeSingleLunchTime(rangeMatch[2]);
    if (start && end) return `${start}-${end}`;
    if (start) return start;
  }

  return normalizeSingleLunchTime(s) || s;
};

export const lunchTimeToMinutes = (raw: string): number => {
  const t = normalizeSingleLunchTime(raw);
  if (!t) return 13 * 60;
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const mi = parseInt(mStr || "0", 10);
  if (h >= 1 && h <= 11) h += 12;
  return h * 60 + mi;
};

export const parseLunchRange = (
  franja: string,
  esSabado: boolean
): { startMin: number; endMin: number } => {
  const duracion = esSabado ? MINUTOS_ALMUERZO_SAB : MINUTOS_ALMUERZO_LUN_VIE;
  const endFromStart = (startMin: number): number => startMin + duracion;

  const s = String(franja ?? "").trim();
  const parts = s.split(/\s*(?:-|–|—|a)\s*/i);
  if (parts.length >= 2 && parts[1].trim()) {
    const start = lunchTimeToMinutes(parts[0]);
    const end = lunchTimeToMinutes(parts[1]);
    return { startMin: start, endMin: end > start ? end : endFromStart(start) };
  }
  const start = lunchTimeToMinutes(s);
  return { startMin: start, endMin: endFromStart(start) };
};

export const getLunchOverride = (
  state: PlanillaState,
  empId: MessengerEmpId,
  day: number
): string => {
  const ov =
    state.lunchOverrides?.[empId]?.[day] ??
    state.lunchOverrides?.[empId]?.[String(day)];
  if (ov == null || String(ov).trim() === "") return "";
  return normalizeLunchTime(String(ov));
};

export const getEffectiveLunchForMessenger = (
  state: PlanillaState,
  empId: MessengerEmpId,
  d: DayMeta,
  monthKey: string,
  meta: MonthMeta
): string => {
  const override = getLunchOverride(state, empId, d.day!);
  if (override) return override;

  const map = getLunchTrio(state, d, monthKey, meta);
  return map[empId] ?? "1:00";
};

export const minutesToFechaHoraParts = (
  fecha: string,
  totalMin: number
): { fechaHora: string; hour: number; minute: number } => {
  const hour = Math.floor(totalMin / 60);
  const minute = totalMin % 60;
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return {
    fechaHora: `${fecha}T${h}:${m}:00`,
    hour,
    minute,
  };
};
