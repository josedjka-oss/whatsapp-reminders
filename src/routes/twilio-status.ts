import { Router, Request, Response } from "express";
import twilio from "twilio";

const router = Router();

/**
 * Verifica el estado de un mensaje en Twilio usando su SID
 * GET /api/twilio-status/:messageSid
 */
router.get("/:messageSid", async (req: Request, res: Response) => {
  try {
    const { messageSid } = req.params;

    if (!messageSid) {
      return res.status(400).json({
        error: "messageSid es requerido",
      });
    }

    // Obtener credenciales de Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

    if (!accountSid || !authToken) {
      return res.status(500).json({
        error: "Credenciales de Twilio no configuradas",
      });
    }

    // Crear cliente de Twilio
    const client = twilio(accountSid, authToken);

    // Obtener información del mensaje
    const message = await client.messages(messageSid).fetch();

    return res.json({
      sid: message.sid,
      status: message.status,
      errorCode: message.errorCode || null,
      errorMessage: message.errorMessage || null,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      direction: message.direction,
      price: message.price,
      priceUnit: message.priceUnit,
      uri: message.uri,
    });
  } catch (error: any) {
    console.error("[TWILIO-STATUS] Error:", error);
    return res.status(500).json({
      error: error.message || "Error obteniendo estado del mensaje",
    });
  }
});

/**
 * Lista los últimos mensajes enviados
 * GET /api/twilio-status
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Obtener credenciales de Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

    if (!accountSid || !authToken) {
      return res.status(500).json({
        error: "Credenciales de Twilio no configuradas",
      });
    }

    // Crear cliente de Twilio
    const client = twilio(accountSid, authToken);

    // Obtener mensajes recientes
    const messages = await client.messages.list({
      limit: limit,
      to: undefined, // Todos los mensajes
    });

    return res.json({
      count: messages.length,
      messages: messages.map((msg) => ({
        sid: msg.sid,
        status: msg.status,
        errorCode: msg.errorCode || null,
        errorMessage: msg.errorMessage || null,
        to: msg.to,
        from: msg.from,
        body: msg.body?.substring(0, 100) || "",
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent,
      })),
    });
  } catch (error: any) {
    console.error("[TWILIO-STATUS] Error:", error);
    return res.status(500).json({
      error: error.message || "Error listando mensajes",
    });
  }
});

export default router;
