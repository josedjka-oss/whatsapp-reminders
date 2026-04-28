import twilio from "twilio";
import { prisma } from "../db";
import { getPublicBaseUrl, putTempMedia } from "./temp-media-store";
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "./cloudinary-upload";

/**
 * Template ID aprobado de WhatsApp Business
 */
const WHATSAPP_TEMPLATE_CONTENT_SID = "HX92eca9f1cc315265de2a85951684723a";

/**
 * Obtiene las credenciales de Twilio y valida que estén presentes
 */
const getTwilioCredentials = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim() || "whatsapp:+573043577875";
  const myWhatsAppNumber = process.env.MY_WHATSAPP_NUMBER?.trim();

  // Logging para debugging (sin exponer el token completo)
  console.log(`[TWILIO] Verificando credenciales...`);
  console.log(`[TWILIO] TWILIO_ACCOUNT_SID: ${accountSid ? `${accountSid.substring(0, 10)}...` : 'NO CONFIGURADO'}`);
  console.log(`[TWILIO] TWILIO_AUTH_TOKEN: ${authToken ? `${authToken.substring(0, 10)}...` : 'NO CONFIGURADO'}`);
  console.log(`[TWILIO] TWILIO_WHATSAPP_FROM: ${fromNumber || 'NO CONFIGURADO'}`);
  console.log(`[TWILIO] MY_WHATSAPP_NUMBER: ${myWhatsAppNumber || 'NO CONFIGURADO'}`);

  if (!accountSid || !authToken) {
    const missing = [];
    if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
    
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
  reminderText: string; // El texto que va en {{1}} del template
}

/**
 * Normaliza texto que irá en {{1}} sin recortar tamaño (útil antes de partir en chunks).
 */
const normalizeWhatsAppTemplateBody = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\n+/g, " · ")
    .replace(/\r/g, "")
    .replace(/ {5,}/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
};

/**
 * WhatsApp/Twilio (Content API): {{1}} no puede contener newline, tab ni más de 4 espacios
 * seguidos — error 21656. Opcionalmente recorta.
 * @see https://www.twilio.com/docs/errors/21656
 */
const sanitizeWhatsAppTemplateVariable = (text: string, maxLength = 1024): string => {
  const normalized = normalizeWhatsAppTemplateBody(text);
  if (!normalized.length) {
    return "";
  }
  if (normalized.length > maxLength) {
    return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
  }
  return normalized;
};

/**
 * Envía un mensaje de WhatsApp usando Twilio con template aprobado
 */
