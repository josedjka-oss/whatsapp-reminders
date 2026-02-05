import { Router, Request, Response } from "express";
import { prisma } from "../db";

const router = Router();

// Crear recordatorio
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("[REMINDERS POST] Body recibido:", JSON.stringify(req.body, null, 2));
    
    const {
      to,
      body,
      scheduleType,
      sendAt,
      hour,
      minute,
      dayOfWeek,
      dayOfMonth,
      timezone = "America/Bogota",
    } = req.body;

    console.log("[REMINDERS POST] scheduleType:", scheduleType);
    console.log("[REMINDERS POST] dayOfWeek:", dayOfWeek);
    console.log("[REMINDERS POST] hour:", hour);
    console.log("[REMINDERS POST] minute:", minute);

    // Validaciones básicas
    if (!to || !body || !scheduleType) {
      return res.status(400).json({
        error: "to, body y scheduleType son requeridos",
      });
    }

    if (!["once", "daily", "weekly", "monthly"].includes(scheduleType)) {
      return res.status(400).json({
        error: "scheduleType debe ser: once, daily, weekly o monthly",
      });
    }

    // Validaciones según tipo
    if (scheduleType === "once" && !sendAt) {
      return res.status(400).json({
        error: "sendAt es requerido para scheduleType 'once'",
      });
    }

    if (scheduleType === "daily" && (hour === null || hour === undefined || minute === null || minute === undefined)) {
      return res.status(400).json({
        error: "hour y minute son requeridos para scheduleType 'daily'",
      });
    }

    if (scheduleType === "weekly" && (dayOfWeek === null || dayOfWeek === undefined || hour === null || hour === undefined || minute === null || minute === undefined)) {
      return res.status(400).json({
        error: "dayOfWeek, hour y minute son requeridos para scheduleType 'weekly'",
      });
    }

    if (scheduleType === "monthly" && (dayOfMonth === null || dayOfMonth === undefined || hour === null || hour === undefined || minute === null || minute === undefined)) {
      return res.status(400).json({
        error: "dayOfMonth, hour y minute son requeridos para scheduleType 'monthly'",
      });
    }

    const reminderData = {
      to,
      body,
      scheduleType,
      sendAt: sendAt ? new Date(sendAt) : null,
      hour: hour !== null && hour !== undefined ? parseInt(hour) : null,
      minute: minute !== null && minute !== undefined ? parseInt(minute) : null,
      dayOfWeek: dayOfWeek !== null && dayOfWeek !== undefined ? parseInt(dayOfWeek) : null,
      dayOfMonth: dayOfMonth !== null && dayOfMonth !== undefined ? parseInt(dayOfMonth) : null,
      timezone,
      isActive: true,
    };

    console.log("[REMINDERS POST] Datos a guardar:", JSON.stringify(reminderData, null, 2));

    const reminder = await prisma.reminder.create({
      data: reminderData,
    });

    console.log("[REMINDERS POST] Recordatorio creado:", JSON.stringify(reminder, null, 2));

    return res.status(201).json(reminder);
  } catch (error: any) {
    console.error("Error creando recordatorio:", error);
    return res.status(500).json({
      error: error.message || "Error al crear recordatorio",
    });
  }
});

// Listar recordatorios
router.get("/", async (req: Request, res: Response) => {
  try {
    const { isActive, scheduleType } = req.query;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }
    if (scheduleType) {
      where.scheduleType = scheduleType;
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(reminders);
  } catch (error: any) {
    console.error("Error listando recordatorios:", error);
    return res.status(500).json({
      error: error.message || "Error al listar recordatorios",
    });
  }
});

// Actualizar recordatorio
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    // Campos que se pueden actualizar
    const allowedFields = [
      "to",
      "body",
      "scheduleType",
      "sendAt",
      "hour",
      "minute",
      "dayOfWeek",
      "dayOfMonth",
      "timezone",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "sendAt" && req.body[field]) {
          updateData[field] = new Date(req.body[field]);
        } else if (field === "hour" || field === "minute" || field === "dayOfWeek" || field === "dayOfMonth") {
          updateData[field] = req.body[field] !== null ? parseInt(req.body[field]) : null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData,
    });

    return res.json(reminder);
  } catch (error: any) {
    console.error("Error actualizando recordatorio:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }
    return res.status(500).json({
      error: error.message || "Error al actualizar recordatorio",
    });
  }
});

// Eliminar recordatorio
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.reminder.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    console.error("Error eliminando recordatorio:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }
    return res.status(500).json({
      error: error.message || "Error al eliminar recordatorio",
    });
  }
});

export default router;
