import { Prisma } from "@prisma/client";
import { lastDayOfMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { prisma } from "../db";
import { sendWhatsAppMessage } from "./twilio";
import { uploadBufferToCloudinary, isCloudinaryConfigured } from "./cloudinary-upload";
import { randomUUID } from "crypto";
import {
  generateQuincenaSequence,
  splitPrestamoInstallments,
} from "../utils/nomina-quincena";
import {
  BonusFrequency,
  calculateDaytimeOvertimePay,
  grossBonusForHalf,
  grossOvertimeForHalf,
  grossSalaryForHalf,
  grossTransportForHalf,
  hourlyRateFromMonthlySalary,
  normalizeBonusFrequency,
  roundCopToThousand,
} from "../utils/nomina-calculations";
import { normalizeWhatsAppPhoneNumber } from "../utils/whatsapp-phone-normalize";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

export type DeductionTarget = "SALARY" | "BONUS";

const toMoney = (value: Prisma.Decimal | number): number =>
  typeof value === "number" ? value : Number(value);

const formatCop = (amount: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

export const getNominaPublicBaseUrl = (): string => {
  const explicit =
    process.env.NOMINA_PUBLIC_BASE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  // Los recibos /nomina/recibo/* viven en el frontend (Vercel), no en el API de Render.
  if (process.env.NODE_ENV === "production") {
    return "https://whatsapp-reminders.vercel.app";
  }

  return (process.env.PUBLIC_BASE_URL?.trim() || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
};

export const buildSlipPublicUrl = (accessToken: string): string =>
  `${getNominaPublicBaseUrl()}/nomina/recibo/${accessToken}`;

/** Día 15 = quincena 1; último día del mes = quincena 2 */
export const resolvePeriodHalfForToday = (
  year: number,
  month: number,
  day: number
): 1 | 2 | null => {
  if (day === 15) return 1;
  const lastDay = lastDayOfMonth(new Date(year, month - 1, 1)).getDate();
  if (day === lastDay) return 2;
  return null;
};

export const getPeriodLabel = (year: number, month: number, half: number): string => {
  const anchor = new Date(year, month - 1, half === 1 ? 15 : 28);
  const monthName = formatInTimeZone(anchor, APP_TIMEZONE, "MMMM yyyy", { locale: es });
  return half === 1 ? `1ra quincena ${monthName}` : `2da quincena ${monthName}`;
};

export const getOrCreateScheduleConfig = async () => {
  return prisma.nominaScheduleConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", hour: 9, minute: 0, autoSendEnabled: true },
  });
};

export const getOrCreatePeriod = async (year: number, month: number, half: 1 | 2) => {
  const payDay = half === 1 ? 15 : lastDayOfMonth(new Date(year, month - 1, 1)).getDate();
  const label = getPeriodLabel(year, month, half);
  return prisma.nominaPeriod.upsert({
    where: { year_month_half: { year, month, half } },
    update: {},
    create: { year, month, half, payDay, label, status: "open" },
  });
};

export const createOpenQuincena = async (year: number, month: number, half: 1 | 2) => {
  const existing = await prisma.nominaPeriod.findUnique({
    where: { year_month_half: { year, month, half } },
  });
  if (existing) {
    if (existing.status === "closed") {
      throw new Error(
        `La quincena ${getPeriodLabel(year, month, half)} ya está cerrada. No se puede reabrir.`
      );
    }
    return existing;
  }
  const payDay = half === 1 ? 15 : lastDayOfMonth(new Date(year, month - 1, 1)).getDate();
  const label = getPeriodLabel(year, month, half);
  return prisma.nominaPeriod.create({
    data: { year, month, half, payDay, label, status: "open" },
  });
};

export const assertQuincenaOpenForEditing = async (q: {
  year: number;
  month: number;
  half: 1 | 2;
}) => {
  const period = await prisma.nominaPeriod.findUnique({
    where: { year_month_half: { year: q.year, month: q.month, half: q.half } },
  });
  if (!period) {
    throw new Error(
      `Crea la quincena ${getPeriodLabel(q.year, q.month, q.half)} antes de registrar vales o préstamos.`
    );
  }
  if (period.status === "closed") {
    throw new Error(
      `La quincena ${getPeriodLabel(q.year, q.month, q.half)} está cerrada y no se puede modificar.`
    );
  }
};

export const assertQuincenaCanReceiveInstallment = async (q: {
  year: number;
  month: number;
  half: 1 | 2;
}) => {
  const period = await prisma.nominaPeriod.findUnique({
    where: { year_month_half: { year: q.year, month: q.month, half: q.half } },
  });
  if (period?.status === "closed") {
    throw new Error(
      `La quincena ${getPeriodLabel(q.year, q.month, q.half)} está cerrada y no se puede modificar.`
    );
  }
};

export const assertQuincenasOpen = async (
  quincenas: Array<{ year: number; month: number; half: 1 | 2 }>
) => {
  for (const q of quincenas) {
    await assertQuincenaOpenForEditing(q);
  }
};

export const closeQuincena = async (periodId: string) => {
  const period = await prisma.nominaPeriod.findUniqueOrThrow({
    where: { id: periodId },
  });
  if (period.status === "closed") {
    throw new Error("Esta quincena ya está cerrada.");
  }

  const employees = await prisma.nominaEmployee.findMany({
    where: { isActive: true },
  });

  for (const employee of employees) {
    await upsertSlipForEmployee(employee.id, periodId);
  }

  return prisma.nominaPeriod.update({
    where: { id: periodId },
    data: {
      status: "closed",
      closedAt: new Date(),
      label: getPeriodLabel(period.year, period.month, period.half),
    },
    include: { _count: { select: { slips: true } } },
  });
};

const summaryRowFromSlip = (slip: {
  employeeId: string;
  employee: { name: string };
  grossSalary: Prisma.Decimal;
  grossTransport: Prisma.Decimal;
  grossBonus: Prisma.Decimal;
  salaryDiscounts: Prisma.Decimal;
  bonusDiscounts: Prisma.Decimal;
  netBonus: Prisma.Decimal;
  netOvertime: Prisma.Decimal;
  breakdown: unknown;
}) => {
  const breakdown = slip.breakdown as { netSalaryWithTransport?: number } | null;
  const netSalaryWithTransport =
    breakdown?.netSalaryWithTransport ??
    Math.max(
      0,
      toMoney(slip.grossSalary) +
        toMoney(slip.grossTransport) -
        toMoney(slip.salaryDiscounts)
    );

  return {
    employeeId: slip.employeeId,
    name: slip.employee.name,
    grossSalary: toMoney(slip.grossSalary),
    grossTransport: toMoney(slip.grossTransport),
    grossBonus: toMoney(slip.grossBonus),
    salaryDiscounts: toMoney(slip.salaryDiscounts),
    bonusDiscounts: toMoney(slip.bonusDiscounts),
    netSalaryWithTransport,
    netBonus: toMoney(slip.netBonus),
    netOvertime: toMoney(slip.netOvertime),
  };
};

export const getPeriodSummaryById = async (periodId: string) => {
  const period = await prisma.nominaPeriod.findUniqueOrThrow({
    where: { id: periodId },
  });

  const periodLabel =
    period.label ?? getPeriodLabel(period.year, period.month, period.half);

  if (period.status === "closed") {
    const slips = await prisma.nominaSlip.findMany({
      where: { periodId },
      include: { employee: { select: { name: true } } },
      orderBy: { employee: { name: "asc" } },
    });
    return {
      period: {
        id: period.id,
        year: period.year,
        month: period.month,
        half: period.half,
        payDay: period.payDay,
        status: period.status,
        closedAt: period.closedAt,
      },
      periodLabel,
      frozen: true,
      rows: slips.map(summaryRowFromSlip),
    };
  }

  const employees = await prisma.nominaEmployee.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const rows = [];
  for (const employee of employees) {
    const computed = await computeSlipBreakdown(employee.id, period.id);
    rows.push({
      employeeId: employee.id,
      name: employee.name,
      grossSalary: computed.grossSalary,
      grossTransport: computed.grossTransport,
      grossBonus: computed.grossBonus,
      salaryDiscounts: computed.salaryDiscounts,
      bonusDiscounts: computed.bonusDiscounts,
      netSalaryWithTransport: computed.netSalaryWithTransport,
      netBonus: computed.netBonus,
      netOvertime: computed.netOvertime,
    });
  }

  return {
    period: {
      id: period.id,
      year: period.year,
      month: period.month,
      half: period.half,
      payDay: period.payDay,
      status: period.status,
      closedAt: period.closedAt,
    },
    periodLabel,
    frozen: false,
    rows,
  };
};

export const getPeriodDetail = async (periodId: string) => {
  const period = await prisma.nominaPeriod.findUniqueOrThrow({
    where: { id: periodId },
    include: {
      _count: { select: { slips: true } },
    },
  });

  const [summary, vales, prestamoInstallments] = await Promise.all([
    getPeriodSummaryById(periodId),
    prisma.nominaVale.findMany({
      where: {
        year: period.year,
        month: period.month,
        half: period.half,
      },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.nominaVale.count({
      where: {
        year: period.year,
        month: period.month,
        half: period.half,
        kind: "PRESTAMO",
      },
    }),
  ]);

  return {
    period: {
      ...period,
      periodLabel:
        period.label ?? getPeriodLabel(period.year, period.month, period.half),
    },
    summary,
    valesCount: vales.length,
    prestamoInstallmentsCount: prestamoInstallments,
    vales: vales.map((v) => ({
      ...v,
      amount: toMoney(v.amount),
      totalPrestamoAmount: v.totalPrestamoAmount ? toMoney(v.totalPrestamoAmount) : null,
    })),
  };
};

const sumByTarget = (
  items: { amount: Prisma.Decimal | number; appliesTo: string }[],
  target: DeductionTarget
): number =>
  items
    .filter((i) => i.appliesTo === target)
    .reduce((acc, i) => acc + toMoney(i.amount), 0);

export const computeSlipBreakdown = async (employeeId: string, periodId: string) => {
  const employee = await prisma.nominaEmployee.findUniqueOrThrow({
    where: { id: employeeId },
    include: {
      deductions: { where: { isActive: true } },
    },
  });

  const period = await prisma.nominaPeriod.findUniqueOrThrow({
    where: { id: periodId },
  });

  const vales = await prisma.nominaVale.findMany({
    where: {
      employeeId,
      year: period.year,
      month: period.month,
      half: period.half,
    },
    orderBy: { createdAt: "asc" },
  });

  const quincenaDescuentos = await prisma.nominaQuincenaDescuento.findMany({
    where: {
      employeeId,
      year: period.year,
      month: period.month,
      half: period.half,
    },
    orderBy: { createdAt: "asc" },
  });

  const overtime = await prisma.nominaOvertime.findUnique({
    where: {
      employeeId_year_month: {
        employeeId,
        year: period.year,
        month: period.month,
      },
    },
  });

  const monthlySalary = toMoney(employee.baseSalary);
  const monthlyTransport = toMoney(employee.transportAllowance);
  const monthlyBonus = toMoney(employee.baseBonus);
  const bonusFrequency = normalizeBonusFrequency(employee.bonusFrequency);
  const monthlyHoursBase = employee.monthlyHoursBase ?? 240;
  const half = period.half as 1 | 2;
  const daytimeHours = overtime ? toMoney(overtime.daytimeHours) : 0;

  const grossSalary = grossSalaryForHalf(monthlySalary);
  const grossTransport = grossTransportForHalf(monthlyTransport);
  const grossBonus = grossBonusForHalf(monthlyBonus, half, bonusFrequency);
  const grossOvertime = grossOvertimeForHalf(
    monthlySalary,
    daytimeHours,
    half,
    monthlyHoursBase
  );
  const hourlyRate = hourlyRateFromMonthlySalary(monthlySalary, monthlyHoursBase);
  const overtimeUnitRate = hourlyRate * 1.25;

  const recurringSalary = sumByTarget(employee.deductions, "SALARY");
  const recurringBonus = sumByTarget(employee.deductions, "BONUS");
  const valeSalary = sumByTarget(vales, "SALARY");
  const valeBonus = sumByTarget(vales, "BONUS");
  const extraSalary = sumByTarget(quincenaDescuentos, "SALARY");
  const extraBonus = sumByTarget(quincenaDescuentos, "BONUS");

  const salaryDiscounts = recurringSalary + valeSalary + extraSalary;
  const bonusDiscounts = recurringBonus + valeBonus + extraBonus;

  const grossSalaryTransportRaw = grossSalary + grossTransport;
  const grossSalaryTransportRounded = roundCopToThousand(grossSalaryTransportRaw);

  const netBonus = Math.max(0, grossBonus - bonusDiscounts);
  const netOvertime = grossOvertime;
  const netSalaryWithTransport = Math.max(
    0,
    grossSalaryTransportRounded - salaryDiscounts
  );
  const netTotal = netSalaryWithTransport + netBonus + netOvertime;

  const mapValeLabel = (v: { kind: string; holderName: string }) =>
    v.kind === "PRESTAMO" ? v.holderName : v.holderName;

  const salaryDiscountLines = [
    ...employee.deductions
      .filter((d) => d.appliesTo === "SALARY")
      .map((d) => ({
        id: d.id,
        label: d.label,
        amount: toMoney(d.amount),
        source: "fijo" as const,
        photoUrl: null as string | null,
      })),
    ...vales
      .filter((v) => v.appliesTo === "SALARY")
      .map((v) => ({
        id: v.id,
        label: mapValeLabel(v),
        amount: toMoney(v.amount),
        source: (v.kind === "PRESTAMO" ? "prestamo" : "vale") as "vale" | "prestamo",
        photoUrl: v.photoUrl,
      })),
    ...quincenaDescuentos
      .filter((d) => d.appliesTo === "SALARY")
      .map((d) => ({
        id: d.id,
        label: d.label,
        amount: toMoney(d.amount),
        source: "descuento" as const,
        photoUrl: d.photoUrl,
      })),
  ];

  const bonusDiscountLines = [
    ...employee.deductions
      .filter((d) => d.appliesTo === "BONUS")
      .map((d) => ({
        id: d.id,
        label: d.label,
        amount: toMoney(d.amount),
        source: "fijo" as const,
        photoUrl: null as string | null,
      })),
    ...vales
      .filter((v) => v.appliesTo === "BONUS")
      .map((v) => ({
        id: v.id,
        label: mapValeLabel(v),
        amount: toMoney(v.amount),
        source: (v.kind === "PRESTAMO" ? "prestamo" : "vale") as "vale" | "prestamo",
        photoUrl: v.photoUrl,
      })),
    ...quincenaDescuentos
      .filter((d) => d.appliesTo === "BONUS")
      .map((d) => ({
        id: d.id,
        label: d.label,
        amount: toMoney(d.amount),
        source: "descuento" as const,
        photoUrl: d.photoUrl,
      })),
  ];

  const photoAttachments = [
    ...vales.filter((v) => v.photoUrl).map((v) => ({
      label: mapValeLabel(v),
      amount: toMoney(v.amount),
      photoUrl: v.photoUrl!,
      kind: v.kind,
    })),
    ...quincenaDescuentos.filter((d) => d.photoUrl).map((d) => ({
      label: d.label,
      amount: toMoney(d.amount),
      photoUrl: d.photoUrl!,
      kind: "DESCUENTO",
    })),
  ];

  const netSalary = Math.max(0, grossSalary - salaryDiscounts);
  const netTransport = grossTransport;

  const breakdown = {
    employeeName: employee.name,
    periodLabel: getPeriodLabel(period.year, period.month, period.half),
    year: period.year,
    month: period.month,
    half: period.half,
    payDay: period.payDay,
    bonusFrequency,
    monthlyHoursBase,
    monthlySalary,
    monthlyTransport,
    monthlyBonus,
    grossSalary,
    grossTransport,
    grossSalaryTransportRaw,
    grossSalaryTransportRounded,
    grossBonus,
    grossOvertime,
    salaryDiscounts,
    bonusDiscounts,
    netSalary,
    netTransport,
    netBonus,
    netOvertime,
    netSalaryWithTransport,
    netTotal,
    salarySection: {
      grossSalary,
      grossTransport,
      grossTotal: grossSalaryTransportRounded,
      grossTotalRaw: grossSalaryTransportRaw,
      discountLines: salaryDiscountLines,
      totalDiscounts: salaryDiscounts,
      net: netSalaryWithTransport,
    },
    bonusSection: {
      grossBonus,
      discountLines: bonusDiscountLines,
      totalDiscounts: bonusDiscounts,
      net: netBonus,
    },
    photoAttachments,
    overtime: {
      daytimeHours,
      monthlyHoursBase,
      hourlyRate,
      overtimeUnitRate,
      totalMonthOvertimePay: calculateDaytimeOvertimePay(
        monthlySalary,
        daytimeHours,
        monthlyHoursBase
      ),
      paidInHalf: half,
    },
    recurringDeductions: employee.deductions.map((d) => ({
      id: d.id,
      label: d.label,
      amount: toMoney(d.amount),
      appliesTo: d.appliesTo,
    })),
    vales: vales.map((v) => ({
      id: v.id,
      kind: v.kind,
      holderName: v.holderName,
      amount: toMoney(v.amount),
      appliesTo: v.appliesTo,
      photoUrl: v.photoUrl,
      notes: v.notes,
      installmentNumber: v.installmentNumber,
      installmentTotal: v.installmentTotal,
      totalPrestamoAmount: v.totalPrestamoAmount
        ? toMoney(v.totalPrestamoAmount)
        : null,
      prestamoGroupId: v.prestamoGroupId,
    })),
    quincenaDescuentos: quincenaDescuentos.map((d) => ({
      id: d.id,
      label: d.label,
      amount: toMoney(d.amount),
      appliesTo: d.appliesTo,
      photoUrl: d.photoUrl,
    })),
  };

  return {
    employee,
    period,
    grossSalary,
    grossTransport,
    grossBonus,
    grossOvertime,
    salaryDiscounts,
    bonusDiscounts,
    netSalary,
    netTransport,
    netBonus,
    netOvertime,
    netSalaryWithTransport,
    netTotal,
    breakdown,
  };
};

export const upsertSlipForEmployee = async (employeeId: string, periodId: string) => {
  const period = await prisma.nominaPeriod.findUniqueOrThrow({
    where: { id: periodId },
  });
  if (period.status === "closed") {
    throw new Error(
      `La quincena ${getPeriodLabel(period.year, period.month, period.half)} está cerrada.`
    );
  }

  const computed = await computeSlipBreakdown(employeeId, periodId);

  return prisma.nominaSlip.upsert({
    where: {
      employeeId_periodId: { employeeId, periodId },
    },
    update: {
      grossSalary: computed.grossSalary,
      grossTransport: computed.grossTransport,
      grossBonus: computed.grossBonus,
      grossOvertime: computed.grossOvertime,
      salaryDiscounts: computed.salaryDiscounts,
      bonusDiscounts: computed.bonusDiscounts,
      netSalary: computed.netSalary,
      netTransport: computed.netTransport,
      netBonus: computed.netBonus,
      netOvertime: computed.netOvertime,
      netTotal: computed.netTotal,
      breakdown: computed.breakdown as Prisma.InputJsonValue,
    },
    create: {
      employeeId,
      periodId,
      grossSalary: computed.grossSalary,
      grossTransport: computed.grossTransport,
      grossBonus: computed.grossBonus,
      grossOvertime: computed.grossOvertime,
      salaryDiscounts: computed.salaryDiscounts,
      bonusDiscounts: computed.bonusDiscounts,
      netSalary: computed.netSalary,
      netTransport: computed.netTransport,
      netBonus: computed.netBonus,
      netOvertime: computed.netOvertime,
      netTotal: computed.netTotal,
      breakdown: computed.breakdown as Prisma.InputJsonValue,
    },
    include: {
      employee: { select: { id: true, name: true, phone: true } },
      period: true,
    },
  });
};

type SlipWithEmployee = {
  id: string;
  employeeId: string;
  accessToken: string;
  grossSalary: Prisma.Decimal | number;
  grossTransport: Prisma.Decimal | number;
  grossBonus: Prisma.Decimal | number;
  grossOvertime: Prisma.Decimal | number;
  salaryDiscounts: Prisma.Decimal | number;
  bonusDiscounts: Prisma.Decimal | number;
  netSalary: Prisma.Decimal | number;
  netTransport: Prisma.Decimal | number;
  netBonus: Prisma.Decimal | number;
  netOvertime: Prisma.Decimal | number;
  netTotal: Prisma.Decimal | number;
  breakdown: unknown;
  whatsappSentAt: Date | null;
  employee: { id: string; name: string; phone: string | null };
};

export const serializeNominaSlipForApi = (slip: SlipWithEmployee) => ({
  id: slip.id,
  employeeId: slip.employeeId,
  accessToken: slip.accessToken,
  publicUrl: buildSlipPublicUrl(slip.accessToken),
  employee: {
    name: slip.employee.name,
    phone: slip.employee.phone,
  },
  grossSalary: toMoney(slip.grossSalary),
  grossTransport: toMoney(slip.grossTransport),
  grossBonus: toMoney(slip.grossBonus),
  grossOvertime: toMoney(slip.grossOvertime),
  salaryDiscounts: toMoney(slip.salaryDiscounts),
  bonusDiscounts: toMoney(slip.bonusDiscounts),
  netSalary: toMoney(slip.netSalary),
  netTransport: toMoney(slip.netTransport),
  netBonus: toMoney(slip.netBonus),
  netOvertime: toMoney(slip.netOvertime),
  netTotal: toMoney(slip.netTotal),
  breakdown: slip.breakdown,
  whatsappSentAt: slip.whatsappSentAt,
});

export const generateSlipsForPeriod = async (year: number, month: number, half: 1 | 2) => {
  const period = await prisma.nominaPeriod.findUnique({
    where: { year_month_half: { year, month, half } },
  });
  if (!period) {
    throw new Error(
      `No existe la quincena ${getPeriodLabel(year, month, half)}. Créala primero.`
    );
  }
  if (period.status === "closed") {
    throw new Error(
      `La quincena ${getPeriodLabel(year, month, half)} está cerrada. Los recibos ya están congelados.`
    );
  }

  const employees = await prisma.nominaEmployee.findMany({
    where: { isActive: true },
  });

  const slips = [];
  for (const employee of employees) {
    slips.push(await upsertSlipForEmployee(employee.id, period.id));
  }

  return { period, slips };
};

export const buildWhatsAppSlipMessage = (slip: {
  accessToken: string;
  breakdown: unknown;
  employee: { name: string };
}): string => {
  const breakdown = slip.breakdown as { periodLabel?: string; netTotal?: number };
  const url = buildSlipPublicUrl(slip.accessToken);
  const total = breakdown.netTotal != null ? formatCop(breakdown.netTotal) : "";
  const periodLabel = breakdown.periodLabel ?? "Nómina";
  return `${periodLabel} — ${slip.employee.name}: neto ${total}. Recibo: ${url}`;
};

export const sendSlipWhatsApp = async (slipId: string) => {
  const slip = await prisma.nominaSlip.findUniqueOrThrow({
    where: { id: slipId },
    include: { employee: true, period: true },
  });

  if (!slip.employee.phone) {
    throw new Error(`El empleado ${slip.employee.name} no tiene teléfono WhatsApp configurado.`);
  }

  const to = normalizeWhatsAppPhoneNumber(slip.employee.phone);
  const reminderText = buildWhatsAppSlipMessage(slip);

  const sid = await sendWhatsAppMessage({ to, reminderText });

  await prisma.nominaSlip.update({
    where: { id: slipId },
    data: { whatsappSentAt: new Date() },
  });

  return { sid, to, reminderText };
};

export const generateAndSendSlipForEmployee = async (
  employeeId: string,
  periodId: string
) => {
  const slip = await upsertSlipForEmployee(employeeId, periodId);
  const whatsapp = await sendSlipWhatsApp(slip.id);
  const refreshed = await prisma.nominaSlip.findUniqueOrThrow({
    where: { id: slip.id },
    include: { employee: { select: { id: true, name: true, phone: true } } },
  });
  return { slip: refreshed, whatsapp };
};

export const sendAllSlipsWhatsApp = async (periodId: string) => {
  const slips = await prisma.nominaSlip.findMany({
    where: { periodId },
    include: { employee: true },
  });

  const results: Array<{ slipId: string; ok: boolean; error?: string; sid?: string }> = [];

  for (const slip of slips) {
    try {
      const { sid } = await sendSlipWhatsApp(slip.id);
      results.push({ slipId: slip.id, ok: true, sid });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      results.push({ slipId: slip.id, ok: false, error: message });
    }
  }

  return results;
};

export const decodePhotoBase64 = (
  photoBase64: string
): { buffer: Buffer; contentType: string } => {
  const match = photoBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      contentType: match[1],
      buffer: Buffer.from(match[2], "base64"),
    };
  }
  return {
    contentType: "image/jpeg",
    buffer: Buffer.from(photoBase64, "base64"),
  };
};

export const uploadValePhoto = async (photoBase64: string): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary no está configurado. Configura CLOUDINARY_* para subir fotos de vales."
    );
  }
  const { buffer, contentType } = decodePhotoBase64(photoBase64);
  return uploadBufferToCloudinary(buffer, contentType, "whatsapp-reminders/nomina/vales");
};

