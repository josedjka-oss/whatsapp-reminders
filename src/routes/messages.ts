import { Router, Request, Response } from "express";
import { prisma } from "../db";
import {
  detectIntegrationTaskKind,
  INTEGRATION_TASK_LABELS,
  INTEGRATION_TASK_ORDER,
  type IntegrationTaskKind,
} from "../utils/integration-task-message";

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

    // Obtener TODOS los mensajes enviados (outbound) primero, luego filtrar en memoria
    // Esto nos permite ver exactamente qué mensajes hay y por qué no están siendo encontrados
    console.log(`[MESSAGES] Obteniendo todos los mensajes outbound...`);
    
    const allOutboundMessages = await prisma.message.findMany({
      where: {
        direction: "outbound",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    console.log(`[MESSAGES] Total de mensajes outbound en DB: ${allOutboundMessages.length}`);
    
    // Filtrar en memoria por fecha y número personal
    const sentMessages = allOutboundMessages.filter((msg) => {
      // Filtrar por fecha (en rango UTC)
      const inDateRange = msg.createdAt >= startOfDay && msg.createdAt <= endOfDay;
      
      // Filtrar por número personal (excluir reenvíos internos)
      const isNotPersonalForward = !myWhatsAppNumberFormatted || msg.to !== myWhatsAppNumberFormatted;
      
      const shouldInclude = inDateRange && isNotPersonalForward;
      
      if (!shouldInclude && inDateRange) {
        console.log(`[MESSAGES] Mensaje excluido (reenvío interno): createdAt=${msg.createdAt.toISOString()}, to=${msg.to}`);
      }
      
      return shouldInclude;
    });
    
    console.log(`[MESSAGES] Mensajes encontrados después del filtro: ${sentMessages.length}`);
    if (sentMessages.length > 0) {
      console.log(`[MESSAGES] Primer mensaje encontrado: createdAt=${sentMessages[0].createdAt.toISOString()}, to=${sentMessages[0].to}`);
    } else {
      // Mostrar algunos mensajes cercanos a la fecha para debugging
      const nearbyMessages = allOutboundMessages.filter((msg) => {
        const msgDate = new Date(msg.createdAt);
        const targetDate = new Date(startOfDay);
        const diffDays = Math.abs((msgDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 2; // Mensajes dentro de 2 días
      }).slice(0, 5);
      
      if (nearbyMessages.length > 0) {
        console.log(`[MESSAGES] Mensajes cercanos a la fecha solicitada (dentro de 2 días):`);
        nearbyMessages.forEach((msg, idx) => {
          const msgDate = new Date(msg.createdAt);
          const isInRange = msg.createdAt >= startOfDay && msg.createdAt <= endOfDay;
          console.log(`[MESSAGES] ${idx + 1}. createdAt: ${msg.createdAt.toISOString()} (${msgDate.toISOString().split('T')[0]}), to: ${msg.to}, en rango: ${isInRange}`);
        });
      }
    }
    
    // Ordenar por fecha ascendente
    sentMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

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

        const taskKind = detectIntegrationTaskKind(sentMessage.body);

        const result = {
          id: sentMessage.id,
          to: sentMessage.to,
          contactName: contact?.name || null, // Nombre del contacto si existe
          body: sentMessage.body,
          createdAt: sentMessage.createdAt,
          twilioSid: sentMessage.twilioSid,
          hasResponse: !!response, // true si hay respuesta, false si no
          responseAt: response?.createdAt || null, // Fecha de la respuesta (si existe)
          taskKind,
          taskLabel: taskKind ? INTEGRATION_TASK_LABELS[taskKind] : null,
        };

        // Log para debugging
        if (contact) {
          console.log(`[MESSAGES] Contacto encontrado para ${sentMessage.to}: ${contact.name}`);
        }

        return result;
      })
    );

    const taskMessages = INTEGRATION_TASK_ORDER.reduce(
      (acc, kind) => {
        acc[kind] = messagesWithResponseStatus.filter((m) => m.taskKind === kind);
        return acc;
      },
      {} as Record<IntegrationTaskKind, typeof messagesWithResponseStatus>
    );

    const otherMessages = messagesWithResponseStatus.filter((m) => !m.taskKind);

    return res.json({
      date: date,
      count: messagesWithResponseStatus.length,
      taskCount: messagesWithResponseStatus.filter((m) => m.taskKind).length,
      taskMessages,
      taskLabels: INTEGRATION_TASK_LABELS,
      otherCount: otherMessages.length,
      messages: messagesWithResponseStatus,
      otherMessages,
    });
  } catch (error: any) {
    console.error("Error obteniendo mensajes por fecha:", error);
    return res.status(500).json({
      error: error.message || "Error al obtener mensajes",
    });
  }
});

export default router;
