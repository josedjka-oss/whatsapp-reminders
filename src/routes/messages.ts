import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { fromZonedTime } from "date-fns-tz";

const router = Router();

/**
 * Listar mensajes con filtros opcionales
 * GET /api/messages?from=...&to=...&direction=...
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { from, to, direction, limit = "50" } = req.query;

    const where: any = {};
    if (from) {
      where.from = from;
    }
    if (to) {
      where.to = to;
    }
    if (direction && ["inbound", "outbound"].includes(direction as string)) {
      where.direction = direction;
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit as string) || 50,
    });

    return res.json({
      count: messages.length,
      messages,
    });
  } catch (error: any) {
    console.error("Error listando mensajes:", error);
    return res.status(500).json({
      error: error.message || "Error al listar mensajes",
    });
  }
});

/**
 * Obtener mensajes enviados en una fecha específica con información de respuestas
 * GET /api/messages/sent-by-date?date=2026-02-05
 */
router.get("/sent-by-date", async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        error: "El parámetro 'date' es requerido (formato: YYYY-MM-DD)",
      });
    }

    // Parsear la fecha (formato: YYYY-MM-DD)
    // La fecha viene como "2026-02-06" y debe interpretarse en la zona horaria de Bogotá
    const timezone = process.env.APP_TIMEZONE || "America/Bogota";
    
    // Parsear la fecha
    const dateString = date as string; // "2026-02-06"
    const [year, month, day] = dateString.split("-").map(Number);
    
    // Crear strings ISO para el inicio y fin del día en la zona horaria de Bogotá
    // Formato: "YYYY-MM-DDTHH:mm:ss" (sin Z, para que fromZonedTime lo interprete como hora local)
    const startOfDayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
    const endOfDayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59.999`;
    
    // Crear objetos Date desde los strings (se interpretarán como UTC, pero los trataremos como hora local de Bogotá)
    const startOfDayLocal = new Date(startOfDayString);
    const endOfDayLocal = new Date(endOfDayString);
    
    // Convertir de zona horaria de Bogotá a UTC usando fromZonedTime
    // fromZonedTime toma una fecha y la interpreta como si fuera en la zona horaria especificada,
    // luego la convierte a UTC
    const startOfDay = fromZonedTime(startOfDayLocal, timezone);
    const endOfDay = fromZonedTime(endOfDayLocal, timezone);
    
    // Log para debugging
    console.log(`[MESSAGES] Filtrando mensajes para fecha: ${dateString} (${timezone})`);
    console.log(`[MESSAGES] Fecha local inicio: ${startOfDayLocal.toISOString()}`);
    console.log(`[MESSAGES] Fecha local fin: ${endOfDayLocal.toISOString()}`);
    console.log(`[MESSAGES] Rango UTC: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);
    
    // Log adicional: mostrar algunos mensajes para verificar
    const allMessages = await prisma.message.findMany({
      where: {
        direction: "outbound",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
    console.log(`[MESSAGES] Últimos 5 mensajes en DB:`);
    allMessages.forEach((msg, idx) => {
      console.log(`[MESSAGES] ${idx + 1}. createdAt: ${msg.createdAt.toISOString()}, to: ${msg.to}`);
    });

    // Obtener el número personal para filtrar mensajes de reenvío interno
    const myWhatsAppNumber = process.env.MY_WHATSAPP_NUMBER?.trim();
    const myWhatsAppNumberFormatted = myWhatsAppNumber 
      ? (myWhatsAppNumber.startsWith("whatsapp:") ? myWhatsAppNumber : `whatsapp:${myWhatsAppNumber}`)
      : null;

    // Obtener mensajes enviados (outbound) en esa fecha
    // Excluir mensajes reenviados al número personal (son internos, no necesitan mostrarse)
    const sentMessages = await prisma.message.findMany({
      where: {
        direction: "outbound",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        // Excluir mensajes enviados al número personal (reenvíos internos)
        ...(myWhatsAppNumberFormatted ? {
          NOT: {
            to: myWhatsAppNumberFormatted,
          },
        } : {}),
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Para cada mensaje enviado, verificar si tuvo respuesta y buscar el nombre del contacto
    const messagesWithResponseStatus = await Promise.all(
      sentMessages.map(async (sentMessage) => {
        // Buscar si hay mensajes recibidos (inbound) que sean respuestas
        // Una respuesta es un mensaje inbound donde:
        // - from = to del mensaje enviado (el destinatario respondió)
        // - to = from del mensaje enviado (respondió al número que envió)
        // - createdAt > createdAt del mensaje enviado (respondió después)
        const response = await prisma.message.findFirst({
          where: {
            direction: "inbound",
            from: sentMessage.to, // El destinatario respondió
            to: sentMessage.from, // Al número que envió
            createdAt: {
              gt: sentMessage.createdAt, // Después del mensaje enviado
            },
          },
          orderBy: {
            createdAt: "asc", // Primera respuesta
          },
        });

        // Buscar el contacto por número de teléfono
        // Intentar buscar con el formato exacto primero
        let contact = await prisma.contact.findUnique({
          where: {
            phone: sentMessage.to, // Buscar por el número de destino
          },
        });

        // Si no se encuentra, intentar buscar sin el prefijo "whatsapp:"
        if (!contact && sentMessage.to.startsWith("whatsapp:")) {
          const phoneWithoutPrefix = sentMessage.to.replace("whatsapp:", "");
          contact = await prisma.contact.findFirst({
            where: {
              phone: {
                contains: phoneWithoutPrefix, // Buscar parcialmente
              },
            },
          });
        }

        // Si aún no se encuentra, intentar buscar con el número sin el prefijo
        if (!contact) {
          const phoneWithoutPrefix = sentMessage.to.replace(/^whatsapp:/, "");
          contact = await prisma.contact.findFirst({
            where: {
              phone: {
                endsWith: phoneWithoutPrefix, // Buscar que termine con el número
              },
            },
          });
        }

        const result = {
          id: sentMessage.id,
          to: sentMessage.to,
          contactName: contact?.name || null, // Nombre del contacto si existe
          body: sentMessage.body,
          createdAt: sentMessage.createdAt,
          twilioSid: sentMessage.twilioSid,
          hasResponse: !!response, // true si hay respuesta, false si no
          responseAt: response?.createdAt || null, // Fecha de la respuesta (si existe)
        };

        // Log para debugging
        if (contact) {
          console.log(`[MESSAGES] Contacto encontrado para ${sentMessage.to}: ${contact.name}`);
        }

        return result;
      })
    );

    return res.json({
      date: date,
      count: messagesWithResponseStatus.length,
      messages: messagesWithResponseStatus,
    });
  } catch (error: any) {
    console.error("Error obteniendo mensajes por fecha:", error);
    return res.status(500).json({
      error: error.message || "Error al obtener mensajes",
    });
  }
});

export default router;
