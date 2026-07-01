import { Router, Request, Response, NextFunction } from "express";
import {
  previewTasksForDate,
  processDueTasks,
  sendTaskForDate,
} from "../services/turnos-tareas/service";
import type { TaskKind } from "../services/turnos-tareas/types";

const router = Router();

const VALID_TASKS = new Set<TaskKind>([
  "ASEO_RECEPCION",
  "COCINA_RECEPCION",
  "SACAR_BASURA",
]);

const requireTurnosSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowed = [
    process.env.INTEGRATION_FIREBASE_SECRET?.trim(),
    process.env.ADMIN_PASSWORD?.trim(),
  ].filter((v): v is string => Boolean(v));

  if (!allowed.length) {
    res.status(503).json({
      error:
        "INTEGRATION_FIREBASE_SECRET o ADMIN_PASSWORD debe estar configurado.",
    });
    return;
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const apiKeyRaw = req.headers["x-api-key"];
  const apiKey = typeof apiKeyRaw === "string" ? apiKeyRaw.trim() : undefined;
  const provided = bearer || apiKey;

  if (!provided || !allowed.includes(provided)) {
    res.status(401).json({ error: "Credencial inválida" });
    return;
  }
  next();
};

/**
 * GET /api/turnos/tareas/preview?date=yyyy-MM-dd
 * Fuente única: planilla Firebase + motor de asignación Render
 */
router.get("/preview", async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date debe ser yyyy-MM-dd" });
    }
    const preview = await previewTasksForDate(date);
    return res.json({ ok: true, source: "render-planilla", ...preview });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/turnos/tareas/send
 * Body: { date, task, force?: boolean }
 */
router.post("/send", requireTurnosSecret, async (req: Request, res: Response) => {
  try {
    const date = String(req.body.date ?? req.body.fecha ?? "").trim();
    const task = String(req.body.task ?? req.body.tipo ?? "").trim() as TaskKind;
    const force = Boolean(req.body.force);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date debe ser yyyy-MM-dd" });
    }
    if (!VALID_TASKS.has(task)) {
      return res.status(400).json({
        error: "task inválida (ASEO_RECEPCION | COCINA_RECEPCION | SACAR_BASURA)",
      });
    }

    const result = await sendTaskForDate(date, task, { force });
    const status = result.ok ? 200 : result.skipped ? 200 : 500;
    return res.status(status).json({ source: "render-planilla", ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

/**
 * POST /api/turnos/tareas/process-due
 * Cron manual / catch-up del día
 */
router.post(
  "/process-due",
  requireTurnosSecret,
  async (_req: Request, res: Response) => {
    try {
      await processDueTasks();
      return res.json({ ok: true, source: "render-planilla" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: message });
    }
  }
);

export default router;
