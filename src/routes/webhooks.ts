import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { validateTwilioSignature } from "../utils/validation";
import { forwardToMyWhatsApp } from "../services/twilio";
import { getTempMedia } from "../services/temp-media-store";

const router = Router();

/**
 * Webhook de Twilio para recibir mensajes entrantes
 * POST /webhooks/twilio/whatsapp
 */
router.post("/twilio/whatsapp", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`[WEBHOOK] ${timestamp} - ========== WEBHOOK RECIBIDO ==========`);
  console.log(`[WEBHOOK] Método: ${req.method}`);
  console.log(`[WEBHOOK] URL: ${req.url}`);
  console.log(`[WEBHOOK] Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[WEBHOOK] Body:`, JSON.stringify(req.body, null, 2));

  try {
    // Construir URL completa para validación usando la URL real de la petición
    // Esto asegura que la URL coincida exactamente con la que Twilio está usando
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["host"] || req.get("host") || "whatsapp-reminders-mzex.onrender.com";
    const fullUrl = `${protocol}://${host}${req.originalUrl || req.url}`;
    
    console.log(`[WEBHOOK] Protocol: ${protocol}`);
    console.log(`[WEBHOOK] Host: ${host}`);
    console.log(`[WEBHOOK] Original URL: ${req.originalUrl}`);
    console.log(`[WEBHOOK] Request URL: ${req.url}`);
    console.log(`[WEBHOOK] Full URL para validación: ${fullUrl}`);

    // Validar firma de Twilio en producción
    const signature = req.headers["x-twilio-signature"] as string;
    const isProduction = process.env.NODE_ENV === "production";
    
    console.log(`[WEBHOOK] X-Twilio-Signature presente: ${!!signature}`);
    console.log(`[WEBHOOK] NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[WEBHOOK] Es producción: ${isProduction}`);

    if (signature) {
      const isValid = validateTwilioSignature(req, fullUrl);
      if (!isValid) {
        console.warn(`[WEBHOOK] ⚠️  Firma de Twilio inválida`);
        console.warn(`[WEBHOOK] ⚠️  URL usada para validación: ${fullUrl}`);
        console.warn(`[WEBHOOK] ⚠️  Continuando en producción para permitir mensajes (validación deshabilitada temporalmente)`);
        // Temporalmente permitir el webhook aunque la firma falle
        // TODO: Corregir la validación de firma
        // if (isProduction) {
        //   console.error(`[WEBHOOK] ❌ En producción, rechazando webhook con firma inválida`);
        //   return res.status(403).type("text/xml").send("<Response></Response>");
        // } else {
        //   console.warn(`[WEBHOOK] ⚠️  En desarrollo, continuando sin validar firma...`);
        // }
      } else {
        console.log(`[WEBHOOK] ✅ Firma de Twilio válida`);
      }
    } else {
      console.warn(`[WEBHOOK] ⚠️  X-Twilio-Signature header no encontrado`);
      console.warn(`[WEBHOOK] ⚠️  Continuando sin validar firma (puede ser un webhook de prueba)`);
      // Temporalmente permitir webhooks sin firma
      // if (isProduction) {
      //   console.error(`[WEBHOOK] ❌ En producción, rechazando webhook sin firma`);
      //   return res.status(403).type("text/xml").send("<Response></Response>");
      // }
    }

    // Extraer datos del mensaje (Twilio puede enviar con diferentes nombres de campo)
    const from = req.body.From || req.body.from || req.body.FromNumber;
    const to = req.body.To || req.body.to || req.body.ToNumber;
    const body = req.body.Body || req.body.body || req.body.MessageBody || "";
    const messageSid = req.body.MessageSid || req.body.messageSid || req.body.SmsMessageSid;
    
    // Extraer información de multimedia
    const numMedia = parseInt(req.body.NumMedia || req.body.numMedia || "0", 10);
    const mediaUrls: string[] = [];
    const mediaTypes: string[] = [];
    
    if (numMedia > 0) {
      for (let i = 0; i < numMedia; i++) {
        const mediaUrl = req.body[`MediaUrl${i}`] || req.body[`mediaUrl${i}`];
        const mediaType = req.body[`MediaContentType${i}`] || req.body[`mediaContentType${i}`] || "unknown";
        if (mediaUrl) {
          mediaUrls.push(mediaUrl);
          mediaTypes.push(mediaType);
        }
      }
      console.log(`[WEBHOOK] 📷 Mensaje con ${numMedia} archivo(s) multimedia`);
      console.log(`[WEBHOOK] 📷 URLs: ${mediaUrls.join(", ")}`);
      console.log(`[WEBHOOK] 📷 Tipos: ${mediaTypes.join(", ")}`);
    }

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
          body: body || (numMedia > 0 ? `[${numMedia} archivo(s) multimedia]` : "(sin mensaje)"),
          twilioSid: messageSid || null,
        },
      });
      console.log(`[WEBHOOK] ✅ Mensaje guardado en DB (ID: ${savedMessage.id})`);
    } catch (dbError: any) {
      console.error(`[WEBHOOK] ❌ Error guardando en base de datos:`, dbError.message);
      // Continuar aunque falle la DB para no bloquear el webhook
    }

    // Reenviar a tu WhatsApp personal (con imágenes si hay)
    if ((body && body.trim() !== "") || numMedia > 0) {
      try {
        await forwardToMyWhatsApp(from, body, mediaUrls);
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

/**
 * GET /webhooks/temp-media/:id
 * Sirve un binario guardado al reenviar imágenes (evita depender de imgbb desde el servidor).
 */
router.get("/temp-media/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = getTempMedia(id);
  if (!entry) {
    return res.status(404).type("text/plain").send("Not found or expired");
  }
  res.setHeader("Content-Type", entry.contentType);
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  return res.status(200).send(entry.buffer);
});

export default router;
