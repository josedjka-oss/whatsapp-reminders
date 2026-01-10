import twilio from "twilio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Obtiene las credenciales de Twilio y valida que estén presentes
 */
const getTwilioCredentials = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  const myWhatsAppNumber = process.env.MY_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "Se requieren credenciales de Twilio en las variables de entorno. " +
      "Asegúrate de configurar: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM"
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

    const message = await client.messages.create({
      from: credentials.fromNumber,
      to: to,
      body: body,
    });

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

    console.log(`Mensaje enviado exitosamente. SID: ${message.sid}`);
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
