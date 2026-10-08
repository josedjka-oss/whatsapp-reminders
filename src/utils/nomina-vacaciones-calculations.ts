/**
 * Liquidación de vacaciones — Colombia (CST art. 186–192, referencia habitual).
 * Fórmula: (Salario ordinario × Días trabajados) / 720
 * Un año completo (360 días comerciales) = 15 días de salario.
 * Base: solo salario fijo ordinario — sin auxilio de transporte, horas extras ni recargos.
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isColombiaFestivo } from "./colombia-festivos";
import {
  daysWorkedCommercial,
  formatDateOnly,
  parseDateOnly,
} from "./nomina-prima-calculations";

export const VACACION_DAYS_PER_YEAR = 15;
export const VACACION_DAYS_COMMERCIAL_YEAR = 360;
export const VACACION_FORMULA_DIVISOR = 720;
export const DEFAULT_VACACION_DAYS_WORKED = VACACION_DAYS_COMMERCIAL_YEAR;

const addCalendarDays = (date: Date, delta: number): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + delta);
  return d;
};

/** Inicio del período (inclusive) con exactamente `targetDays` días comerciales hasta `periodEnd`. */
export const periodStartForInclusiveCommercialDays = (
  periodEnd: Date,
  targetDays: number
): Date => {
  const end = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
  if (targetDays <= 1) return end;

  for (let back = 0; back <= 400; back++) {
    const start = addCalendarDays(end, -back);
    if (daysWorkedCommercial(start, end) === targetDays) return start;
  }

  return addCalendarDays(end, -(targetDays - 1));
};

export const todayDateOnlyLocal = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export type VacacionReceiptDetails = {
  periodLabelLong: string;
  vacationStartLabelLong: string | null;
  vacationEndDate: string | null;
  vacationEndLabelLong: string | null;
  vacationBusinessDays: number;
};

export type VacacionCalculation = VacacionReceiptDetails & {
  baseSalary: number;
  periodStart: string;
  periodEnd: string;
  vacationStartDate: string | null;
  daysWorked: number;
  vacationAmount: number;
  equivalentVacationDays: number;
  formula: string;
};

export const formatDateLongEs = (date: Date): string =>
  format(date, "d 'de' MMMM 'de' yyyy", { locale: es });

export const formatPeriodRangeLongEs = (start: Date, end: Date): string =>
  `${formatDateLongEs(start)} al ${formatDateLongEs(end)}`;

/** Día hábil vacaciones: lunes a sábado; no domingo ni festivo. */
export const isVacationBusinessDay = (date: Date): boolean => {
  const dow = date.getDay();
  if (dow === 0) return false;
  return !isColombiaFestivo(date);
};

/** Último día hábil al completar `businessDays` días hábiles desde `start` (inclusive si ese día es hábil). */
export const lastVacationBusinessDay = (
  start: Date,
  businessDays: number
): Date => {
  const n = Math.max(1, Math.round(businessDays));
  let remaining = n;
  let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const maxIter = n * 4 + 400;

  for (let i = 0; i < maxIter; i++) {
    if (isVacationBusinessDay(cur)) {
      remaining -= 1;
      if (remaining === 0) return cur;
    }
    cur = addCalendarDays(cur, 1);
  }

  return cur;
};

export const buildVacacionReceiptDetails = (params: {
  periodStart: Date;
  periodEnd: Date;
  vacationStartDate: Date | null;
  equivalentVacationDays: number;
}): VacacionReceiptDetails => {
  const periodLabelLong = formatPeriodRangeLongEs(
    params.periodStart,
    params.periodEnd
  );
  const vacationBusinessDays = Math.max(
    1,
    Math.round(params.equivalentVacationDays)
  );

  if (!params.vacationStartDate) {
    return {
      periodLabelLong,
      vacationStartLabelLong: null,
      vacationEndDate: null,
      vacationEndLabelLong: null,
      vacationBusinessDays,
    };
  }

  const end = lastVacationBusinessDay(
    params.vacationStartDate,
    vacationBusinessDays
  );

  return {
    periodLabelLong,
    vacationStartLabelLong: formatDateLongEs(params.vacationStartDate),
    vacationEndDate: formatDateOnly(end),
    vacationEndLabelLong: formatDateLongEs(end),
    vacationBusinessDays,
  };
};

