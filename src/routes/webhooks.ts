import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validateTwilioSignature } from "../utils/validation";
import { forwardToMyWhatsApp } from "../services/twilio";

const router = Router();
const prisma = new PrismaClient();

/**
 * Webhook de Twilio para recibir mensajes entrantes
 * POST /webhooks/twilio/whatsapp
 */
router.post("/twilio/whatsapp", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`[WEBHOOK] ${timestamp} - Webhook recibido de Twilio`);

  try {
    // Construir URL completa para validación
    // Render automáticamente expone RENDER_EXTERNAL_URL (ej: https://whatsapp-reminders.onrender.com)
    const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_BASE_URL || "http://localhost:3000";
    const webhookPath = process.env.TWILIO_WEBHOOK_PATH || "/webhooks/twilio/whatsapp";
    const fullUrl = `${baseUrl}${webhookPath}`;

    // Validar firma de Twilio en producción
    const signature = req.headers["x-twilio-signature"] as string;
    const isProduction = process.env.NODE_ENV === "production";

    if (signature) {
      const isValid = validateTwilioSignature(req, fullUrl);
      if (!isValid) {
        console.warn(`[WEBHOOK] ⚠️  Firma de Twilio inválida`);
        if (isProduction) {
          console.error(`[WEBHOOK] ❌ En producción, rechazando webhook con firma inválida`);
          return res.status(403).type("text/xml").send("<Response></Response>");
        } else {
          console.warn(`[WEBHOOK] ⚠️  En desarrollo, continuando sin validar firma...`);
        }
      } else {
        console.log(`[WEBHOOK] ✅ Firma de Twilio válida`);
      }
    } else {
      console.warn(`[WEBHOOK] ⚠️  X-Twilio-Signature header no encontrado`);
      if (isProduction) {
        console.error(`[WEBHOOK] ❌ En producción, rechazando webhook sin firma`);
        return res.status(403).type("text/xml").send("<Response></Response>");
      }
    }

    // Extraer datos del mensaje (Twilio puede enviar con diferentes nombres de campo)
    const from = req.body.From || req.body.from || req.body.FromNumber;
    const to = req.body.To || req.body.to || req.body.ToNumber;
    const body = req.body.Body || req.body.body || req.body.MessageBody || "";
    const messageSid = req.body.MessageSid || req.body.messageSid || req.body.SmsMessageSid;

    if (!from || !to) {
      console.error(`[WEBHOOK] ❌ Datos incompletos: from=${from}, to=${to}`);
      // Responder 200 para que Twilio no intente reenviar
      return res.status(200).type("text/xml").send("<Response></Response>");
    }

    const bodyPreview = body.length > 50 ? body.substring(0, 50) + "..." : body;
    console.log(`[WEBHOOK] 📩 Mensaje recibido de ${from} → ${to}: "${bodyPreview}"`);

    // Guardar mensaje en base de datos
    try {
      const savedMessage = await prisma.message.create({
        data: {
          direction: "inbound",
          from: from,
          to: to,
          body: body || "(sin mensaje)",
          twilioSid: messageSid || null,
        },
      });
      console.log(`[WEBHOOK] ✅ Mensaje guardado en DB (ID: ${savedMessage.id})`);
    } catch (dbError: any) {
      console.error(`[WEBHOOK] ❌ Error guardando en base de datos:`, dbError.message);
      // Continuar aunque falle la DB para no bloquear el webhook
    }

    // Reenviar a tu WhatsApp personal
    if (body && body.trim() !== "") {
      try {
        await forwardToMyWhatsApp(from, body);
        console.log(`[WEBHOOK] ✅ Mensaje reenviado a WhatsApp personal`);
      } catch (error: any) {
        console.error(`[WEBHOOK] ❌ Error reenviando mensaje:`, error.message);
        // No fallar el webhook si el reenvío falla
      }
    } else {
      console.log(`[WEBHOOK] ⏭️  Mensaje vacío, omitiendo reenvío`);
    }

    const duration = Date.now() - startTime;
    console.log(`[WEBHOOK] ✅ Webhook procesado exitosamente en ${duration}ms`);

    // Responder a Twilio (TwiML)
    return res.status(200).type("text/xml").send("<Response></Response>");
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[WEBHOOK] ❌ Error crítico procesando webhook:`, error.message);
    console.error(`[WEBHOOK] Stack trace:`, error.stack);
    console.error(`[WEBHOOK] Duración antes del error: ${duration}ms`);
    // Responder 200 para que Twilio no intente reenviar
    return res.status(200).type("text/xml").send("<Response></Response>");
  }
});

export default router;
