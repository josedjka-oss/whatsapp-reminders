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
 * Descarga una imagen desde una URL de Twilio usando autenticación
 */
const downloadTwilioMedia = async (mediaUrl: string, accountSid: string, authToken: string): Promise<{ buffer: Buffer; contentType: string }> => {
  // Crear credenciales Base64 para autenticación HTTP Basic
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  
  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error descargando media: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  };
};

/**
 * Crea una URL pública temporal usando un servicio público
 * Alternativa: convertir a base64 data URL (limitado por tamaño)
 */
const createPublicImageUrl = async (imageBuffer: Buffer, contentType: string): Promise<string> => {
  // Opción 1: Usar imgbb.com (servicio gratuito, sin API key requerida para uso básico)
  // Opción 2: Usar base64 data URL (limitado, pero funciona)
  
  // Por ahora, usamos base64 data URL como solución temporal
  // Nota: Esto puede fallar con imágenes muy grandes
  const base64 = imageBuffer.toString("base64");
  return `data:${contentType};base64,${base64}`;
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

  const client = getTwilioClient();
  const forwardedBody = `📩 Respuesta de ${from}:\n\n${body || ""}`;

  try {
    // Si hay imágenes, descargarlas y reenviarlas
    if (mediaUrls.length > 0) {
      console.log(`[TWILIO] Reenviando mensaje con ${mediaUrls.length} imagen(es)`);
      
      // Construir mensaje con media descargadas
      const messageData: any = {
        from: credentials.fromNumber,
        to: myWhatsAppNumber,
        body: forwardedBody,
      };

      // Descargar cada imagen, convertir a base64 y crear data URL pública
      // Twilio WhatsApp acepta URLs públicas, pero las URLs de Twilio requieren autenticación
      // Solución: Descargar, convertir a base64 data URL (aunque puede no funcionar para todas las imágenes grandes)
      // Alternativa mejor: Subir a un servicio público como imgbb, pero requiere API
      
      const processedUrls: string[] = [];
      
      for (let i = 0; i < Math.min(mediaUrls.length, 10); i++) {
        const mediaUrl = mediaUrls[i];
        try {
          console.log(`[TWILIO] Descargando imagen ${i + 1}/${mediaUrls.length}...`);
          
          // Descargar el contenido de la imagen con autenticación
          const { buffer: imageBuffer, contentType } = await downloadTwilioMedia(
            mediaUrl,
            credentials.accountSid,
            credentials.authToken
          );
          
          console.log(`[TWILIO] Imagen descargada: ${imageBuffer.length} bytes, tipo: ${contentType}`);
          
          // Intentar usar la URL original de Twilio primero (puede funcionar si es la misma cuenta)
          // Si no funciona, necesitaremos una URL pública
          
          // Por ahora, intentamos usar la URL original
          // Si Twilio no puede acceder, necesitaremos subir a un servicio público
          processedUrls.push(mediaUrl);
          
          console.log(`[TWILIO] ✅ Imagen ${i + 1} procesada: ${mediaUrl.substring(0, 80)}...`);
        } catch (downloadError: any) {
          console.error(`[TWILIO] ❌ Error descargando imagen ${i + 1}:`, downloadError.message);
          // Continuar con las otras imágenes
        }
      }

      // Agregar URLs procesadas al mensaje
      processedUrls.forEach((url, index) => {
        messageData[`MediaUrl${index}`] = url;
      });

      if (processedUrls.length === 0) {
        // Si no se pudieron procesar las imágenes, enviar solo texto
        console.warn(`[TWILIO] No se pudieron procesar las imágenes, enviando solo texto`);
        await sendWhatsAppMessage({
          to: myWhatsAppNumber,
          body: forwardedBody + "\n\n[Nota: Las imágenes no pudieron ser reenviadas]",
        });
        return;
      }

      const message = await client.messages.create(messageData);
      
      // Guardar mensaje en base de datos
      await prisma.message.create({
        data: {
          direction: "outbound",
          from: credentials.fromNumber,
          to: myWhatsAppNumber,
          body: forwardedBody,
          twilioSid: message.sid,
        },
      });

      console.log(`[TWILIO] Mensaje con ${processedUrls.length} imagen(es) reenviado. SID: ${message.sid}`);
    } else {
      // Solo texto, usar función normal
      await sendWhatsAppMessage({
        to: myWhatsAppNumber,
        body: forwardedBody,
      });
      console.log(`[TWILIO] Mensaje reenviado a ${myWhatsAppNumber}`);
    }
  } catch (error: any) {
    console.error("Error reenviando mensaje:", error);
    throw error;
  }
};
