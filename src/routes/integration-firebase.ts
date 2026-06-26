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
    label: "Cocina Recepción",
    timeLabel: "9:00 a.m.",
  },
  SACAR_BASURA: {
    label: "Sacar Basura",
    timeLabel: "6:00 p.m.",
  },
};

/** Secreto compartido: Firebase (solo Functions, nunca cliente) usa este header. */
const requireIntegrationSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expected = process.env.INTEGRATION_FIREBASE_SECRET?.trim();
  if (!expected) {
    res.status(503).json({
      error: "INTEGRATION_FIREBASE_SECRET no está configurado en el servidor.",
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

  if (!provided || provided !== expected) {
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
  if (s === "COCINA_RECEPCION" || s === "COCINA") {
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

/**
 * Solo WHATS arma el texto y envía por Twilio. La otra aplicación sólo ordena teléfono + tipo (+ día opcional).
 *
 * POST /api/integration/firebase/whatsapp
 *
 * Headers: Authorization: Bearer <INTEGRATION_FIREBASE_SECRET> | x-api-key misma valor
 *
 * Body JSON obligatorio:
 *  - phone o to — debe existir en tabla Contact en esta aplicación (mismo formato que /api/contacts)
 *  - task o tipo o kind — ASEO_RECEPCION | COCINA_RECEPCION | SACAR_BASURA (aliases: ASEO, COCINA, BASURA, …)
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
            `No envíes nombres ni texto del mensaje. Campos no permitidos: ${forbiddenPresent.join(", ")}. Solo usa phone, task (o tipo/kind), y opcional date.`,
        });
      }

      const rawPhone = req.body.phone ?? req.body.to;
      const rawTask =
        req.body.task ?? req.body.tipo ?? req.body.kind;

      const rawDay =
        req.body.date ??
        req.body.dia ??
        req.body.referenceDate ??
        req.body.reference_date;

      if (!rawPhone || typeof rawPhone !== "string") {
        return res.status(400).json({
          error:
            'Falta "phone" (o "to") destino WhatsApp registrado aquí.',
        });
      }

      const taskKind = normalizeTaskKind(rawTask);
      if (!taskKind) {
        return res.status(400).json({
          error:
            'Falta "task" válido (o "tipo" / "kind"): ASEO_RECEPCION, COCINA_RECEPCION o SACAR_BASURA.',
        });
      }

      const to = normalizeWhatsAppPhoneNumber(rawPhone.trim());

      const contact = await prisma.contact.findUnique({
        where: { phone: to },
      });

      if (!contact) {
        return res.status(404).json({
          error:
            "Este teléfono no existe en nuestra tabla de contactos (/api/contacts). Registra el número antes.",
        });
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
        contactFound: contact.name,
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