export const getSlipByToken = async (accessToken: string) => {
  return prisma.nominaSlip.findUnique({
    where: { accessToken },
    include: {
      employee: { select: { name: true, phone: true } },
      period: true,
    },
  });
};

export type CreateValeInput = {
  employeeId: string;
  holderName: string;
  amount: number;
  appliesTo: "SALARY" | "BONUS";
  year: number;
  month: number;
  half: 1 | 2;
  kind?: "VALE" | "PRESTAMO";
  installmentCount?: number;
  photoUrl?: string | null;
  notes?: string | null;
};

export const createNominaValeOrPrestamo = async (input: CreateValeInput) => {
  const kind = input.kind === "PRESTAMO" ? "PRESTAMO" : "VALE";
  const appliesTo = input.appliesTo;

  if (kind === "VALE") {
    await assertQuincenaOpenForEditing({
      year: input.year,
      month: input.month,
      half: input.half,
    });

    const vale = await prisma.nominaVale.create({
      data: {
        employeeId: input.employeeId,
        kind: "VALE",
        holderName: input.holderName.trim(),
        amount: input.amount,
        appliesTo,
        year: input.year,
        month: input.month,
        half: input.half,
        photoUrl: input.photoUrl ?? null,
        notes: input.notes ?? null,
      },
      include: { employee: { select: { id: true, name: true } } },
    });
    return { kind: "VALE" as const, vale };
  }

  const installmentCount = Math.max(
    1,
    Math.min(36, Math.round(input.installmentCount ?? 1))
  );
  const totalAmount = input.amount;
  const installmentAmounts = splitPrestamoInstallments(
    totalAmount,
    installmentCount
  );
  const sequence = generateQuincenaSequence(
    input.year,
    input.month,
    input.half,
    installmentCount
  );
  await assertQuincenaOpenForEditing({
    year: input.year,
    month: input.month,
    half: input.half,
  });
  for (const q of sequence) {
    await assertQuincenaCanReceiveInstallment(q);
  }

  const prestamoGroupId = randomUUID();

  const installments = [];
  for (let i = 0; i < installmentCount; i++) {
    const q = sequence[i];
    const row = await prisma.nominaVale.create({
      data: {
        employeeId: input.employeeId,
        kind: "PRESTAMO",
        holderName: input.holderName.trim(),
        amount: installmentAmounts[i],
        appliesTo,
        year: q.year,
        month: q.month,
        half: q.half,
        photoUrl: input.photoUrl ?? null,
        notes: input.notes ?? null,
        prestamoGroupId,
        installmentNumber: i + 1,
        installmentTotal: installmentCount,
        totalPrestamoAmount: totalAmount,
      },
      include: { employee: { select: { id: true, name: true } } },
    });
    installments.push(row);
  }

  return { kind: "PRESTAMO" as const, prestamoGroupId, installments };
};

