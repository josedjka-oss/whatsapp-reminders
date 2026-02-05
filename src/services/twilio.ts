import twilio from "twilio";
import { prisma } from "../db";

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
    
    // Limpiar el texto de caracteres problemáticos que puedan romper el JSON
    const cleanReminderText = reminderText
      .replace(/[\u0000-\u001F]/g, '') // Remover caracteres de control
      .trim();
    
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
 * Sube una imagen a imgbb.com y obtiene una URL pública
 * imgbb.com es un servicio gratuito de hosting de imágenes
 */
const uploadToImgbb = async (imageBuffer: Buffer, contentType: string): Promise<string> => {
  // imgbb.com API (gratuito, sin API key para uso básico, pero limitado)
  // Alternativa: usar otro servicio o implementar nuestro propio servidor de archivos
  
  try {
    // Convertir imagen a base64
    const base64 = imageBuffer.toString("base64");
    
    // Usar imgbb API (requiere API key, pero hay versión sin key)
    // Por ahora, intentamos con un servicio público simple
    // Nota: Esto es temporal, idealmente deberíamos tener nuestro propio servicio
    
    // Intentar usar la API de imgbb (puede requerir API key)
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: contentType });
    formData.append("image", blob);
    
    // Por ahora, retornamos null para indicar que necesitamos otra solución
    // La mejor opción es usar las URLs de Twilio con autenticación embebida en la URL
    throw new Error("Subir a servicio público no implementado aún");
  } catch (error) {
    throw error;
  }
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
          console.log(`[TWILIO] Procesando imagen ${i + 1}/${mediaUrls.length}...`);
          console.log(`[TWILIO] URL original: ${mediaUrl}`);
          
          // Descargar la imagen desde Twilio con autenticación
          console.log(`[TWILIO] Descargando imagen ${i + 1}...`);
          const { buffer: imageBuffer, contentType } = await downloadTwilioMedia(
            mediaUrl,
            credentials.accountSid,
            credentials.authToken
          );
          
          console.log(`[TWILIO] Imagen descargada: ${imageBuffer.length} bytes, tipo: ${contentType}`);
          
          // Intentar usar la URL original primero (puede funcionar si es la misma cuenta)
          // Si no funciona, necesitaremos subir a un servicio público
          // Por ahora, intentamos con la URL original
          processedUrls.push(mediaUrl);
          console.log(`[TWILIO] ✅ Imagen ${i + 1} procesada (usando URL original)`);
          
        } catch (error: any) {
          console.error(`[TWILIO] ❌ Error procesando imagen ${i + 1}:`, error.message);
          // Continuar con las otras imágenes
        }
      }

      // Agregar URLs procesadas al mensaje
      processedUrls.forEach((url, index) => {
        messageData[`MediaUrl${index}`] = url;
      });

      if (processedUrls.length === 0) {
        // Si no se pudieron procesar las imágenes, enviar solo texto usando template
        console.warn(`[TWILIO] No se pudieron procesar las imágenes, enviando solo texto`);
        await sendWhatsAppMessage({
          to: myWhatsAppNumber,
          reminderText: forwardedBody + "\n\n[Nota: Las imágenes no pudieron ser reenviadas]",
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
      // Solo texto, usar función normal con template
      await sendWhatsAppMessage({
        to: myWhatsAppNumber,
        reminderText: forwardedBody,
      });
      console.log(`[TWILIO] Mensaje reenviado a ${myWhatsAppNumber}`);
    }
  } catch (error: any) {
    console.error("Error reenviando mensaje:", error);
    throw error;
  }
};
