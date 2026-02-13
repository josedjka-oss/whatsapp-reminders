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
    // La fecha viene como "2026-02-13" y debe interpretarse en la zona horaria de Bogotá
    const timezone = process.env.APP_TIMEZONE || "America/Bogota";
    
    console.log(`[MESSAGES] ===== Iniciando consulta de mensajes =====`);
    console.log(`[MESSAGES] Fecha solicitada: ${date}`);
    console.log(`[MESSAGES] Timezone: ${timezone}`);
    
    // Parsear la fecha
    const dateString = date as string; // "2026-02-13"
    const [year, month, day] = dateString.split("-").map(Number);
    
    // Crear fechas locales (interpretadas como hora local de Bogotá)
    // new Date(year, month-1, day, hour, minute, second) crea una fecha en la zona horaria local del servidor
    // Pero necesitamos interpretarla como si fuera en Bogotá
    const startOfDayLocal = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDayLocal = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    // Convertir usando fromZonedTime: interpreta la fecha como si fuera en Bogotá y la convierte a UTC
    const startOfDay = fromZonedTime(startOfDayLocal, timezone);
    const endOfDay = fromZonedTime(endOfDayLocal, timezone);
    
    // Log para debugging
    console.log(`[MESSAGES] Fecha local inicio (Bogotá): ${startOfDayLocal.toISOString()}`);
    console.log(`[MESSAGES] Fecha local fin (Bogotá): ${endOfDayLocal.toISOString()}`);
    console.log(`[MESSAGES] Rango UTC convertido: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);
    
    // Log adicional: mostrar algunos mensajes para verificar
    const allMessages = await prisma.message.findMany({
      where: {
        direction: "outbound",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });
    console.log(`[MESSAGES] Últimos 10 mensajes en DB (total encontrados: ${allMessages.length}):`);
    allMessages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);
      const msgDateStr = msgDate.toISOString().split('T')[0];
      const isInRange = msg.createdAt >= startOfDay && msg.createdAt <= endOfDay;
      console.log(`[MESSAGES] ${idx + 1}. createdAt: ${msg.createdAt.toISOString()} (fecha: ${msgDateStr}), to: ${msg.to}, en rango: ${isInRange}`);
    });

    // Obtener el número personal para filtrar mensajes de reenvío interno
    const myWhatsAppNumber = process.env.MY_WHATSAPP_NUMBER?.trim();
    const myWhatsAppNumberFormatted = myWhatsAppNumber 
      ? (myWhatsAppNumber.startsWith("whatsapp:") ? myWhatsAppNumber : `whatsapp:${myWhatsAppNumber}`)
      : null;

    // Obtener mensajes enviados (outbound) en esa fecha
    // Excluir mensajes reenviados al número personal (son internos, no necesitan mostrarse)
    const whereClause: any = {
      direction: "outbound",
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };
    
    // Excluir mensajes enviados al número personal (reenvíos internos)
    if (myWhatsAppNumberFormatted) {
      whereClause.NOT = {
        to: myWhatsAppNumberFormatted,
      };
      console.log(`[MESSAGES] Filtrando mensajes reenviados al número personal: ${myWhatsAppNumberFormatted}`);
    }
    
    console.log(`[MESSAGES] Consultando mensajes con whereClause:`, JSON.stringify(whereClause, null, 2));
    
    const sentMessages = await prisma.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "asc",
      },
    });
    
    console.log(`[MESSAGES] Mensajes encontrados después del filtro: ${sentMessages.length}`);
    if (sentMessages.length > 0) {
      console.log(`[MESSAGES] Primer mensaje encontrado: createdAt=${sentMessages[0].createdAt.toISOString()}, to=${sentMessages[0].to}`);
    }

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