export const vacationOrdinarySalary = (baseSalary: number): number =>
  Math.max(0, baseSalary);

export const computeVacacionDaysWorked = (
  periodStart: Date,
  periodEnd: Date
): Pick<VacacionCalculation, "daysWorked" | "periodStart" | "periodEnd"> => {
  if (periodEnd < periodStart) {
    return {
      daysWorked: 0,
      periodStart: formatDateOnly(periodStart),
      periodEnd: formatDateOnly(periodEnd),
    };
  }
  return {
    daysWorked: daysWorkedCommercial(periodStart, periodEnd),
    periodStart: formatDateOnly(periodStart),
    periodEnd: formatDateOnly(periodEnd),
  };
};

export const computeVacacionAmount = (
  baseSalary: number,
  daysWorked: number
): number => {
  if (baseSalary <= 0 || daysWorked <= 0) return 0;
  return Math.round((baseSalary * daysWorked) / VACACION_FORMULA_DIVISOR);
};

export const computeEquivalentVacationDays = (daysWorked: number): number => {
  if (daysWorked <= 0) return 0;
  return Math.round((daysWorked / VACACION_DAYS_COMMERCIAL_YEAR) * VACACION_DAYS_PER_YEAR * 100) / 100;
};

export const buildVacacionFormula = (
  baseSalary: number,
  daysWorked: number,
  vacationAmount: number
): string => {
  const salaryFmt = new Intl.NumberFormat("es-CO").format(Math.round(baseSalary));
  const amountFmt = new Intl.NumberFormat("es-CO").format(vacationAmount);
  return `(${salaryFmt} × ${daysWorked}) / ${VACACION_FORMULA_DIVISOR} = $ ${amountFmt}`;
};

