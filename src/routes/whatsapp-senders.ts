import { Router, Request, Response } from "express";
import twilio from "twilio";

const router = Router();

/**
 * Verifica el estado de los números de WhatsApp Business en Twilio
 * GET /api/whatsapp-senders
 */
router.get("/", async (req: Request, res: Response) => {
  try {
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

    // Obtener el número configurado en las variables de entorno
    const configuredFrom = process.env.TWILIO_WHATSAPP_FROM?.trim() || "whatsapp:+573043577875";
    const phoneNumber = configuredFrom.replace("whatsapp:", "");

    console.log(`[WHATSAPP-SENDERS] Verificando número: ${phoneNumber}`);

    try {
      // Intentar obtener información del número usando la API de IncomingPhoneNumbers
      // Nota: Para WhatsApp Business, necesitamos usar la API de Messaging Services
      // o verificar a través de los mensajes enviados

      // Obtener los últimos mensajes para ver qué números se están usando
      const recentMessages = await client.messages.list({
        limit: 50,
      });

      // Extraer números únicos de "from"
      const uniqueFromNumbers = new Set<string>();
      recentMessages.forEach((msg) => {
        if (msg.from?.startsWith("whatsapp:")) {
          uniqueFromNumbers.add(msg.from);
        }
      });

      // Verificar cada número único
      const sendersInfo: any[] = [];

      for (const fromNumber of uniqueFromNumbers) {
        const numberWithoutPrefix = fromNumber.replace("whatsapp:", "");
        
        // Obtener mensajes recientes de este número
        const messagesFromThisNumber = await client.messages.list({
          from: fromNumber,
          limit: 5,
        });

        // Determinar estado basado en los mensajes
        let status = "unknown";
        let lastError: any = null;
        let lastStatus: string | null = null;

        if (messagesFromThisNumber.length > 0) {
          const lastMessage = messagesFromThisNumber[0];
          lastStatus = lastMessage.status || null;
          
          if (lastMessage.errorCode) {
            lastError = {
              code: lastMessage.errorCode,
              message: lastMessage.errorMessage || null,
            };
            
            // Determinar estado basado en el error
            if (lastMessage.errorCode === 63051) {
              status = "locked";
            } else if (lastMessage.errorCode === 21608) {
              status = "not_verified";
            } else if (lastMessage.errorCode === 21614) {
              status = "no_whatsapp";
            } else {
              status = "error";
            }
          } else if (lastMessage.status === "delivered") {
            status = "verified";
          } else if (lastMessage.status === "sent") {
            status = "active";
          } else if (lastMessage.status === "queued") {
            status = "pending";
          } else if (lastMessage.status === "failed" || lastMessage.status === "undelivered") {
            status = "error";
          }
        }

        sendersInfo.push({
          number: fromNumber,
          phoneNumber: numberWithoutPrefix,
          status: status,
          lastMessageStatus: lastStatus,
          lastError: lastError,
          isConfigured: fromNumber === configuredFrom,
          messageCount: messagesFromThisNumber.length,
        });
      }

      // Si no hay mensajes, verificar el número configurado
      if (sendersInfo.length === 0) {
        sendersInfo.push({
          number: configuredFrom,
          phoneNumber: phoneNumber,
          status: "unknown",
          lastMessageStatus: null,
          lastError: null,
          isConfigured: true,
          messageCount: 0,
          note: "No hay mensajes recientes para determinar el estado",
        });
      }

      return res.json({
        configuredFrom: configuredFrom,
        senders: sendersInfo,
        total: sendersInfo.length,
      });
    } catch (error: any) {
      console.error("[WHATSAPP-SENDERS] Error verificando números:", error);
      
      // Si hay error, al menos devolver el número configurado
      return res.json({
        configuredFrom: configuredFrom,
        senders: [
          {
            number: configuredFrom,
            phoneNumber: phoneNumber,
            status: "unknown",
            lastMessageStatus: null,
            lastError: {
              code: null,
              message: error.message || "Error verificando estado",
            },
            isConfigured: true,
            messageCount: 0,
            note: "Error al verificar: " + error.message,
          },
        ],
        total: 1,
        error: error.message,
      });
    }
  } catch (error: any) {
    console.error("[WHATSAPP-SENDERS] Error:", error);
    return res.status(500).json({
      error: error.message || "Error verificando números de WhatsApp",
    });
  }
});

/**
 * Verifica el estado de un número específico
 * GET /api/whatsapp-senders/:phoneNumber
 */
router.get("/:phoneNumber", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        error: "phoneNumber es requerido",
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

    // Formatear número
    const formattedNumber = phoneNumber.startsWith("whatsapp:")
      ? phoneNumber
      : `whatsapp:+${phoneNumber.replace(/^\+/, "")}`;

    console.log(`[WHATSAPP-SENDERS] Verificando número específico: ${formattedNumber}`);

    // Obtener mensajes recientes de este número
    const messages = await client.messages.list({
      from: formattedNumber,
      limit: 10,
    });

    // Analizar estado
    let status = "unknown";
    let lastError: any = null;
    let lastStatus: string | null = null;
    let successCount = 0;
    let errorCount = 0;

    messages.forEach((msg) => {
      if (msg.status === "delivered" || msg.status === "sent") {
        successCount++;
      } else if (msg.status === "failed" || msg.status === "undelivered") {
        errorCount++;
      }

      if (!lastStatus && msg.status) {
        lastStatus = msg.status;
      }

      if (msg.errorCode && !lastError) {
        lastError = {
          code: msg.errorCode,
          message: msg.errorMessage || null,
        };

        if (msg.errorCode === 63051) {
          status = "locked";
        } else if (msg.errorCode === 21608) {
          status = "not_verified";
        } else if (msg.errorCode === 21614) {
          status = "no_whatsapp";
        } else {
          status = "error";
        }
      }
    });

    if (status === "unknown") {
      if (successCount > 0) {
        status = "verified";
      } else if (errorCount > 0) {
        status = "error";
      } else if (messages.length === 0) {
        status = "no_messages";
      }
    }

    return res.json({
      number: formattedNumber,
      phoneNumber: formattedNumber.replace("whatsapp:", ""),
      status: status,
      lastMessageStatus: lastStatus,
      lastError: lastError,
      statistics: {
        totalMessages: messages.length,
        successCount: successCount,
        errorCount: errorCount,
      },
      recentMessages: messages.slice(0, 5).map((msg) => ({
        sid: msg.sid,
        status: msg.status,
        errorCode: msg.errorCode || null,
        errorMessage: msg.errorMessage || null,
        to: msg.to,
        dateCreated: msg.dateCreated,
      })),
    });
  } catch (error: any) {
    console.error("[WHATSAPP-SENDERS] Error:", error);
    return res.status(500).json({
      error: error.message || "Error verificando número de WhatsApp",
    });
  }
});

export default router;
