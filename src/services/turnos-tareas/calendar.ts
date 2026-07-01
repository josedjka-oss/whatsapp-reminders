import { FESTIVOS_CO } from "../v8-disponibilidad/constants";
import type { DayMeta, MonthMeta } from "./types";

const pad2 = (n: number): string => String(n).padStart(2, "0");

const toYmd = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const getFestivoSet = (year: number): Set<string> =>
  new Set(FESTIVOS_CO[year] || []);

const esDomingo = (d: Date): boolean => d.getDay() === 0;

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

export const getDayMeta = (fecha: string): DayMeta | null => {
  const monthKey = fecha.slice(0, 7);
  const dayNum = parseInt(fecha.slice(8, 10), 10);
  const meta = getMonthMeta(monthKey);
  return meta.days.find((d) => d.day === dayNum) ?? null;
};
