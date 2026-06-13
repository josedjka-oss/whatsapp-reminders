/**
 * Cálculos de nómina Colombia (referencia laboral habitual).
 * Hora ordinaria mensual = salario / baseHorasMensuales
 * Hora extra diurna = hora ordinaria × 1.25 (recargo 25%)
 */
export const DEFAULT_MONTHLY_HOURS_BASE = 240;
export const DAYTIME_OVERTIME_MULTIPLIER = 1.25;

export type BonusFrequency = "QUINCENAL" | "MENSUAL";

export const normalizeBonusFrequency = (raw: unknown): BonusFrequency => {
  const s = String(raw ?? "QUINCENAL").toUpperCase();
  return s === "MENSUAL" ? "MENSUAL" : "QUINCENAL";
};

export const normalizeMonthlyHoursBase = (raw: unknown): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MONTHLY_HOURS_BASE;
  return Math.round(n);
};

export const hourlyRateFromMonthlySalary = (
  monthlySalary: number,
  monthlyHoursBase = DEFAULT_MONTHLY_HOURS_BASE
): number => monthlySalary / monthlyHoursBase;

export const calculateDaytimeOvertimePay = (
  monthlySalary: number,
  daytimeHours: number,
  monthlyHoursBase = DEFAULT_MONTHLY_HOURS_BASE
): number => {
  if (daytimeHours <= 0 || monthlySalary <= 0) return 0;
  const hourly = hourlyRateFromMonthlySalary(monthlySalary, monthlyHoursBase);
  return Math.round(daytimeHours * hourly * DAYTIME_OVERTIME_MULTIPLIER);
};

/** Salario y auxilio se pagan en ambas quincenas (mitad cada una). */
export const grossSalaryForHalf = (monthlySalary: number): number =>
  monthlySalary / 2;

export const grossTransportForHalf = (monthlyTransport: number): number =>
  monthlyTransport / 2;

/**
 * Bonificación según frecuencia:
 * - QUINCENAL: mitad en día 15 y mitad fin de mes
 * - MENSUAL: completa solo fin de mes (quincena 2)
 */
export const grossBonusForHalf = (
  monthlyBonus: number,
  half: 1 | 2,
  frequency: BonusFrequency
): number => {
  if (monthlyBonus <= 0) return 0;
  if (frequency === "MENSUAL") {
    return half === 2 ? monthlyBonus : 0;
  }
  return monthlyBonus / 2;
};

/** Horas extras del mes se liquidan en la 2da quincena. */
export const grossOvertimeForHalf = (
  monthlySalary: number,
  daytimeHours: number,
  half: 1 | 2,
  monthlyHoursBase = DEFAULT_MONTHLY_HOURS_BASE
): number => {
  if (half !== 2) return 0;
  return calculateDaytimeOvertimePay(
    monthlySalary,
    daytimeHours,
    monthlyHoursBase
  );
};
