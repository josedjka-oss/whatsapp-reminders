import { Prisma } from "@prisma/client";
import { lastDayOfMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { prisma } from "../db";
import { sendWhatsAppMessage } from "./twilio";
import { uploadBufferToCloudinary, isCloudinaryConfigured } from "./cloudinary-upload";
import { normalizeWhatsAppPhoneNumber } from "../utils/whatsapp-phone-normalize";
import {
  BonusFrequency,
  calculateDaytimeOvertimePay,
  grossBonusForHalf,
  grossOvertimeForHalf,
  grossSalaryForHalf,
  grossTransportForHalf,
  hourlyRateFromMonthlySalary,
  normalizeBonusFrequency,
} from "../utils/nomina-calculations";

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
  const base =
    process.env.NOMINA_PUBLIC_BASE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    process.env.PUBLIC_BASE_URL?.trim() ||
    "http://localhost:3000";
  return base.replace(/\/$/, "");
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
  return prisma.nominaPeriod.upsert({
    where: { year_month_half: { year, month, half } },
    update: {},
    create: { year, month, half, payDay, status: "open" },
  });
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

  const salaryDiscounts = recurringSalary + valeSalary;
  const bonusDiscounts = recurringBonus + valeBonus;

  const netSalary = Math.max(0, grossSalary - salaryDiscounts);
  const netTransport = grossTransport;
  const netBonus = Math.max(0, grossBonus - bonusDiscounts);
  const netOvertime = grossOvertime;
  const netTotal = netSalary + netTransport + netBonus + netOvertime;

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
    grossBonus,
    grossOvertime,
    salaryDiscounts,
    bonusDiscounts,
    netSalary,
    netTransport,
    netBonus,
    netOvertime,
    netTotal,
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
      holderName: v.holderName,
      amount: toMoney(v.amount),
      appliesTo: v.appliesTo,
      photoUrl: v.photoUrl,
      notes: v.notes,
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
    netTotal,
    breakdown,
  };
};

export const upsertSlipForEmployee = async (employeeId: string, periodId: string) => {
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
      employee: true,
      period: true,
    },
  });
};

export const generateSlipsForPeriod = async (year: number, month: number, half: 1 | 2) => {
  const period = await getOrCreatePeriod(year, month, half);
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
