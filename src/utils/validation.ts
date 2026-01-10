import { Request } from "express";
import twilio from "twilio";

/**
 * Valida la firma de Twilio en el webhook
 */
export const validateTwilioSignature = (
  req: Request,
  url: string
): boolean => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.error("TWILIO_AUTH_TOKEN no está configurado");
    return false;
  }

  const signature = req.headers["x-twilio-signature"] as string;
  if (!signature) {
    console.error("X-Twilio-Signature header no encontrado");
    return false;
  }

  // Twilio envía los datos como form-urlencoded
  const params = req.body;

  try {
    return twilio.validateRequest(authToken, signature, url, params);
  } catch (error: any) {
    console.error("Error validando firma de Twilio:", error);
    return false;
  }
};
