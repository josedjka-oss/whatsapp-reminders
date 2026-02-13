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
  console.log(`[MESSAGES] ===== ENDPOINT LLAMADO =====`);
  console.log(`[MESSAGES] Query params:`, req.query);
  
  try {
    const { date } = req.query;

    if (!date) {
      console.log(`[MESSAGES] ❌ Error: fecha no proporcionada`);
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
    
    // Enfoque más simple: usar una consulta SQL directa que compare solo la fecha
    // Convertir la fecha solicitada a un rango UTC más amplio para asegurar que capturemos todo el día
    // Bogotá es UTC-5, así que el día en Bogotá va desde las 05:00 UTC del día hasta las 04:59:59 UTC del día siguiente
    
    // Crear fecha UTC para el inicio del día solicitado (00:00:00 UTC)
    const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    // Crear fecha UTC para el fin del día solicitado (23:59:59 UTC)
    const endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    
    // Ajustar para zona horaria de Bogotá (UTC-5)
    // Si es 13 de febrero en Bogotá, el día empieza a las 00:00:00 Bogotá = 05:00:00 UTC del 13
    // y termina a las 23:59:59 Bogotá = 04:59:59 UTC del 14
    // Entonces necesitamos buscar desde las 05:00 UTC del 13 hasta las 04:59:59 UTC del 14
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0)); // 00:00 Bogotá = 05:00 UTC
    const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999)); // 23:59:59 Bogotá = 04:59:59 UTC del día siguiente
    
    // Log para debugging
    console.log(`[MESSAGES] Fecha solicitada: ${dateString}`);
    console.log(`[MESSAGES] Rango UTC (ajustado para Bogotá UTC-5): ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);
    
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
      const msgTime = msgDate.toISOString().split('T')[1];
      const isInRange = msg.createdAt >= startOfDay && msg.createdAt <= endOfDay;
      console.log(`[MESSAGES] ${idx + 1}. createdAt: ${msg.createdAt.toISOString()} (${msgDateStr} ${msgTime}), to: ${msg.to}, en rango: ${isInRange}`);
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
