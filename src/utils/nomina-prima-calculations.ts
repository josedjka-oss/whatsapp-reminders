/**
 * Prima de servicios — Colombia (referencia habitual).
 * Fórmula: ((Salario + auxilio transporte) × Días trabajados en el semestre) / 360
 *
 * Convención: cada mes = 30 días; semestre completo = 180 días (6 × 30).
 * Semestre 1: 1 ene – 30 jun | Semestre 2: 1 jul – 31 dic
 */

export type PrimaSemester = 1 | 2;

export const DAYS_PER_MONTH = 30;
export const DAYS_FULL_SEMESTER = 180;

export type SemesterBounds = {
  start: Date;
  end: Date;
  label: string;
};

export type PrimaCalculation = {
  year: number;
  semester: PrimaSemester;
  semesterLabel: string;
  baseSalary: number;
  transportAllowance: number;
  monthlySalary: number;
  hireDate: string | null;
  effectiveStart: string;
  effectiveEnd: string;
  daysWorked: number;
  primaAmount: number;
  formula: string;
};

/** Base mensual para prima = salario + auxilio de transporte. */
export const primaMonthlyBase = (
  baseSalary: number,
  transportAllowance = 0
): number => Math.max(0, baseSalary) + Math.max(0, transportAllowance);

/** Día dentro del mes comercial (1–30; día 31 → 30). */
export const toCommercialDay = (day: number): number =>
  Math.max(1, Math.min(DAYS_PER_MONTH, day));

/** Días del mes comercial desde `fromDay` hasta fin de mes (30). */
export const daysFromCommercialDayToMonthEnd = (fromDay: number): number => {
  const d = toCommercialDay(fromDay);
  return DAYS_PER_MONTH - d + 1;
};

/**
 * Días trabajados entre dos fechas con meses de 30 días (convención 360).
 * Inclusive en inicio y fin.
 */
export const daysWorkedCommercial = (start: Date, end: Date): number => {
  if (end < start) return 0;

  const startDay = toCommercialDay(start.getDate());
  const endDay = toCommercialDay(end.getDate());
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return endDay - startDay + 1;
  }

  let total = daysFromCommercialDayToMonthEnd(startDay);

  let month = startMonth + 1;
  let year = startYear;
  while (year < endYear || (year === endYear && month < endMonth)) {
    total += DAYS_PER_MONTH;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  total += endDay;
  return total;
};

export const parseDateOnly = (raw: string | Date | null | undefined): Date | null => {
  if (!raw) return null;
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null;
    return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());
  }
  const s = String(raw).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(y, m - 1, d);
};

export const formatDateOnly = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getSemesterBounds = (
  year: number,
  semester: PrimaSemester
): SemesterBounds => {
  if (semester === 1) {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 5, 30),
      label: `1 ene – 30 jun ${year} (180 días)`,
    };
  }
  return {
    start: new Date(year, 6, 1),
    end: new Date(year, 11, 31),
    label: `1 jul – 31 dic ${year} (180 días)`,
  };
};

export const computePrimaDaysWorked = (
  hireDate: Date | null,
  year: number,
  semester: PrimaSemester
): Pick<
  PrimaCalculation,
  "daysWorked" | "effectiveStart" | "effectiveEnd" | "semesterLabel"
> => {
  const bounds = getSemesterBounds(year, semester);
  const effectiveStart =
    hireDate && hireDate > bounds.start ? hireDate : bounds.start;

  if (effectiveStart > bounds.end) {
    return {
      daysWorked: 0,
      effectiveStart: formatDateOnly(effectiveStart),
      effectiveEnd: formatDateOnly(bounds.end),
      semesterLabel: bounds.label,
    };
  }

  return {
    daysWorked: daysWorkedCommercial(effectiveStart, bounds.end),
    effectiveStart: formatDateOnly(effectiveStart),
    effectiveEnd: formatDateOnly(bounds.end),
    semesterLabel: bounds.label,
  };
};

