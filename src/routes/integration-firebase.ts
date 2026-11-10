import {
  Router,
  Request,
  Response,
  NextFunction,
} from "express";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { prisma } from "../db";
import {
  buildAseoBanoReminderText,
  INTEGRATION_TASK_LABELS,
  type IntegrationTaskKind,
  isMessengerAllowedForTask,
  messengerBlockReason,
  normalizeIntegrationTaskKind,
  resolveIntegrationEmployee,
} from "../services/integration-turnos-tasks";
import { sendWhatsAppMessage } from "../services/twilio";
import { normalizeWhatsAppPhoneNumber } from "../utils/whatsapp-phone-normalize";

const router = Router();

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

const TASK_META: Record<
  Exclude<IntegrationTaskKind, "ASEO_BANO">,
  { label: string; timeLabel: string }
> = {
  ASEO_RECEPCION: {
    label: "Aseo Recepción",
    timeLabel: "9:00 a.m.",
  },
  COCINA_RECEPCION: {
    label: "Aseo Cocina-Pasillo",
    timeLabel: "9:00 a.m.",
  },
  SACAR_BASURA: {
    label: "Sacar Basura",
    timeLabel: "6:00 p.m.",
  },
};

/** Firebase Functions o proxy Vercel (ADMIN_PASSWORD como alternativa en panel). */
const requireIntegrationSecret = (
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
        "INTEGRATION_FIREBASE_SECRET o ADMIN_PASSWORD debe estar configurado en el servidor.",
    });
    return;
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const apiKeyRaw = req.headers["x-api-key"];
  const apiKey =
    typeof apiKeyRaw === "string"
      ? apiKeyRaw.trim()
      : undefined;
  const provided = bearer || apiKey;

  if (!provided || !allowed.includes(provided)) {
    res.status(401).json({
      error: "Credencial de integración inválida. Usa Authorization: Bearer … o header x-api-key.",
    });
    return;
  }
  next();
};

/** Día civil en Bogotá (UTC-5 fijo sin DST) sobre el que etiquetamos el mensaje */
const noonBogotaOnDateStr = (ymd: string): Date => parseISO(`${ymd}T12:00:00-05:00`);

const buildIntegratedReminderBody = (
  task: IntegrationTaskKind,
  anchorDateUtc: Date,
  displayName: string
): string => {
  if (task === "ASEO_BANO") {
    return buildAseoBanoReminderText(displayName);
  }

  const meta = TASK_META[task];
  const datePart = formatInTimeZone(anchorDateUtc, APP_TIMEZONE, "EEEE d 'de' MMMM yyyy", {
    locale: es,
  });
  return `${meta.label} — ${datePart}, ${meta.timeLabel}`;
};

/** Versión del contrato de tareas (útil para verificar deploy en Render). */
export const INTEGRATION_TASKS_VERSION = "2026-11-11-aseo-bano-mensajeros";

const outboundBodyFilterForTask = (task: IntegrationTaskKind): { startsWith: string } => {
  if (task === "ASEO_BANO") {
    return { startsWith: "Hola " };
  }
  return { startsWith: INTEGRATION_TASK_LABELS[task] };
};

const ensureContactForIntegration = async (
  phone: string,
  name: string,
  options: { autoCreate: boolean }
): Promise<
  | { ok: true; contactName: string }
  | { ok: false; reason: string; status: 404 | 500 }
> => {
  const normalized = normalizeWhatsAppPhoneNumber(phone);
  const existing = await prisma.contact.findUnique({ where: { phone: normalized } });
  if (existing) {
    return { ok: true, contactName: existing.name };
  }

  if (!options.autoCreate) {
    return {
      ok: false,
      status: 404,
      reason:
        "Este teléfono no existe en nuestra tabla de contactos (/api/contacts). Registra el número antes.",
    };
  }

  try {
    await prisma.contact.create({
      data: { name, phone: normalized },
    });
    return { ok: true, contactName: name };
  } catch {
    return {
      ok: false,
      status: 500,
      reason: `Teléfono ${normalized} no está en contactos y no se pudo registrar automáticamente.`,
    };
  }
};