export const sendWhatsAppMessage = async ({
  to,
  reminderText,
}: SendMessageParams): Promise<string> => {
  try {
    // Obtener credenciales y cliente de Twilio
    const credentials = getTwilioCredentials();
    const client = getTwilioClient();

    console.log(`[TWILIO] 📤 Enviando mensaje usando WhatsApp Business API`);
    console.log(`[TWILIO] From: ${credentials.fromNumber}`);
    console.log(`[TWILIO] To: ${to}`);
    console.log(`[TWILIO] Template ContentSid: ${WHATSAPP_TEMPLATE_CONTENT_SID}`);
    console.log(`[TWILIO] ReminderText: ${reminderText.substring(0, 50)}${reminderText.length > 50 ? '...' : ''}`);

    // Validar formato del número
    if (!to.match(/^whatsapp:\+\d{10,15}$/)) {
      throw new Error(`Formato de número inválido: ${to}. Debe ser 'whatsapp:+57XXXXXXXXXX'`);
    }

    // Validar que el número destino no sea el mismo que el origen
    if (to === credentials.fromNumber) {
      throw new Error(`No se puede enviar un mensaje a sí mismo. El número destino (${to}) no puede ser igual al número origen (${credentials.fromNumber})`);
    }

    // Enviar usando template aprobado
    // Para WhatsApp templates, contentVariables debe ser un string JSON
    // con las claves como strings que corresponden a los números de las variables
    // Formato: {"1": "valor", "2": "valor2", ...}
    
    const cleanReminderText = sanitizeWhatsAppTemplateVariable(reminderText, 1024);
    if (!cleanReminderText.length) {
      throw new Error("El texto del template quedó vacío tras sanitizar (21656/evitar valores vacíos).");
    }
    
    const contentVariables = {
      "1": cleanReminderText
    };
    
    const contentVariablesJson = JSON.stringify(contentVariables);
    console.log(`[TWILIO] ContentVariables JSON: ${contentVariablesJson}`);
    
    // Validar que el JSON sea válido
    try {
      JSON.parse(contentVariablesJson);
    } catch (error) {
      throw new Error(`Error al crear JSON de contentVariables: ${error}`);
    }
    
    const message = await client.messages.create({
      from: credentials.fromNumber,
      to: to,
      contentSid: WHATSAPP_TEMPLATE_CONTENT_SID,
      contentVariables: contentVariablesJson
    });

    console.log(`[TWILIO] ✅ Mensaje creado en Twilio. SID: ${message.sid}`);
    console.log(`[TWILIO] Estado del mensaje: ${message.status}`);
    console.log(`[TWILIO] Número destino final: ${message.to}`);
    console.log(`[TWILIO] Número origen final: ${message.from}`);
    
    // Verificar si hay errores después de crear el mensaje
    if (message.errorCode) {
      console.error(`[TWILIO] ❌ Error en mensaje: ${message.errorCode} - ${message.errorMessage}`);
      throw new Error(`Error ${message.errorCode}: ${message.errorMessage || 'Error desconocido'}`);
    }
    
    // Verificar si hay errores en el mensaje
    if (message.errorCode || message.errorMessage) {
      console.error(`[TWILIO] ❌ Error en mensaje: ${message.errorCode} - ${message.errorMessage}`);
      throw new Error(`Twilio error: ${message.errorCode} - ${message.errorMessage}`);
    }

    // Guardar mensaje en base de datos
    await prisma.message.create({
      data: {
        direction: "outbound",
        from: credentials.fromNumber,
        to: to,
        body: reminderText, // Guardar el texto del recordatorio
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
    console.error(`[TWILIO] ❌ Error enviando mensaje de WhatsApp:`, error);
    console.error(`[TWILIO] Stack trace:`, error.stack);
    throw new Error(`Error enviando mensaje: ${error.message}`);
  }
};

/**
 * La variable {{1}} de la plantilla aprobada suele limitarse (~1024); si excede, se envían
 * varios mensajes con plantilla en secuencia (reenvío fiable a MY_WHATSAPP_NUMBER).
 * No se usa "mensaje de sesión" con media: esa ventana no aplica a un tercer número
 * (el reenvío no es "respuesta" en la misma conversación 24h del remitente original).
 */
const TEMPLATE_PARAM_SAFE_MAX = 900;

const sendTemplateToMyNumberInChunks = async (
  to: string,
  fullText: string
): Promise<void> => {
  const normalized = normalizeWhatsAppTemplateBody(fullText);
  if (!normalized.length) {
    throw new Error(
      "[TWILIO] Texto de reenvío vacío tras normalize (21656/evitar valores vacíos)."
    );
  }
  if (normalized.length <= TEMPLATE_PARAM_SAFE_MAX) {
    await sendWhatsAppMessage({ to, reminderText: normalized });
    return;
  }
  const totalChunks = Math.ceil(normalized.length / TEMPLATE_PARAM_SAFE_MAX);
  for (let c = 0; c < totalChunks; c++) {
    const chunk = normalized.slice(
      c * TEMPLATE_PARAM_SAFE_MAX,
      (c + 1) * TEMPLATE_PARAM_SAFE_MAX
    );
    // Sin newline en cabeceras: causa 21656; usar separador puntos medios como el resto
    const part =
      totalChunks > 1 ? `( parte ${c + 1}/${totalChunks} ) · ${chunk}` : chunk;
    await sendWhatsAppMessage({ to, reminderText: part });
  }
};

/**
 * Descarga una imagen desde una URL de Twilio usando autenticación
 * Con reintentos automáticos en caso de fallo
 */
const downloadTwilioMedia = async (
  mediaUrl: string,
  accountSid: string,
  authToken: string,
  maxRetries: number = 3
): Promise<{ buffer: Buffer; contentType: string }> => {
  // Crear credenciales Base64 para autenticación HTTP Basic
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[TWILIO] Intento ${attempt}/${maxRetries} descargando media desde Twilio...`);
      
      // Timeout de 30 segundos para la descarga
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(mediaUrl, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error descargando media: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      console.log(`[TWILIO] ✅ Media descargado exitosamente: ${arrayBuffer.byteLength} bytes, tipo: ${contentType}`);
      
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType,
      };
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;
      
      if (error.name === 'AbortError') {
        console.error(`[TWILIO] ⏱️ Timeout descargando media (intento ${attempt}/${maxRetries})`);
      } else {
        console.error(`[TWILIO] ❌ Error descargando media (intento ${attempt}/${maxRetries}):`, error.message);
      }
      
      if (!isLastAttempt) {
        // Backoff exponencial: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[TWILIO] ⏳ Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Error descargando media después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`);
};

/**
 * Extensión de archivo razonable para imgbb (multipart con nombre de archivo)
 */
const extFromContentType = (contentType: string): string => {
  const main = contentType.split(";")[0].trim().toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return map[main] || "jpg";
};

/**
 * Sube una imagen a imgbb y retorna la URL pública
 * Con reintentos automáticos en caso de fallo
 *
 * Nota: imgbb documenta que application/x-www-form-urlencoded puede alterar el base64;
 * se usa multipart/form-data con el binario (Blob) como recomiendan.
 */
const uploadToImgbb = async (
  imageBuffer: Buffer,
  contentType: string,
  maxRetries: number = 3
): Promise<string> => {
  const imgbbApiKey = process.env.IMGBB_API_KEY?.trim();
  
  if (!imgbbApiKey) {
    throw new Error("IMGBB_API_KEY no está configurado. Configúralo en Render Dashboard > Environment Variables");
  }

  const ext = extFromContentType(contentType);
  const filename = `twilio-inbound-${Date.now()}.${ext}`;

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[IMGBB] Intento ${attempt}/${maxRetries} subiendo imagen a imgbb (${imageBuffer.length} bytes, tipo: ${contentType})...`);
      
      const formData = new FormData();
      formData.append("key", imgbbApiKey);
      const typePart = contentType.split(";")[0].trim() || "image/jpeg";
      const blob = new Blob([imageBuffer], { type: typePart });
      formData.append("image", blob, filename);
      formData.append("name", filename);

      // Timeout de 30 segundos para la subida
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // No fijar Content-Type: fetch añade boundary correcto para multipart
      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const rawText = await response.text();
      let data: {
        success?: boolean;
        status?: number;
        error?: { code?: string | number; message?: string };
        data?: {
          url?: string;
          error?: { message?: string; code?: string | number };
        };
      };
      try {
        data = JSON.parse(rawText) as typeof data;
      } catch {
        throw new Error(
          `Error subiendo a imgbb: HTTP ${response.status} — cuerpo no es JSON: ${rawText.substring(0, 500)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          `Error HTTP imgbb: ${response.status} ${response.statusText} — ${rawText.substring(0, 800)}`
        );
      }

      if (data.error?.message) {
        throw new Error(`imgbb error: ${data.error.message} (code: ${data.error.code ?? "n/a"})`);
      }
      if (data.data?.error?.message) {
        throw new Error(`imgbb data.error: ${data.data.error.message} (code: ${data.data.error.code ?? "n/a"})`);
      }

      if (!data.success || !data.data?.url) {
        throw new Error(`Respuesta imgbb inválida: ${JSON.stringify(data).substring(0, 1000)}`);
      }

      const publicUrl = data.data.url;
      console.log(`[IMGBB] ✅ Imagen subida exitosamente: ${publicUrl}`);
      
      return publicUrl;
    } catch (error: any) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries;
      
      if (error.name === 'AbortError') {
        console.error(`[IMGBB] ⏱️ Timeout subiendo a imgbb (intento ${attempt}/${maxRetries})`);
      } else {
        console.error(`[IMGBB] ❌ Error subiendo a imgbb (intento ${attempt}/${maxRetries}):`, error.message);
      }
      
      if (!isLastAttempt) {
        // Backoff exponencial: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[IMGBB] ⏳ Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Error subiendo a imgbb después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`);
};

/**
 * Reenvía un mensaje recibido a tu WhatsApp personal (con imágenes si hay)
 */
export const forwardToMyWhatsApp = async (
  from: string,
  body: string,
  mediaUrls: string[] = []
): Promise<void> => {
  const credentials = getTwilioCredentials();
  const myWhatsAppNumber = credentials.myWhatsAppNumber;

  if (!myWhatsAppNumber) {
    console.warn("MY_WHATSAPP_NUMBER no configurado, no se reenviará el mensaje");
    return;
  }

  const forwardedBody = `📩 Respuesta de ${from}:\n\n${body || ""}`;

  try {
    // Si hay imágenes, descargarlas y reenviarlas
    if (mediaUrls.length > 0) {
      console.log(`[TWILIO] Reenviando mensaje con ${mediaUrls.length} imagen(es)`);
      
      // Descargar, publicar en URL propia (Render) o imgbb; imgbb a menudo devuelve 103 desde IPs de datacenter
      const processedUrls: string[] = [];

      for (let i = 0; i < Math.min(mediaUrls.length, 10); i++) {
        const mediaUrl = mediaUrls[i];
        try {
          console.log(`[TWILIO] Procesando imagen ${i + 1}/${mediaUrls.length}...`);
          console.log(`[TWILIO] URL original: ${mediaUrl}`);

          console.log(`[TWILIO] Descargando imagen ${i + 1}...`);
          const { buffer: imageBuffer, contentType } = await downloadTwilioMedia(
            mediaUrl,
            credentials.accountSid,
            credentials.authToken
          );

          console.log(
            `[TWILIO] Imagen descargada: ${imageBuffer.length} bytes, tipo: ${contentType}`
          );

          let publicUrl: string | null = null;

          if (isCloudinaryConfigured()) {
            try {
              publicUrl = await uploadBufferToCloudinary(imageBuffer, contentType);
              console.log(
                `[TWILIO] ✅ Imagen en Cloudinary: ${publicUrl.substring(0, 80)}...`
              );
            } catch (cloudErr: unknown) {
              console.warn(
                `[TWILIO] Cloudinary falló, se usará temporal local o imgbb:`,
                String((cloudErr as Error)?.message ?? cloudErr)
              );
            }
          } else {
            console.warn(
              `[TWILIO] Cloudinary no configurado; usando URL temporal (/webhooks/temp-media) o imgbb.`
            );
          }

          if (!publicUrl) {
            const base = getPublicBaseUrl();
            if (base) {
              const tempId = putTempMedia(imageBuffer, contentType);
              if (tempId) {
                publicUrl = `${base}/webhooks/temp-media/${tempId}`;
                console.log(
                  `[TWILIO] Imagen publicada en URL temporal (app): ${publicUrl.substring(0, 80)}...`
                );
              } else {
                console.warn(
                  `[TWILIO] putTempMedia devolvió null (sin base pública o imagen demasiado grande).`
                );
              }
            } else {
              console.warn(
                `[TWILIO] Sin URL pública: define PUBLIC_BASE_URL o usa Render (RENDER_EXTERNAL_URL). Se intenta imgbb.`
              );
            }
          }

          if (!publicUrl) {
            console.log(`[TWILIO] Subiendo imagen ${i + 1} a imgbb (respaldo)...`);
            publicUrl = await uploadToImgbb(imageBuffer, contentType);
          }

          if (publicUrl) {
            processedUrls.push(publicUrl);
            console.log(
              `[TWILIO] ✅ Imagen ${i + 1} lista para reenviar`
            );
          }
        } catch (error: any) {
          const msg = String(error?.message ?? error);
          console.error(`[TWILIO] ❌ Error procesando imagen ${i + 1}:`, msg);
          if (msg.includes("103") || msg.toLowerCase().includes("forbidden")) {
            console.error(
              `[TWILIO] imgbb 103: suele bloquear servidores en la nube. Asegúrate de tener RENDER_EXTERNAL_URL o PUBLIC_BASE_URL para usar /webhooks/temp-media.`
            );
          }
        }
      }

      if (processedUrls.length === 0) {
        // Si no se pudieron procesar las imágenes, enviar solo texto usando template
        console.warn(`[TWILIO] No se pudieron procesar las imágenes, enviando solo texto`);
        await sendTemplateToMyNumberInChunks(
          myWhatsAppNumber,
          forwardedBody + "\n\n[Nota: Las imágenes no pudieron ser reenviadas]"
        );
        return;
      }

      // Solo plantilla: el reenvío a tu otro número no entra en "ventana 24h" con media libre
      // respecto a quien te escribió al número de negocio; además el texto + URLs a menudo
      // excede el límite de {{1}} → partimos en varios mensajes de plantilla.
      const imageUrlsText = processedUrls
        .map((url, idx) => `Imagen ${idx + 1}:\n${url}\n`)
        .join("\n");
      const templateBody = `${forwardedBody}\n\n📷 Enlaces a la evidencia (ábrelos en el navegador; en Render gratis el enlace puede caducar si el servicio se durmió):\n\n${imageUrlsText}`;

      await sendTemplateToMyNumberInChunks(myWhatsAppNumber, templateBody);
      console.log(
        `[TWILIO] ✅ Reenvío enviado por plantilla (${processedUrls.length} enlace(s) de imagen)`
      );
    } else {
      // Solo texto, usar plantilla; trocear si hace falta
      await sendTemplateToMyNumberInChunks(myWhatsAppNumber, forwardedBody);
      console.log(`[TWILIO] Mensaje reenviado a ${myWhatsAppNumber}`);
    }
  } catch (error: any) {
    console.error("Error reenviando mensaje:", error);
    throw error;
  }
};
