import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

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
    
    // Crear fecha en la zona horaria local (Bogotá) para el inicio del día
    const dateString = date as string; // "2026-02-06"
    const [year, month, day] = dateString.split("-").map(Number);
    
    // Crear fecha local en Bogotá (inicio del día: 00:00:00)
    const startOfDayLocal = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    // Convertir a UTC para comparar con createdAt (que está en UTC en la DB)
    const startOfDay = zonedTimeToUtc(startOfDayLocal, timezone);
    
    // Crear fecha local en Bogotá (fin del día: 23:59:59.999)
    const endOfDayLocal = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    // Convertir a UTC para comparar con createdAt (que está en UTC en la DB)
    const endOfDay = zonedTimeToUtc(endOfDayLocal, timezone);

    // Obtener mensajes enviados (outbound) en esa fecha
    const sentMessages = await prisma.message.findMany({
      where: {
        direction: "outbound",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
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
        const contact = await prisma.contact.findUnique({
          where: {
            phone: sentMessage.to, // Buscar por el número de destino
          },
        });

        return {
          id: sentMessage.id,
          to: sentMessage.to,
          contactName: contact?.name || null, // Nombre del contacto si existe
          body: sentMessage.body,
          createdAt: sentMessage.createdAt,
          twilioSid: sentMessage.twilioSid,
          hasResponse: !!response, // true si hay respuesta, false si no
          responseAt: response?.createdAt || null, // Fecha de la respuesta (si existe)
        };
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
