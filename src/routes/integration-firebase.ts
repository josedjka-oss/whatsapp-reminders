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
import { EMPLOYEE_NAMES } from "../services/turnos-tareas/constants";
import { loadEmployeePhone } from "../services/turnos-tareas/firestore";
import { sendWhatsAppMessage } from "../services/twilio";
import { normalizeWhatsAppPhoneNumber } from "../utils/whatsapp-phone-normalize";

const router = Router();

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

type TaskKind = "ASEO_RECEPCION" | "COCINA_RECEPCION" | "SACAR_BASURA";

const TASK_META: Record<
  TaskKind,
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

const normalizeTaskKind = (raw: unknown): TaskKind | null => {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s.-]+/g, "_");

  if (s === "ASEO_RECEPCION" || s === "ASEO" || s === "RECEPCION") {
    return "ASEO_RECEPCION";
  }
  if (s === "COCINA_RECEPCION" || s === "COCINA" || s === "COCINA_PASILLO" || s === "ASEO_COCINA_PASILLO") {
    return "COCINA_RECEPCION";
  }
  if (s === "SACAR_BASURA" || s === "BASURA") {
    return "SACAR_BASURA";
  }

  return null;
};

/** Día civil en Bogotá (UTC-5 fijo sin DST) sobre el que etiquetamos el mensaje */
const noonBogotaOnDateStr = (ymd: string): Date => parseISO(`${ymd}T12:00:00-05:00`);

const buildIntegratedReminderBody = (
  task: TaskKind,
  anchorDateUtc: Date
): string => {
  const meta = TASK_META[task];
  const datePart = formatInTimeZone(anchorDateUtc, APP_TIMEZONE, "EEEE d 'de' MMMM yyyy", {
    locale: es,
  });
  return `${meta.label} — ${datePart}, ${meta.timeLabel}`;
};

/** Versión del contrato de tareas (útil para verificar deploy en Render). */
export const INTEGRATION_TASKS_VERSION = "2026-07-03-empId";

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
    tasks: Object.keys(TASK_META),
    labels: Object.fromEntries(
      (Object.keys(TASK_META) as TaskKind[]).map((k) => [k, TASK_META[k].label])
    ),
    contract: {
      post: "/api/integration/firebase/whatsapp",
      required: "task + (phone | empId)",
      optional: "date (yyyy-MM-DD)",
      forbidden: ["message", "body", "nombre", "name", "employeeName"],
    },
  });
});

/**
 * Solo WHATS arma el texto y envía por Twilio. Turnos u otra app manda señal suelta: tarea + destino.
 *
 * POST /api/integration/firebase/whatsapp
 *
 * Headers: Authorization: Bearer <INTEGRATION_FIREBASE_SECRET> | x-api-key misma valor
 *
 * Body JSON obligatorio:
 *  - task o tipo o kind — ASEO_RECEPCION | COCINA_RECEPCION | SACAR_BASURA (aliases: ASEO, COCINA, BASURA, …)
 *  - Destino (uno de los dos):
 *      · empId o employeeId o empleadoId — WHATS busca teléfono en Firebase empleadosTelefonos y registra contacto si falta
 *      · phone o to — debe existir en tabla Contact (mismo formato que /api/contacts)
 *
 * Opcional:
 *  - date o dia o referenceDate — yyyy-MM-DD (fecha a mostrar; por defecto hoy en APP_TIMEZONE)
 *
 * Prohibido (400 si vienen en el JSON): message, body, text, nombre, name, contenido arbitrario ajeno al contrato (ver FORBIDDEN_INTEGRATION_BODY_KEYS).
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

      const taskKind = normalizeTaskKind(rawTask);
      if (!taskKind) {
        return res.status(400).json({
          error:
            'Falta "task" válido (o "tipo" / "kind"): ASEO_RECEPCION, COCINA_RECEPCION o SACAR_BASURA.',
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
        resolvedEmpId = rawEmpId.trim();
        const phoneFromFirebase = await loadEmployeePhone(resolvedEmpId);
        if (!phoneFromFirebase) {
          return res.status(404).json({
            error: `Sin teléfono en Firebase empleadosTelefonos para empId "${resolvedEmpId}".`,
            empId: resolvedEmpId,
          });
        }
        to = normalizeWhatsAppPhoneNumber(phoneFromFirebase);
        const displayName = EMPLOYEE_NAMES[resolvedEmpId] || resolvedEmpId;
        const contactCheck = await ensureContactForIntegration(to, displayName, {
          autoCreate: true,
        });
        if (!contactCheck.ok) {
          return res.status(contactCheck.status).json({ error: contactCheck.reason });
        }
        contactName = contactCheck.contactName;
      } else {
        to = normalizeWhatsAppPhoneNumber(rawPhone.trim());
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

      /** Sin prefijo nombre; mismo tono para plantilla WhatsApp ({1}). */
      const reminderText = buildIntegratedReminderBody(taskKind, anchorDateUtc);

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
