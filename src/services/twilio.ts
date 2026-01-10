import twilio from "twilio";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
const myWhatsAppNumber = process.env.MY_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error("Twilio credentials are required in environment variables");
}

const client = twilio(accountSid, authToken);

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
    const message = await client.messages.create({
      from: fromNumber!,
      to: to,
      body: body,
    });

    // Guardar mensaje en base de datos
    await prisma.message.create({
      data: {
        direction: "outbound",
        from: fromNumber!,
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