export const computePrimaAmount = (
  monthlySalary: number,
  daysWorked: number
): number => {
  if (monthlySalary <= 0 || daysWorked <= 0) return 0;
  return Math.round((monthlySalary * daysWorked) / 360);
};

export const buildPrimaFormula = (
  monthlySalary: number,
  daysWorked: number,
  primaAmount: number
): string => {
  const salaryFmt = new Intl.NumberFormat("es-CO").format(Math.round(monthlySalary));
  const primaFmt = new Intl.NumberFormat("es-CO").format(primaAmount);
  return `(${salaryFmt} × ${daysWorked}) / 360 = $ ${primaFmt}`;
};

export const getPrimaSemesterTitle = (
  year: number,
  semester: PrimaSemester
): string =>
  semester === 1
    ? `1er semestre ${year} (ene–jun)`
    : `2do semestre ${year} (jul–dic)`;

const formatCopMessage = (amount: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

/** Texto WhatsApp de liquidación de prima (envío manual). */
export const buildPrimaWhatsAppMessage = (params: {
  employeeName: string;
  monthlySalary: number;
  daysWorked: number;
  primaAmount: number;
  formula: string;
  semesterLabel: string;
  year: number;
  semester: PrimaSemester;
}): string => {
  const title = getPrimaSemesterTitle(params.year, params.semester);
  const calcLine = params.formula.includes("=")
    ? params.formula.split("=")[0].trim()
    : params.formula;
  const periodLine = params.semesterLabel.replace(/\s*\(\d+ días\)\s*$/, "");

  return [
    `Prima de servicios — ${title}`,
    "",
    `Empleado: ${params.employeeName}`,
    `Salario mensual (incl. auxilio transporte): ${formatCopMessage(params.monthlySalary)}`,
    `Días liquidados: ${params.daysWorked}`,
    `Valor prima: ${formatCopMessage(params.primaAmount)}`,
    "",
    `Cálculo: ${calcLine}`,
    `Período: ${periodLine}`,
  ].join("\n");
};

export const computePrimaForEmployee = (params: {
  baseSalary: number;
  transportAllowance?: number;
  /** Atajo: total mensual ya sumado (calculadora). */
  monthlySalary?: number;
  hireDate: Date | null;
  year: number;
  semester: PrimaSemester;
}): PrimaCalculation => {
  const baseSalary = Math.max(0, params.baseSalary);
  const transportAllowance = Math.max(0, params.transportAllowance ?? 0);
  const monthlySalary =
    params.monthlySalary != null && params.monthlySalary > 0
      ? params.monthlySalary
      : primaMonthlyBase(baseSalary, transportAllowance);
  const { hireDate, year, semester } = params;
  const daysInfo = computePrimaDaysWorked(hireDate, year, semester);
  const primaAmount = computePrimaAmount(monthlySalary, daysInfo.daysWorked);

  return {
    year,
    semester,
    baseSalary,
    transportAllowance,
    monthlySalary,
    hireDate: hireDate ? formatDateOnly(hireDate) : null,
    ...daysInfo,
    primaAmount,
    formula: buildPrimaFormula(monthlySalary, daysInfo.daysWorked, primaAmount),
  };
};

/** Ejemplos documentados para la UI (total mensual $2.000.000 incl. transporte). */
export const PRIMA_EXAMPLES = [
  {
    title: "Ingreso 1 de enero (semestre completo)",
    baseSalary: 1_800_000,
    transportAllowance: 200_000,
    hireDate: "2026-01-01",
    year: 2026,
    semester: 1 as PrimaSemester,
  },
  {
    title: "Ingreso 1 de marzo",
    baseSalary: 1_800_000,
    transportAllowance: 200_000,
    hireDate: "2026-03-01",
    year: 2026,
    semester: 1 as PrimaSemester,
  },
].map((ex) => ({
  ...ex,
  result: computePrimaForEmployee({
    baseSalary: ex.baseSalary,
    transportAllowance: ex.transportAllowance,
    hireDate: parseDateOnly(ex.hireDate),
    year: ex.year,
    semester: ex.semester,
  }),
}));
