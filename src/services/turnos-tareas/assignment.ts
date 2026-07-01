import {
  ASEO_RECEPCION_IDS,
  BASURA_DOWS,
  BASURA_SACADA_IDS,
  COCINA_RECEPCION_IDS,
} from "./constants";
import { isEntradaAseoElegible, puedeSacarBasura } from "./hours";
import { getMonthMeta } from "./calendar";
import type { DayMeta, MonthMeta, PlanillaState, TaskKind } from "./types";

const hashMix = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const overrideForDay = (
  overrides: PlanillaState["aseoOverrides"] | undefined,
  day: number
): string | null => {
  if (!overrides) return null;
  return overrides[day] ?? overrides[String(day)] ?? null;
};

const esDiaBasura = (d: DayMeta): boolean =>
  !d.noLaborable && (BASURA_DOWS as readonly number[]).includes(d.dow);

export const buildBasuraPorDia = (
  state: PlanillaState,
  meta: MonthMeta,
  monthKey: string
): Record<number, string> => {
  const map: Record<number, string> = {};
  const counts = Object.fromEntries(BASURA_SACADA_IDS.map((id) => [id, 0]));
  const manual = state.basuraOverrides || {};
  let lastPick: string | null = null;
  const monthSeed = hashMix(`${monthKey}|basura`);

  const days = meta.days.filter(esDiaBasura).sort((a, b) => a.day - b.day);

  for (const d of days) {
    const manualEmp = overrideForDay(manual, d.day);

    if (manualEmp && BASURA_SACADA_IDS.includes(manualEmp as (typeof BASURA_SACADA_IDS)[number])) {
      map[d.day] = manualEmp;
      counts[manualEmp] += 1;
      lastPick = manualEmp;
      continue;
    }

    let eligible = BASURA_SACADA_IDS.filter((id) => {
      const pm = state.cells[id]?.[d.day]?.pm ?? state.cells[id]?.[String(d.day)]?.pm;
      return puedeSacarBasura(pm);
    });

    if (!eligible.length) continue;

    if (lastPick && eligible.length > 1) {
      eligible = eligible.filter((id) => id !== lastPick);
    }

    eligible.sort((a, b) => {
      if (counts[a] !== counts[b]) return counts[a] - counts[b];
      const ia =
        (BASURA_SACADA_IDS.indexOf(a as (typeof BASURA_SACADA_IDS)[number]) + monthSeed) %
        BASURA_SACADA_IDS.length;
      const ib =
        (BASURA_SACADA_IDS.indexOf(b as (typeof BASURA_SACADA_IDS)[number]) + monthSeed) %
        BASURA_SACADA_IDS.length;
      return ia - ib;
    });

    const pick = eligible[0];
    map[d.day] = pick;
    counts[pick] += 1;
    lastPick = pick;
  }

  return map;
};

export const buildAseoRecepcionPorDia = (
  state: PlanillaState,
  meta: MonthMeta,
  monthKey: string,
  basuraMap: Record<number, string> | null = null
): Record<number, string> => {
  const map: Record<number, string> = {};
  const counts = Object.fromEntries(ASEO_RECEPCION_IDS.map((id) => [id, 0]));
  const manual = state.aseoOverrides || {};
  const cocinaManual = state.cocinaOverrides || {};
  const monthSeed = hashMix(monthKey || "");

  const days = meta.days
    .filter((d) => !d.noLaborable && d.dow >= 1 && d.dow <= 6)
    .sort((a, b) => a.day - b.day);

  for (const d of days) {
    const basuraEmp = basuraMap?.[d.day] ?? basuraMap?.[Number(d.day)] ?? null;
    const cocinaEmp = overrideForDay(cocinaManual, d.day);
    const manualEmp = overrideForDay(manual, d.day);

    if (
      manualEmp &&
      ASEO_RECEPCION_IDS.includes(manualEmp as (typeof ASEO_RECEPCION_IDS)[number])
    ) {
      if (manualEmp !== cocinaEmp && (!basuraEmp || manualEmp !== basuraEmp)) {
        map[d.day] = manualEmp;
        counts[manualEmp] += 1;
        continue;
      }
    }

    const eligible = ASEO_RECEPCION_IDS.filter((id) => {
      if (basuraEmp && id === basuraEmp) return false;
      if (cocinaEmp && id === cocinaEmp) return false;
      const am =
        state.cells[id]?.[d.day]?.am ?? state.cells[id]?.[String(d.day)]?.am;
      return isEntradaAseoElegible(am, d.esSabado);
    });

    if (!eligible.length) continue;

    eligible.sort((a, b) => {
      if (counts[a] !== counts[b]) return counts[a] - counts[b];
      const ia =
        (ASEO_RECEPCION_IDS.indexOf(a as (typeof ASEO_RECEPCION_IDS)[number]) + monthSeed) %
        ASEO_RECEPCION_IDS.length;
      const ib =
        (ASEO_RECEPCION_IDS.indexOf(b as (typeof ASEO_RECEPCION_IDS)[number]) + monthSeed) %
        ASEO_RECEPCION_IDS.length;
      return ia - ib;
    });

    const pick = eligible[0];
    map[d.day] = pick;
    counts[pick] += 1;
  }

  return map;
};

