import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireAuth as requireAdminAuth } from "../middleware/auth";
import {
  assertPrestamoGroupEditable,
  assertQuincenaDescuentoEditable,
  assertValeEditable,
  buildPrimaWhatsAppMessageForEmployee,
  buildSlipPublicUrl,
  closeQuincena,
  createNominaValeOrPrestamo,
  createOpenQuincena,
  createQuincenaDescuento,
  generateSlipsForPeriod,
  generateAndSendSlipForEmployee,
  getOrCreateScheduleConfig,
  getPeriodDetail,
  getPeriodSummary,
  getPeriodSummaryById,
  getSlipByToken,
  resolvePeriodHalfForToday,
  sendAllSlipsWhatsApp,
  sendAllPrimaWhatsApp,
  sendPrimaWhatsApp,
  sendSlipWhatsApp,
  serializeNominaSlipForApi,
  uploadValePhoto,
  upsertSlipForEmployee,
} from "../services/nomina-service";
import { normalizeWhatsAppPhoneNumber } from "../utils/whatsapp-phone-normalize";
import {
  calculateDaytimeOvertimePay,
  hourlyRateFromMonthlySalary,
  normalizeBonusFrequency,
  normalizeMonthlyHoursBase,
} from "../utils/nomina-calculations";
import {
  computePrimaForEmployee,
  parseDateOnly,
  PRIMA_EXAMPLES,
  type PrimaSemester,
} from "../utils/nomina-prima-calculations";

const router = Router();

const parseAppliesTo = (raw: unknown): "SALARY" | "BONUS" => {
  const s = String(raw ?? "SALARY").toUpperCase();
  return s === "BONUS" ? "BONUS" : "SALARY";
};

const parseHoursBase = (raw: unknown, field: string): number => {
  if (raw === undefined || raw === null || raw === "") {
    return normalizeMonthlyHoursBase(undefined);
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    throw new Error(`${field} debe ser un entero > 0 (ej. 240, 220, 200)`);
  }
  return n;
};