router.get("/firebase/tasks", (_req, res) => {
  return res.json({
    version: INTEGRATION_TASKS_VERSION,
    tasks: Object.keys(INTEGRATION_TASK_LABELS),
    labels: INTEGRATION_TASK_LABELS,
    messengersAllowed: {
      ASEO_RECEPCION: false,
      ASEO_BANO: true,
      COCINA_RECEPCION: true,
      SACAR_BASURA: true,
    },
    contract: {
      post: "/api/integration/firebase/whatsapp",
      required: "task + (phone | empId)",
      optional: "date (yyyy-MM-DD)",
      forbidden: ["message", "body", "nombre", "name", "employeeName"],
      responseStatus: "/api/integration/firebase/task-response-status",
    },
  });
});

/**
 * ¿El mensaje de tarea del día ya tiene respuesta inbound?
 * GET /api/integration/firebase/task-response-status?date=yyyy-MM-dd&task=COCINA_RECEPCION&empId=...
 */
router.get(
  "/firebase/task-response-status",
  requireIntegrationSecret,
  async (req: Request, res: Response) => {
    try {
      const date = String(req.query.date || "").trim();
      const taskKind = normalizeIntegrationTaskKind(req.query.task);
      const empId = String(req.query.empId || "").trim() || null;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "date debe ser yyyy-MM-dd" });
      }
      if (!taskKind) {
        return res.status(400).json({
          error:
            "task inválida (ASEO_RECEPCION | COCINA_RECEPCION | SACAR_BASURA | ASEO_BANO)",
        });
      }

      const [year, month, day] = date.split("-").map(Number);
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999));
      const bodyFilter = outboundBodyFilterForTask(taskKind);

      let phoneFilter: string | null = null;
      if (empId) {
        const resolved = await resolveIntegrationEmployee(empId);
        if (resolved.phone) {
          phoneFilter = normalizeWhatsAppPhoneNumber(resolved.phone);
        }
      }

      const outbound = await prisma.message.findMany({
        where: {
          direction: "outbound",
          createdAt: { gte: startOfDay, lte: endOfDay },
          body: bodyFilter,
          ...(phoneFilter ? { to: phoneFilter } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      if (!outbound.length) {
        return res.json({
          ok: true,
          date,
          task: taskKind,
          empId,
          found: false,
          hasResponse: false,
          sentAt: null,
          responseAt: null,
          messageId: null,
        });
      }

      const sent = outbound[0];
      const phoneDigits = String(sent.to || "").replace(/\D/g, "");
      const response = await prisma.message.findFirst({
        where: {
          direction: "inbound",
          createdAt: { gte: sent.createdAt },
          OR: [
            { from: sent.to },
            ...(phoneDigits
              ? [{ from: { contains: phoneDigits.slice(-10) } }]
              : []),
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return res.json({
        ok: true,
        date,
        task: taskKind,
        empId,
        found: true,
        hasResponse: Boolean(response),
        sentAt: sent.createdAt,
        responseAt: response?.createdAt || null,
        messageId: sent.id,
        to: sent.to,
      });
    } catch (error: any) {
      console.error(
        "[INTEGRATION] task-response-status:",
        error?.message ?? error
      );
      return res.status(500).json({
        error: error.message || "Error consultando respuesta",
      });
    }
  }
);

/**
 * Solo WHATS arma el texto y envía por Twilio. Turnos u otra app manda señal suelta: tarea + destino.
 *
 * POST /api/integration/firebase/whatsapp
 */
const FORBIDDEN_INTEGRATION_BODY_KEYS = [
  "message",
  "body",
  "text",
  "content",
  "mensaje",
  "name",
  "nombre",
  "externalName",
  "external_name",
  "namesFromFirebase",
  "employeeName",
] as const;

router.post(
  "/firebase/whatsapp",
  requireIntegrationSecret,
  async (req: Request, res: Response) => {
    try {
      const forbiddenPresent = FORBIDDEN_INTEGRATION_BODY_KEYS.filter(
        (key) =>
          typeof req.body === "object" &&
          req.body !== null &&
          key in req.body &&
          req.body[key as keyof typeof req.body] !== undefined
      );
      if (forbiddenPresent.length > 0) {
        return res.status(400).json({
          error:
            `No envíes nombres ni texto del mensaje. Campos no permitidos: ${forbiddenPresent.join(", ")}. Usa task + (empId o phone) y opcional date.`,
        });
      }

      const rawPhone = req.body.phone ?? req.body.to;
      const rawEmpId =
        req.body.empId ?? req.body.employeeId ?? req.body.empleadoId;
      const rawTask =
        req.body.task ?? req.body.tipo ?? req.body.kind;

      const rawDay =
        req.body.date ??
        req.body.dia ??
        req.body.referenceDate ??
        req.body.reference_date;

      const taskKind = normalizeIntegrationTaskKind(rawTask);
      if (!taskKind) {
        return res.status(400).json({
          error:
            'Falta "task" válido (o "tipo" / "kind"): ASEO_RECEPCION, COCINA_RECEPCION, SACAR_BASURA, ASEO_BANO.',
        });
      }

      const hasPhone = typeof rawPhone === "string" && rawPhone.trim().length > 0;
      const hasEmpId = typeof rawEmpId === "string" && rawEmpId.trim().length > 0;

      if (!hasPhone && !hasEmpId) {
        return res.status(400).json({
          error:
            'Falta destino: "empId" (recomendado para Turnos) o "phone" registrado en contactos.',
        });
      }

      let to: string;
      let resolvedEmpId: string | null = null;
      let contactName: string;

      if (hasEmpId) {
        const resolved = await resolveIntegrationEmployee(String(rawEmpId).trim());
        resolvedEmpId = resolved.empId;
        contactName = resolved.displayName;

        if (!isMessengerAllowedForTask(taskKind, resolvedEmpId)) {
          return res.status(403).json({
            error: messengerBlockReason(taskKind),
            task: taskKind,
            empId: resolvedEmpId,
          });
        }

        if (!resolved.phone) {
          return res.status(404).json({
            error: `Sin teléfono en Firebase empleadosTelefonos ni en nómina para empId "${resolvedEmpId}".`,
            empId: resolvedEmpId,
          });
        }
        to = normalizeWhatsAppPhoneNumber(resolved.phone);
        const contactCheck = await ensureContactForIntegration(to, contactName, {
          autoCreate: true,
        });
        if (!contactCheck.ok) {
          return res.status(contactCheck.status).json({ error: contactCheck.reason });
        }
        contactName = contactCheck.contactName;
      } else {
        to = normalizeWhatsAppPhoneNumber(String(rawPhone).trim());
        const contactCheck = await ensureContactForIntegration(to, to, {
          autoCreate: false,
        });
        if (!contactCheck.ok) {
          return res.status(contactCheck.status).json({ error: contactCheck.reason });
        }
        contactName = contactCheck.contactName;
      }

      let anchorDateUtc: Date;
      if (typeof rawDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDay.trim())) {
        anchorDateUtc = noonBogotaOnDateStr(rawDay.trim());
      } else if (rawDay !== undefined && rawDay !== null && rawDay !== "") {
        return res.status(400).json({
          error:
            '"date" debe ser yyyy-MM-DD o omítelo para usar la fecha actual en zona horaria de la aplicación.',
        });
      } else {
        anchorDateUtc = noonBogotaOnDateStr(
          formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd")
        );
      }

      const reminderText = buildIntegratedReminderBody(
        taskKind,
        anchorDateUtc,
        contactName
      );

      const sid = await sendWhatsAppMessage({
        to,
        reminderText,
      });

      return res.status(200).json({
        ok: true,
        twilioSid: sid,
        to,
        task: taskKind,
        empId: resolvedEmpId,
        contactFound: contactName,
        reminderTextBuilt: reminderText,
      });
    } catch (error: any) {
      console.error("[INTEGRATION] firebase/whatsapp:", error?.message ?? error);
      const status =
        typeof error?.message === "string" &&
        error.message.includes("inválido")
          ? 400
          : 500;
      return res.status(status).json({
        error: error.message || "Error enviando por integración Firebase",
      });
    }
  }
);

export default router;
