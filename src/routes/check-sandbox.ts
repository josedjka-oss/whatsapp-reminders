import { Router, Request, Response } from "express";
import twilio from "twilio";

const router = Router();

/**
 * Verifica si Twilio está en modo Sandbox
 * GET /api/check-sandbox
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // Obtener credenciales de Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim();

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(500).json({
        error: "Credenciales de Twilio no configuradas",
      });
    }

    // Crear cliente de Twilio
    const client = twilio(accountSid, authToken);

    // Verificar si el número de origen es el de Sandbox
    const isSandboxNumber = fromNumber.includes("14155238886") || 
                           fromNumber.includes("+14155238886");

    // Intentar obtener información de la cuenta
    let accountInfo: any = {};
    try {
      const account = await client.api.accounts(accountSid).fetch();
      accountInfo = {
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      };
    } catch (error: any) {
      console.error("[CHECK-SANDBOX] Error obteniendo info de cuenta:", error);
    }

    // Verificar últimos mensajes para detectar errores de Sandbox
    let recentMessages: any[] = [];
    let sandboxErrors = 0;
    try {
      const messages = await client.messages.list({ limit: 10 });
      recentMessages = messages.map((msg) => ({
        sid: msg.sid,
        status: msg.status,
        errorCode: msg.errorCode || null,
        errorMessage: msg.errorMessage || null,
        to: msg.to,
        dateCreated: msg.dateCreated,
      }));

      // Contar errores de Sandbox (21608 = Unverified number)
      sandboxErrors = messages.filter(
        (msg) => msg.errorCode === "21608" || msg.errorCode === 21608
      ).length;
    } catch (error: any) {
      console.error("[CHECK-SANDBOX] Error obteniendo mensajes:", error);
    }

    // Determinar si está en Sandbox
    const likelySandbox = isSandboxNumber || sandboxErrors > 0;

    return res.json({
      isSandbox: likelySandbox,
      fromNumber: fromNumber,
      isSandboxNumber: isSandboxNumber,
      accountInfo: accountInfo,
      recentErrors: {
        sandboxErrors: sandboxErrors,
        totalMessages: recentMessages.length,
      },
      messages: recentMessages.slice(0, 5), // Solo los primeros 5
      recommendations: likelySandbox
        ? [
            "Estás probablemente en modo Sandbox",
            "Para enviar a números nuevos, necesitas verificar cada número",
            "O migrar a Production en Twilio Console",
            "Verifica números enviando 'join [código]' a +1 415 523 8886",
          ]
        : [
            "No parece estar en Sandbox",
            "Si aún tienes problemas, verifica los logs de errores",
          ],
    });
  } catch (error: any) {
    console.error("[CHECK-SANDBOX] Error:", error);
    return res.status(500).json({
      error: error.message || "Error verificando estado de Sandbox",
    });
  }
});

export default router;