const parseMoney = (raw: unknown, field: string): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${field} debe ser un número >= 0`);
  }
  return n;
};

const parseHireDate = (raw: unknown): Date | null | undefined => {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  const parsed = parseDateOnly(String(raw));
  if (!parsed) throw new Error("hireDate debe ser YYYY-MM-DD");
  return parsed;
};

const parsePrimaSemester = (raw: unknown): PrimaSemester => {
  const n = Number(raw ?? 1);
  return n === 2 ? 2 : 1;
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
    const hoursBase =
      req.query.hoursBase !== undefined
        ? parseHoursBase(req.query.hoursBase, "hoursBase")
        : req.query.monthlyHoursBase !== undefined
          ? parseHoursBase(req.query.monthlyHoursBase, "monthlyHoursBase")
          : 240;
    const hourlyRate = hourlyRateFromMonthlySalary(salary, hoursBase);
    const total = calculateDaytimeOvertimePay(salary, hours, hoursBase);
    return res.json({
      monthlySalary: salary,
      daytimeHours: hours,
      monthlyHoursBase: hoursBase,
      hourlyRate,
      overtimeUnitRate: hourlyRate * 1.25,
      totalOvertimePay: total,
      formula: `salario/${hoursBase} × 1.25 × horas`,
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
      monthlyHoursBase,
      hireDate,
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
        monthlyHoursBase:
          monthlyHoursBase !== undefined
            ? parseHoursBase(monthlyHoursBase, "monthlyHoursBase")
            : 240,
        hireDate: parseHireDate(hireDate) ?? null,
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
      monthlyHoursBase,
      hireDate,
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
    if (monthlyHoursBase !== undefined) {
      data.monthlyHoursBase = parseHoursBase(monthlyHoursBase, "monthlyHoursBase");
    }
    if (hireDate !== undefined) {
      data.hireDate = parseHireDate(hireDate);
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

// --- Prima de servicios ---
router.get("/prima/examples", (_req, res) => {
  return res.json({
    formula: "((Salario + auxilio transporte) × Días trabajados) / 360",
    daysConvention: "Meses de 30 días; semestre completo = 180 días",
    semester1: "1 enero – 30 junio (180 días)",
    semester2: "1 julio – 31 diciembre (180 días)",
    examples: PRIMA_EXAMPLES,
  });
});

router.get("/prima/preview", async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const semester = parsePrimaSemester(req.query.semester);
    const onlyActive = req.query.onlyActive !== "0";

    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: "year inválido" });
    }

    const employees = await prisma.nominaEmployee.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
    });

    const rows = employees.map((emp) => {
      const hireDate = emp.hireDate ? parseDateOnly(emp.hireDate) : null;
      const calc = computePrimaForEmployee({
        baseSalary: Number(emp.baseSalary),
        transportAllowance: Number(emp.transportAllowance),
        hireDate,
        year,
        semester,
      });
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        phone: emp.phone,
        isActive: emp.isActive,
        ...calc,
      };
    });

    const totalPrima = rows.reduce((sum, r) => sum + r.primaAmount, 0);

    return res.json({
      year,
      semester,
      semesterLabel: rows[0]?.semesterLabel ?? "",
      formula: "((Salario + auxilio transporte) × Días trabajados) / 360",
      totalPrima,
      rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.get("/prima/calculate", (req, res) => {
  try {
    const monthlySalary = parseMoney(req.query.monthlySalary ?? 0, "monthlySalary");
    const transportAllowance = parseMoney(
      req.query.transportAllowance ?? 0,
      "transportAllowance"
    );
    const year = Number(req.query.year) || new Date().getFullYear();
    const semester = parsePrimaSemester(req.query.semester);
    const hireRaw = String(req.query.hireDate ?? "").trim();
    const hireDate = hireRaw ? parseDateOnly(hireRaw) : parseDateOnly(`${year}-01-01`);

    if (!hireDate) {
      return res.status(400).json({ error: "hireDate inválido (YYYY-MM-DD)" });
    }

    const result = computePrimaForEmployee({
      baseSalary: monthlySalary,
      transportAllowance,
      hireDate,
      year,
      semester,
    });

    return res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.get("/prima/message-preview", async (req, res) => {
  try {
    const employeeId = String(req.query.employeeId ?? "").trim();
    const year = Number(req.query.year) || new Date().getFullYear();
    const semester = parsePrimaSemester(req.query.semester);

    if (!employeeId) {
      return res.status(400).json({ error: "employeeId es requerido" });
    }

    const message = await buildPrimaWhatsAppMessageForEmployee(
      employeeId,
      year,
      semester
    );
    return res.json({ message });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.post("/prima/send-whatsapp", async (req, res) => {
  try {
    const employeeId = String(req.body?.employeeId ?? "").trim();
    const year = Number(req.body?.year) || new Date().getFullYear();
    const semester = parsePrimaSemester(req.body?.semester);

    if (!employeeId) {
      return res.status(400).json({ error: "employeeId es requerido" });
    }

    const result = await sendPrimaWhatsApp(employeeId, year, semester);
    return res.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.post("/prima/send-whatsapp-all", async (req, res) => {
  try {
    const year = Number(req.body?.year) || new Date().getFullYear();
    const semester = parsePrimaSemester(req.body?.semester);
    const result = await sendAllPrimaWhatsApp(year, semester);
    return res.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
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
          monthlyHoursBase: true,
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
        Number(r.daytimeHours),
        r.employee.monthlyHoursBase ?? 240
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
      hours,
      employee.monthlyHoursBase ?? 240
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
      totalAmount,
      appliesTo,
      year,
      month,
      half,
      kind,
      installmentCount,
      quincenas,
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

    const entryKind =
      String(kind ?? "VALE").toUpperCase() === "PRESTAMO" ? "PRESTAMO" : "VALE";

    let finalPhotoUrl: string | null = photoUrl ? String(photoUrl) : null;
    if (photoBase64) {
      finalPhotoUrl = await uploadValePhoto(String(photoBase64));
    }
    if (entryKind === "VALE" && !finalPhotoUrl) {
      return res.status(400).json({ error: "Los vales requieren foto (photoBase64)" });
    }

    const money =
      entryKind === "PRESTAMO"
        ? parseMoney(totalAmount ?? amount, "totalAmount")
        : parseMoney(amount, "amount");

    const installmentsRaw = installmentCount ?? quincenas ?? 1;
    const installments = Math.max(1, Math.min(36, Number(installmentsRaw) || 1));

    const result = await createNominaValeOrPrestamo({
      employeeId: String(employeeId),
      holderName: String(holderName),
      amount: money,
      appliesTo: parseAppliesTo(appliesTo),
      year: Number(year),
      month: Number(month),
      half: Number(half) as 1 | 2,
      kind: entryKind,
      installmentCount: installments,
      photoUrl: finalPhotoUrl,
      notes: notes ? String(notes) : null,
    });

    return res.status(201).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/vales/group/:prestamoGroupId", async (req, res) => {
  try {
    await assertPrestamoGroupEditable(req.params.prestamoGroupId);
    const deleted = await prisma.nominaVale.deleteMany({
      where: { prestamoGroupId: req.params.prestamoGroupId },
    });
    return res.json({ ok: true, deleted: deleted.count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/vales/:id", async (req, res) => {
  try {
    await assertValeEditable(req.params.id);
    await prisma.nominaVale.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

// --- Descuentos de quincena (nombre libre, foto opcional) ---
router.get("/descuentos-quincena", async (req, res) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;
  const half = req.query.half ? Number(req.query.half) : undefined;

  const rows = await prisma.nominaQuincenaDescuento.findMany({
    where: {
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
      ...(half ? { half } : {}),
    },
    include: { employee: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json(rows);
});

router.post("/descuentos-quincena", async (req, res) => {
  try {
    const { employeeId, label, amount, appliesTo, year, month, half, photoBase64, photoUrl } =
      req.body ?? {};

    if (!employeeId || !label) {
      return res.status(400).json({ error: "employeeId y label son requeridos" });
    }
    if (!year || !month || !half) {
      return res.status(400).json({ error: "year, month y half son requeridos" });
    }

    let finalPhotoUrl: string | null = photoUrl ? String(photoUrl) : null;
    if (photoBase64) {
      finalPhotoUrl = await uploadValePhoto(String(photoBase64));
    }

    const row = await createQuincenaDescuento({
      employeeId: String(employeeId),
      label: String(label),
      amount: parseMoney(amount, "amount"),
      appliesTo: parseAppliesTo(appliesTo),
      year: Number(year),
      month: Number(month),
      half: Number(half) as 1 | 2,
      photoUrl: finalPhotoUrl,
    });

    return res.status(201).json(row);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.delete("/descuentos-quincena/:id", async (req, res) => {
  try {
    await assertQuincenaDescuentoEditable(req.params.id);
    await prisma.nominaQuincenaDescuento.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

// --- Resumen quincenal ---
router.get("/summary", async (req, res) => {
  try {
    const periodId = req.query.periodId ? String(req.query.periodId) : null;
    if (periodId) {
      const summary = await getPeriodSummaryById(periodId);
      return res.json(summary);
    }

    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const half = Number(req.query.half) as 1 | 2;
    if (!year || !month || (half !== 1 && half !== 2)) {
      return res.status(400).json({
        error: "periodId o (year, month y half) son requeridos",
      });
    }
    const summary = await getPeriodSummary(year, month, half);
    return res.json(summary);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

// --- Periodos y recibos ---
router.get("/periods", async (_req, res) => {
  const periods = await prisma.nominaPeriod.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }, { half: "desc" }],
    include: { _count: { select: { slips: true } } },
  });
  return res.json(
    periods.map((p) => ({
      ...p,
      periodLabel: p.label ?? `${p.year}-${String(p.month).padStart(2, "0")} Q${p.half}`,
    }))
  );
});

router.post("/periods/open", async (req, res) => {
  try {
    const { year, month, half } = req.body ?? {};
    if (!year || !month || !half) {
      return res.status(400).json({ error: "year, month y half son requeridos" });
    }
    const period = await createOpenQuincena(
      Number(year),
      Number(month),
      Number(half) as 1 | 2
    );
    return res.status(201).json({
      period: {
        ...period,
        periodLabel: period.label,
      },
      created: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
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

router.get("/periods/:id", async (req, res) => {
  try {
    const detail = await getPeriodDetail(req.params.id);
    return res.json(detail);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(404).json({ error: message });
  }
});

router.post("/periods/:id/close", async (req, res) => {
  try {
    const period = await closeQuincena(req.params.id);
    return res.json({
      ok: true,
      period: {
        ...period,
        periodLabel: period.label,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.post("/periods/:id/slips/generate", async (req, res) => {
  try {
    const { employeeId } = req.body ?? {};
    if (!employeeId) {
      return res.status(400).json({ error: "employeeId es requerido" });
    }

    const period = await prisma.nominaPeriod.findUniqueOrThrow({
      where: { id: req.params.id },
    });
    if (period.status === "closed") {
      return res.status(400).json({ error: "No se puede generar recibos en una quincena cerrada." });
    }

    const slip = await upsertSlipForEmployee(String(employeeId), period.id);
    return res.json({
      slip: serializeNominaSlipForApi(slip),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.post("/periods/:id/slips/generate-and-send", async (req, res) => {
  try {
    const { employeeId } = req.body ?? {};
    if (!employeeId) {
      return res.status(400).json({ error: "employeeId es requerido" });
    }

    const period = await prisma.nominaPeriod.findUniqueOrThrow({
      where: { id: req.params.id },
    });
    if (period.status === "closed") {
      return res.status(400).json({ error: "No se puede enviar recibos en una quincena cerrada." });
    }

    const { slip, whatsapp } = await generateAndSendSlipForEmployee(
      String(employeeId),
      period.id
    );
    return res.json({
      ok: true,
      slip: serializeNominaSlipForApi(slip),
      whatsapp,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(400).json({ error: message });
  }
});

router.get("/periods/:id/slips", async (req, res) => {
  const slips = await prisma.nominaSlip.findMany({
    where: { periodId: req.params.id },
    include: { employee: { select: { id: true, name: true, phone: true } } },
    orderBy: { employee: { name: "asc" } },
  });
  return res.json(
    slips.map((s) => serializeNominaSlipForApi(s))
  );
});

router.get("/slips/:id", async (req, res) => {
  try {
    const slip = await prisma.nominaSlip.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { employee: { select: { id: true, name: true, phone: true } } },
    });
    return res.json(serializeNominaSlipForApi(slip));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return res.status(404).json({ error: message });
  }
});

router.post("/periods/:id/regenerate", async (req, res) => {
  try {
    const period = await prisma.nominaPeriod.findUniqueOrThrow({
      where: { id: req.params.id },
    });
    if (period.status === "closed") {
      return res.status(400).json({ error: "No se puede recalcular una quincena cerrada." });
    }
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
    const slip = await prisma.nominaSlip.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { employee: { select: { id: true, name: true, phone: true } } },
    });
    return res.json({ ok: true, slip: serializeNominaSlipForApi(slip), ...result });
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