export type CreateQuincenaDescuentoInput = {
  employeeId: string;
  label: string;
  amount: number;
  appliesTo: "SALARY" | "BONUS";
  year: number;
  month: number;
  half: 1 | 2;
  photoUrl?: string | null;
};

export const createQuincenaDescuento = async (input: CreateQuincenaDescuentoInput) => {
  await assertQuincenaOpenForEditing({
    year: input.year,
    month: input.month,
    half: input.half,
  });

  return prisma.nominaQuincenaDescuento.create({
    data: {
      employeeId: input.employeeId,
      label: input.label.trim(),
      amount: input.amount,
      appliesTo: input.appliesTo,
      year: input.year,
      month: input.month,
      half: input.half,
      photoUrl: input.photoUrl ?? null,
    },
    include: { employee: { select: { id: true, name: true } } },
  });
};

export const assertQuincenaDescuentoEditable = async (id: string) => {
  const row = await prisma.nominaQuincenaDescuento.findUniqueOrThrow({ where: { id } });
  await assertQuincenaCanReceiveInstallment({
    year: row.year,
    month: row.month,
    half: row.half as 1 | 2,
  });
  return row;
};

export const assertValeEditable = async (valeId: string) => {
  const vale = await prisma.nominaVale.findUniqueOrThrow({ where: { id: valeId } });
  await assertQuincenaCanReceiveInstallment({
    year: vale.year,
    month: vale.month,
    half: vale.half as 1 | 2,
  });
  return vale;
};

export const assertPrestamoGroupEditable = async (prestamoGroupId: string) => {
  const installments = await prisma.nominaVale.findMany({
    where: { prestamoGroupId },
  });
  if (installments.length === 0) {
    throw new Error("Préstamo no encontrado");
  }
  for (const i of installments) {
    await assertQuincenaCanReceiveInstallment({
      year: i.year,
      month: i.month,
      half: i.half as 1 | 2,
    });
  }
  return installments;
};

export const getPeriodSummary = async (
  year: number,
  month: number,
  half: 1 | 2
) => {
  const period = await prisma.nominaPeriod.findUnique({
    where: { year_month_half: { year, month, half } },
  });
  if (!period) {
    throw new Error(
      `No existe la quincena ${getPeriodLabel(year, month, half)}. Créala primero en Quincenas.`
    );
  }
  return getPeriodSummaryById(period.id);
};
