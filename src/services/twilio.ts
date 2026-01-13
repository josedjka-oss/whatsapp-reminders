import twilio from "twilio";
import { prisma } from "../db";

/**
 * Obtiene las credenciales de Twilio y valida que estén presentes
 */
const getTwilioCredentials = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim();
  const myWhatsAppNumber = process.env.MY_WHATSAPP_NUMBER?.trim();

  // Logging para debugging (sin exponer el token completo)
  console.log(`[TWILIO] Verificando credenciales...`);
  console.log(`[TWILIO] TWILIO_ACCOUNT_SID: ${accountSid ? `${accountSid.substring(0, 10)}...` : 'NO CONFIGURADO'}`);
  console.log(`[TWILIO] TWILIO_AUTH_TOKEN: ${authToken ? `${authToken.substring(0, 10)}...` : 'NO CONFIGURADO'}`);
  console.log(`[TWILIO] TWILIO_WHATSAPP_FROM: ${fromNumber || 'NO CONFIGURADO'}`);
  console.log(`[TWILIO] MY_WHATSAPP_NUMBER: ${myWhatsAppNumber || 'NO CONFIGURADO'}`);

  if (!accountSid || !authToken || !fromNumber) {
    const missing = [];
    if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
    if (!fromNumber) missing.push('TWILIO_WHATSAPP_FROM');
    
    throw new Error(
      `Se requieren credenciales de Twilio en las variables de entorno. ` +
      `Faltantes: ${missing.join(', ')}. ` +
      `Asegúrate de configurarlas en Render Dashboard > Environment Variables.`
    );
  }

  return {
    accountSid,
    authToken,
    fromNumber,
    myWhatsAppNumber: myWhatsAppNumber || null,
  };
};

/**
 * Crea el cliente de Twilio (lazy initialization)
 */
const getTwilioClient = () => {
  const { accountSid, authToken } = getTwilioCredentials();
  return twilio(accountSid, authToken);
};

interface SendMessageParams {
  to: string;
  body: string;
}

/**
 * Envía un mensaje de WhatsApp usando Twilio
 */
export const sendWhatsAppMessage = async ({
  to,
  body,
}: SendMessageParams): Promise<string> => {
  try {
    // Obtener credenciales y cliente de Twilio
    const credentials = getTwilioCredentials();
    const client = getTwilioClient();

    console.log(`[TWILIO] Enviando mensaje de ${credentials.fromNumber} a ${to}`);
    console.log(`[TWILIO] Mensaje: ${body.substring(0, 50)}${body.length > 50 ? '...' : ''}`);

    console.log(`[TWILIO] Formato del número destino: ${to}`);
    console.log(`[TWILIO] Número origen: ${credentials.fromNumber}`);
    
    const message = await client.messages.create({
      from: credentials.fromNumber,
      to: to,
      body: body,
    });

    console.log(`[TWILIO] ✅ Mensaje creado en Twilio. SID: ${message.sid}`);
    console.log(`[TWILIO] Estado del mensaje: ${message.status}`);
    console.log(`[TWILIO] Número destino final: ${message.to}`);
    console.log(`[TWILIO] Número origen final: ${message.from}`);
    
    // Verificar si hay errores en el mensaje
    if (message.errorCode || message.errorMessage) {
      console.error(`[TWILIO] ⚠️  Error en mensaje: ${message.errorCode} - ${message.errorMessage}`);
    }

    // Guardar mensaje en base de datos
    await prisma.message.create({
      data: {
        direction: "outbound",
        from: credentials.fromNumber,
        to: to,
        body: body,
        twilioSid: message.sid,
      },
    });

    console.log(`[TWILIO] ✅ Mensaje guardado en base de datos. SID: ${message.sid}`);
    
    // Si el estado no es "queued" o "sent", loggear advertencia
    if (message.status !== "queued" && message.status !== "sent" && message.status !== "delivered") {
      console.warn(`[TWILIO] ⚠️  Estado inusual del mensaje: ${message.status}`);
    }
    
    return message.sid;
  } catch (error: any) {
    console.error("Error enviando mensaje de WhatsApp:", error);
    throw new Error(`Error enviando mensaje: ${error.message}`);
  }
};

/**
 * Reenvía un mensaje recibido a tu WhatsApp personal
 */
export const forwardToMyWhatsApp = async (
  from: string,
  body: string
): Promise<void> => {
  const credentials = getTwilioCredentials();
  const myWhatsAppNumber = credentials.myWhatsAppNumber;

  if (!myWhatsAppNumber) {
    console.warn("MY_WHATSAPP_NUMBER no configurado, no se reenviará el mensaje");
    return;
  }

  const forwardedBody = `📩 Respuesta de ${from}:\n\n${body}`;

  try {
    await sendWhatsAppMessage({
      to: myWhatsAppNumber,
      body: forwardedBody,
    });
    console.log(`Mensaje reenviado a ${myWhatsAppNumber}`);
  } catch (error: any) {
    console.error("Error reenviando mensaje:", error);
    throw error;
  }
};
