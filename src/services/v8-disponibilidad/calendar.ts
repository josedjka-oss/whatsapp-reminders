import { FESTIVOS_CO } from "./constants";
import type { DayMeta, MonthMeta } from "./types";

const pad2 = (n: number): string => String(n).padStart(2, "0");

const toYmd = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const getFestivoSet = (year: number): Set<string> =>
  new Set(FESTIVOS_CO[year] || []);

const esDomingo = (d: Date): boolean => d.getDay() === 0;

export const getMonthKeyFromDate = (fecha: string): string => fecha.slice(0, 7);

export const getMonthMeta = (monthKey: string): MonthMeta => {
  const [y, m] = monthKey.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const festivoSet = getFestivoSet(y);
  const days: DayMeta[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const dt = new Date(y, m - 1, day);
    const ymd = toYmd(dt);
    const dow = dt.getDay();
    const esFestivo = !esDomingo(dt) && festivoSet.has(ymd);
    days.push({
      day,
      ymd,
      dow,
      noLaborable: esDomingo(dt) || esFestivo,
      festivo: esFestivo,
      esSabado: dow === 6,
      inMonth: true,
    });
  }

  return { year: y, month: m, lastDay, days };
};

export const getDayMeta = (fecha: string, meta: MonthMeta): DayMeta | null => {
  const d = meta.days.find((x) => x.ymd === fecha);
  return d ?? null;
};

export const sabadoIndexEnMes = (meta: MonthMeta, d: DayMeta): number => {
  if (!d.day) return 0;
  return meta.days.filter(
    (x) => x.esSabado && !x.noLaborable && x.day != null && x.day < d.day!
  ).length;
};
