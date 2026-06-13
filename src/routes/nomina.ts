import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireAuth as requireAdminAuth } from "../middleware/auth";
import {
  buildSlipPublicUrl,
  generateSlipsForPeriod,
  getOrCreateScheduleConfig,
  getSlipByToken,
  resolvePeriodHalfForToday,
  sendAllSlipsWhatsApp,
  sendSlipWhatsApp,
  uploadValePhoto,
  upsertSlipForEmployee,
} from "../services/nomina-service";
import { normalizeWhatsAppPhoneNumber } from "../utils/whatsapp-phone-normalize";
import {
  calculateDaytimeOvertimePay,
  hourlyRateFromMonthlySalary,
  normalizeBonusFrequency,
} from "../utils/nomina-calculations";

const router = Router();

const parseAppliesTo = (raw: unknown): "SALARY" | "BONUS" => {
  const s = String(raw ?? "SALARY").toUpperCase();
  return s === "BONUS" ? "BONUS" : "SALARY";
};

const parseMoney = (raw: unknown, field: string): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${field} debe ser un número >= 0`);
  }
  return n;
};

// --- Público: recibo por token (sin auth) ---
router.get("/public/recibo/:token", async (req: Request, res: Response) => {
  try {
    const slip = await getSlipByToken(req.params.token);
    if (!slip) {
      return res.status(404).json({ error: "Recibo no encontrado" });
    }
    return res.json({
      employeeName: slip.employee.name,
      period: slip.period,
      grossSalary: Number(slip.grossSalary),
      grossTransport: Number(slip.grossTransport),
      grossBonus: Number(slip.grossBonus),
      grossOvertime: Number(slip.grossOvertime),
      salaryDiscounts: Number(slip.salaryDiscounts),
      bonusDiscounts: Number(slip.bonusDiscounts),
      netSalary: Number(slip.netSalary),
      netTransport: Number(slip.netTransport),
      netBonus: Number(slip.netBonus),
      netOvertime: Number(slip.netOvertime),
      netTotal: Number(slip.netTotal),
      breakdown: slip.breakdown,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(500).json({ error: message });
  }
});

router.use(requireAdminAuth);

// Calculadora horas extra diurnas (preview)
router.get("/calculate-overtime", async (req, res) => {
  try {
    const salary = parseMoney(req.query.salary, "salary");
    const hours = parseMoney(req.query.hours ?? 0, "hours");
    const hourlyRate = hourlyRateFromMonthlySalary(salary);
    const total = calculateDaytimeOvertimePay(salary, hours);
    return res.json({
      monthlySalary: salary,
      daytimeHours: hours,
      hourlyRate,
      overtimeUnitRate: hourlyRate * 1.25,
      totalOvertimePay: total,
      formula: "salario/240 × 1.25 × horas",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

// --- Config scheduler ---
router.get("/config", async (_req, res) => {
  const config = await getOrCreateScheduleConfig();
  return res.json(config);
});

router.patch("/config", async (req, res) => {
  const { hour, minute, autoSendEnabled } = req.body ?? {};
  const config = await prisma.nominaScheduleConfig.update({
    where: { id: "default" },
    data: {
      ...(hour !== undefined ? { hour: Number(hour) } : {}),
      ...(minute !== undefined ? { minute: Number(minute) } : {}),
      ...(autoSendEnabled !== undefined
        ? { autoSendEnabled: Boolean(autoSendEnabled) }
        : {}),
    },
  });
  return res.json(config);
});

// --- Empleados ---
router.get("/employees", async (_req, res) => {
  const employees = await prisma.nominaEmployee.findMany({
    orderBy: { name: "asc" },
    include: {
      deductions: { where: { isActive: true }, orderBy: { label: "asc" } },
      _count: { select: { vales: true, slips: true } },
    },
  });
  return res.json(employees);
});

router.post("/employees", async (req, res) => {
  try {
    const {
      name,
      phone,
      contactId,
      baseSalary,
      transportAllowance,
      baseBonus,
      bonusFrequency,
      isActive,
    } = req.body ?? {};
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name es requerido" });
    }

    const employee = await prisma.nominaEmployee.create({
      data: {
        name: name.toUpperCase().trim(),
        phone: phone ? normalizeWhatsAppPhoneNumber(String(phone)) : null,
        contactId: contactId ?? null,
        baseSalary: parseMoney(baseSalary ?? 0, "baseSalary"),
        transportAllowance: parseMoney(transportAllowance ?? 0, "transportAllowance"),
        baseBonus: parseMoney(baseBonus ?? 0, "baseBonus"),
        bonusFrequency: normalizeBonusFrequency(bonusFrequency),
        isActive: isActive !== false,
      },
    });
    return res.status(201).json(employee);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.patch("/employees/:id", async (req, res) => {
  try {
    const {
      name,
      phone,
      baseSalary,
      transportAllowance,
      baseBonus,
      bonusFrequency,
      isActive,
    } = req.body ?? {};
    const data: Prisma.NominaEmployeeUpdateInput = {};

    if (name !== undefined) data.name = String(name).toUpperCase().trim();
    if (phone !== undefined) {
      data.phone = phone ? normalizeWhatsAppPhoneNumber(String(phone)) : null;
    }
    if (baseSalary !== undefined) data.baseSalary = parseMoney(baseSalary, "baseSalary");
    if (transportAllowance !== undefined) {
      data.transportAllowance = parseMoney(transportAllowance, "transportAllowance");
    }
    if (baseBonus !== undefined) data.baseBonus = parseMoney(baseBonus, "baseBonus");
    if (bonusFrequency !== undefined) {
      data.bonusFrequency = normalizeBonusFrequency(bonusFrequency);
    }
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const employee = await prisma.nominaEmployee.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(employee);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/employees/:id", async (req, res) => {
  await prisma.nominaEmployee.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
});

// --- Horas extras mensuales ---
router.get("/overtime", async (req, res) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;

  const rows = await prisma.nominaOvertime.findMany({
    where: {
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          baseSalary: true,
          bonusFrequency: true,
        },
      },
    },
    orderBy: { employee: { name: "asc" } },
  });

  return res.json(
    rows.map((r) => ({
      ...r,
      daytimeHours: Number(r.daytimeHours),
      calculatedPay: calculateDaytimeOvertimePay(
        Number(r.employee.baseSalary),
        Number(r.daytimeHours)
      ),
    }))
  );
});

router.put("/overtime", async (req, res) => {
  try {
    const { employeeId, year, month, daytimeHours } = req.body ?? {};
    if (!employeeId || !year || !month) {
      return res.status(400).json({ error: "employeeId, year y month son requeridos" });
    }

    const hours = parseMoney(daytimeHours ?? 0, "daytimeHours");
    const employee = await prisma.nominaEmployee.findUniqueOrThrow({
      where: { id: String(employeeId) },
    });

    const row = await prisma.nominaOvertime.upsert({
      where: {
        employeeId_year_month: {
          employeeId: String(employeeId),
          year: Number(year),
          month: Number(month),
        },
      },
      update: { daytimeHours: hours },
      create: {
        employeeId: String(employeeId),
        year: Number(year),
        month: Number(month),
        daytimeHours: hours,
      },
      include: { employee: { select: { id: true, name: true, baseSalary: true } } },
    });

    const calculatedPay = calculateDaytimeOvertimePay(
      Number(employee.baseSalary),
      hours
    );

    return res.json({
      ...row,
      daytimeHours: Number(row.daytimeHours),
      calculatedPay,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/overtime/:id", async (req, res) => {
  await prisma.nominaOvertime.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
});

// --- Descuentos recurrentes ---
router.post("/employees/:id/deductions", async (req, res) => {
  try {
    const { label, amount, appliesTo } = req.body ?? {};
    if (!label) return res.status(400).json({ error: "label es requerido" });

    const deduction = await prisma.nominaDeduction.create({
      data: {
        employeeId: req.params.id,
        label: String(label).trim(),
        amount: parseMoney(amount, "amount"),
        appliesTo: parseAppliesTo(appliesTo),
      },
    });
    return res.status(201).json(deduction);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.patch("/deductions/:id", async (req, res) => {
  try {
    const { label, amount, appliesTo, isActive } = req.body ?? {};
    const deduction = await prisma.nominaDeduction.update({
      where: { id: req.params.id },
      data: {
        ...(label !== undefined ? { label: String(label).trim() } : {}),
        ...(amount !== undefined ? { amount: parseMoney(amount, "amount") } : {}),
        ...(appliesTo !== undefined ? { appliesTo: parseAppliesTo(appliesTo) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });
    return res.json(deduction);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/deductions/:id", async (req, res) => {
  await prisma.nominaDeduction.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
});

// --- Vales ---
router.get("/vales", async (req, res) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;
  const half = req.query.half ? Number(req.query.half) : undefined;

  const vales = await prisma.nominaVale.findMany({
    where: {
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
      ...(half ? { half } : {}),
    },
    include: { employee: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json(vales);
});

router.post("/vales", async (req, res) => {
  try {
    const {
      employeeId,
      holderName,
      amount,
      appliesTo,
      year,
      month,
      half,
      photoBase64,
      photoUrl,
      notes,
    } = req.body ?? {};

    if (!employeeId || !holderName) {
      return res.status(400).json({ error: "employeeId y holderName son requeridos" });
    }
    if (!year || !month || !half) {
      return res.status(400).json({ error: "year, month y half son requeridos" });
    }

    let finalPhotoUrl = photoUrl ? String(photoUrl) : "";
    if (photoBase64) {
      finalPhotoUrl = await uploadValePhoto(String(photoBase64));
    }
    if (!finalPhotoUrl) {
      return res.status(400).json({ error: "photoBase64 o photoUrl es requerido" });
    }

    const vale = await prisma.nominaVale.create({
      data: {
        employeeId: String(employeeId),
        holderName: String(holderName).trim(),
        amount: parseMoney(amount, "amount"),
        appliesTo: parseAppliesTo(appliesTo),
        year: Number(year),
        month: Number(month),
        half: Number(half),
        photoUrl: finalPhotoUrl,
        notes: notes ? String(notes) : null,
      },
      include: { employee: { select: { id: true, name: true } } },
    });
    return res.status(201).json(vale);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/vales/:id", async (req, res) => {
  await prisma.nominaVale.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
});

// --- Periodos y recibos ---
router.get("/periods", async (_req, res) => {
  const periods = await prisma.nominaPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }, { half: "desc" }],
    include: { _count: { select: { slips: true } } },
  });
  return res.json(periods);
});

router.post("/periods/generate", async (req, res) => {
  try {
    const { year, month, half } = req.body ?? {};
    if (!year || !month || !half) {
      return res.status(400).json({ error: "year, month y half son requeridos" });
    }
    const result = await generateSlipsForPeriod(Number(year), Number(month), Number(half) as 1 | 2);
    return res.json({
      period: result.period,
      count: result.slips.length,
      slips: result.slips.map((s) => ({
        ...s,
        publicUrl: buildSlipPublicUrl(s.accessToken),
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.get("/periods/current-half", async (_req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const half = resolvePeriodHalfForToday(year, month, day);
  return res.json({ year, month, day, half });
});

router.get("/periods/:id/slips", async (req, res) => {
  const slips = await prisma.nominaSlip.findMany({
    where: { periodId: req.params.id },
    include: { employee: { select: { id: true, name: true, phone: true } } },
    orderBy: { employee: { name: "asc" } },
  });
  return res.json(
    slips.map((s) => ({
      ...s,
      publicUrl: buildSlipPublicUrl(s.accessToken),
      grossSalary: Number(s.grossSalary),
      grossTransport: Number(s.grossTransport),
      grossBonus: Number(s.grossBonus),
      grossOvertime: Number(s.grossOvertime),
      salaryDiscounts: Number(s.salaryDiscounts),
      bonusDiscounts: Number(s.bonusDiscounts),
      netSalary: Number(s.netSalary),
      netTransport: Number(s.netTransport),
      netBonus: Number(s.netBonus),
      netOvertime: Number(s.netOvertime),
      netTotal: Number(s.netTotal),
    }))
  );
});

router.post("/periods/:id/regenerate", async (req, res) => {
  try {
    const period = await prisma.nominaPeriod.findUniqueOrThrow({
      where: { id: req.params.id },
    });
    const employees = await prisma.nominaEmployee.findMany({ where: { isActive: true } });
    const slips = [];
    for (const e of employees) {
      slips.push(await upsertSlipForEmployee(e.id, period.id));
    }
    return res.json({ count: slips.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.post("/slips/:id/send-whatsapp", async (req, res) => {
  try {
    const result = await sendSlipWhatsApp(req.params.id);
    return res.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.post("/periods/:id/send-whatsapp", async (req, res) => {
  try {
    const results = await sendAllSlipsWhatsApp(req.params.id);
    return res.json({
      ok: true,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

// Importar teléfonos desde Contactos existentes
router.post("/employees/sync-contacts", async (_req, res) => {
  const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });
  let created = 0;
  let updated = 0;

  for (const c of contacts) {
    const existing = await prisma.nominaEmployee.findFirst({
      where: { phone: c.phone },
    });
    if (existing) {
      await prisma.nominaEmployee.update({
        where: { id: existing.id },
        data: { name: c.name, contactId: c.id },
      });
      updated += 1;
      continue;
    }
    await prisma.nominaEmployee.create({
      data: {
        name: c.name,
        phone: c.phone,
        contactId: c.id,
        baseSalary: 0,
        baseBonus: 0,
      },
    });
    created += 1;
  }

  return res.json({ created, updated, total: contacts.length });
});

export default router;
