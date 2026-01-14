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
const downloadTwilioMedia = async (mediaUrl: string, accountSid: string, authToken: string): Promise<Buffer> => {
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

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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

      // Descargar cada imagen y agregarla al mensaje
      // Nota: Twilio requiere que las URLs sean públicas o accesibles
      // Descargamos el contenido y lo subimos a un servicio temporal
      // Por ahora, intentamos usar las URLs directamente pero con autenticación embebida
      
      const processedUrls: string[] = [];
      
      for (let i = 0; i < Math.min(mediaUrls.length, 10); i++) {
        const mediaUrl = mediaUrls[i];
        try {
          // Descargar el contenido de la imagen
          const imageBuffer = await downloadTwilioMedia(mediaUrl, credentials.accountSid, credentials.authToken);
          
          // Convertir a base64 data URL para enviar directamente
          // O mejor: subir a un servicio público temporal
          // Por ahora, usamos un enfoque diferente: convertir a base64 y usar data URL
          // Pero Twilio no acepta data URLs directamente en WhatsApp
          
          // Alternativa: Usar las URLs de Twilio con autenticación embebida
          // Las URLs de Twilio deberían funcionar si están en el formato correcto
          // Intentemos usar la URL directamente primero (puede funcionar si es la misma cuenta)
          
          processedUrls.push(mediaUrl);
          console.log(`[TWILIO] Procesando imagen ${i + 1}/${mediaUrls.length}: ${mediaUrl.substring(0, 80)}...`);
        } catch (downloadError: any) {
          console.error(`[TWILIO] Error descargando imagen ${i + 1}:`, downloadError.message);
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