const formatCopMessage = (amount: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

export const buildVacacionWhatsAppMessage = (params: {
  employeeName: string;
  baseSalary: number;
  daysWorked: number;
  vacationAmount: number;
  equivalentVacationDays: number;
  formula: string;
  periodLabelLong: string;
  vacationStartLabelLong: string | null;
  vacationEndLabelLong: string | null;
  vacationBusinessDays: number;
  publicUrl?: string;
}): string => {
  const calcLine = params.formula.includes("=")
    ? params.formula.split("=")[0].trim()
    : params.formula;

  const lines = [
    "Liquidación de vacaciones",
    "",
    `Empleado: ${params.employeeName}`,
    `Período a liquidar: ${params.periodLabelLong}`,
    `Salario ordinario (sin auxilio transporte): ${formatCopMessage(params.baseSalary)}`,
    `Días causados (360/año): ${params.daysWorked}`,
    `Valor vacaciones: ${formatCopMessage(params.vacationAmount)}`,
    `Días hábiles de vacaciones: ${params.vacationBusinessDays} (lun–sáb, sin domingos ni festivos)`,
  ];

  if (params.vacationStartLabelLong) {
    lines.push(`Inicio vacaciones: ${params.vacationStartLabelLong}`);
  }
  if (params.vacationEndLabelLong) {
    lines.push(`Último día hábil de vacaciones: ${params.vacationEndLabelLong}`);
  }

  lines.push("", `Cálculo: ${calcLine}`);

  if (params.publicUrl) {
    lines.push("", `Recibo: ${params.publicUrl}`);
  }

  return lines.join("\n");
};

export const computeVacacionForEmployee = (params: {
  baseSalary: number;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  daysWorked?: number;
  vacationStartDate?: Date | null;
}): VacacionCalculation => {
  const baseSalary = vacationOrdinarySalary(params.baseSalary);
  const periodEnd =
    params.periodEnd ??
    todayDateOnlyLocal();
  const daysWorked =
    params.daysWorked != null && params.daysWorked > 0
      ? Math.round(params.daysWorked)
      : params.periodStart
        ? computeVacacionDaysWorked(params.periodStart, periodEnd).daysWorked
        : DEFAULT_VACACION_DAYS_WORKED;

  const periodStart =
    params.periodStart ??
    periodStartForInclusiveCommercialDays(periodEnd, daysWorked);

  const daysInfo = {
    daysWorked,
    periodStart: formatDateOnly(periodStart),
    periodEnd: formatDateOnly(periodEnd),
  };

  const vacationAmount = computeVacacionAmount(baseSalary, daysInfo.daysWorked);
  const equivalentVacationDays = computeEquivalentVacationDays(daysInfo.daysWorked);
  const receipt = buildVacacionReceiptDetails({
    periodStart,
    periodEnd,
    vacationStartDate: params.vacationStartDate ?? null,
    equivalentVacationDays,
  });

  return {
    baseSalary,
    ...daysInfo,
    vacationStartDate: params.vacationStartDate
      ? formatDateOnly(params.vacationStartDate)
      : null,
    vacationAmount,
    equivalentVacationDays,
    formula: buildVacacionFormula(baseSalary, daysInfo.daysWorked, vacationAmount),
    ...receipt,
  };
};

export const enrichVacacionBreakdown = (
  row: {
    periodStart: Date;
    periodEnd: Date;
    vacationStartDate: Date | null;
    equivalentDays: number;
    breakdown: unknown;
  }
): VacacionReceiptDetails & { formula?: string } => {
  const stored = (row.breakdown ?? {}) as Partial<VacacionCalculation>;
  if (stored.periodLabelLong && stored.vacationBusinessDays != null) {
    return stored as VacacionReceiptDetails & { formula?: string };
  }
  const equivalentVacationDays = Number(row.equivalentDays);
  return {
    ...buildVacacionReceiptDetails({
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      vacationStartDate: row.vacationStartDate,
      equivalentVacationDays,
    }),
    formula: stored.formula,
  };
};

export const parseVacacionDates = (params: {
  periodStart?: string | null;
  periodEnd?: string | null;
  daysWorked?: number | string | null;
  vacationStartDate?: string | null;
}): {
  periodStart: Date | null;
  periodEnd: Date;
  daysWorked: number;
  vacationStartDate: Date | null;
} | { error: string } => {
  const rawDays = params.daysWorked;
  const daysWorked =
    rawDays === undefined || rawDays === null || rawDays === ""
      ? DEFAULT_VACACION_DAYS_WORKED
      : Math.round(Number(rawDays));

  if (!Number.isFinite(daysWorked) || daysWorked <= 0) {
    return { error: "daysWorked debe ser un entero positivo" };
  }

  const periodEnd =
    parseDateOnly(params.periodEnd ?? "") ?? todayDateOnlyLocal();
  const periodStart = params.periodStart
    ? parseDateOnly(params.periodStart)
    : null;

  if (params.periodStart && !periodStart) {
    return { error: "periodStart inválido (YYYY-MM-DD)" };
  }

  const vacationStartDate = params.vacationStartDate
    ? parseDateOnly(params.vacationStartDate)
    : null;
  if (params.vacationStartDate && !vacationStartDate) {
    return { error: "vacationStartDate inválido (YYYY-MM-DD)" };
  }

  return { periodStart, periodEnd, daysWorked, vacationStartDate };
};

export const VACACION_EXAMPLE_MIGUEL = computeVacacionForEmployee({
  baseSalary: 2_000_000,
  daysWorked: DEFAULT_VACACION_DAYS_WORKED,
  periodEnd: parseDateOnly("2026-06-30")!,
  vacationStartDate: parseDateOnly("2026-07-01"),
});