export const buildCocinaRecepcionPorDia = (
  state: PlanillaState,
  meta: MonthMeta,
  monthKey: string,
  basuraMap: Record<number, string> | null = null,
  aseoMap: Record<number, string> | null = null
): Record<number, string> => {
  const map: Record<number, string> = {};
  const counts = Object.fromEntries(COCINA_RECEPCION_IDS.map((id) => [id, 0]));
  const manual = state.cocinaOverrides || {};
  const monthSeed = hashMix(`${monthKey}|cocina`);

  const days = meta.days
    .filter((d) => !d.noLaborable && d.dow >= 1 && d.dow <= 6)
    .sort((a, b) => a.day - b.day);

  for (const d of days) {
    const basuraEmp = basuraMap?.[d.day] ?? null;
    const aseoEmp = aseoMap?.[d.day] ?? null;
    const manualEmp = overrideForDay(manual, d.day);

    if (
      manualEmp &&
      COCINA_RECEPCION_IDS.includes(manualEmp as (typeof COCINA_RECEPCION_IDS)[number])
    ) {
      if (manualEmp !== aseoEmp && (!basuraEmp || manualEmp !== basuraEmp)) {
        map[d.day] = manualEmp;
        counts[manualEmp] += 1;
        continue;
      }
    }

    const eligible = COCINA_RECEPCION_IDS.filter((id) => {
      if (basuraEmp && id === basuraEmp) return false;
      if (aseoEmp && id === aseoEmp) return false;
      const am =
        state.cells[id]?.[d.day]?.am ?? state.cells[id]?.[String(d.day)]?.am;
      return isEntradaAseoElegible(am, d.esSabado);
    });

    if (!eligible.length) continue;

    eligible.sort((a, b) => {
      if (counts[a] !== counts[b]) return counts[a] - counts[b];
      const ia =
        (COCINA_RECEPCION_IDS.indexOf(a as (typeof COCINA_RECEPCION_IDS)[number]) +
          monthSeed) %
        COCINA_RECEPCION_IDS.length;
      const ib =
        (COCINA_RECEPCION_IDS.indexOf(b as (typeof COCINA_RECEPCION_IDS)[number]) +
          monthSeed) %
        COCINA_RECEPCION_IDS.length;
      return ia - ib;
    });

    const pick = eligible[0];
    map[d.day] = pick;
    counts[pick] += 1;
  }

  return map;
};

export const buildTaskMaps = (
  state: PlanillaState,
  monthKey: string
): {
  basuraMap: Record<number, string>;
  aseoMap: Record<number, string>;
  cocinaMap: Record<number, string>;
} => {
  const meta = getMonthMeta(monthKey);
  const basuraMap = buildBasuraPorDia(state, meta, monthKey);
  const aseoMap = buildAseoRecepcionPorDia(state, meta, monthKey, basuraMap);
  const cocinaMap = buildCocinaRecepcionPorDia(
    state,
    meta,
    monthKey,
    basuraMap,
    aseoMap
  );
  return { basuraMap, aseoMap, cocinaMap };
};

export const resolveEmpIdForTask = (
  task: TaskKind,
  day: number,
  maps: {
    basuraMap: Record<number, string>;
    aseoMap: Record<number, string>;
    cocinaMap: Record<number, string>;
  }
): string | null => {
  if (task === "ASEO_RECEPCION") return maps.aseoMap[day] ?? null;
  if (task === "COCINA_RECEPCION") return maps.cocinaMap[day] ?? null;
  if (task === "SACAR_BASURA") return maps.basuraMap[day] ?? null;
  return null;
};
