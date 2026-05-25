/**
 * Normaliza a formato whatsapp:+57... (compat. con Contact y Twilio)
 */
export const normalizeWhatsAppPhoneNumber = (phone: string): string => {
  let normalized = phone.trim();

  if (normalized.startsWith("whatsapp:")) {
    normalized = normalized.replace("whatsapp:", "");
  }

  if (!normalized.startsWith("+")) {
    normalized = `+57${normalized}`;
  }

  if (!normalized.startsWith("whatsapp:")) {
    normalized = `whatsapp:${normalized}`;
  }

  return normalized;
};
