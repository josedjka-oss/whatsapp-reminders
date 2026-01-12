import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { addHours, addDays, parse } from "date-fns";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Rate limiting para /api/ai
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 requests por ventana
  message: "Demasiadas solicitudes, intenta de nuevo más tarde",
});

// Aplicar autenticación y rate limiting
router.use(requireAuth);
router.use(aiRateLimit);

// Rate limiting para /api/ai
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // máximo 50 requests por ventana
  message: "Demasiadas solicitudes, intenta de nuevo más tarde",
});

// Aplicar autenticación y rate limiting
router.use(requireAuth);
router.use(aiRateLimit);

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Timezone por defecto
const DEFAULT_TIMEZONE = "America/Bogota";

/**
 * Resuelve un nombre de contacto a número de WhatsApp
 */
const resolveContact = async (name: string): Promise<string | null> => {
  const contact = await prisma.contact.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
  return contact?.phone || null;
};

/**
 * Parsea expresiones de tiempo relativo a fecha/hora
 */
const parseRelativeTime = (text: string): Date | null => {
  const now = new Date();
  const zonedNow = utcToZonedTime(now, DEFAULT_TIMEZONE);

  // "mañana" = día siguiente a las 9am
  if (text.toLowerCase().includes("mañana")) {
    const tomorrow = addDays(zonedNow, 1);
    return zonedTimeToUtc(
      new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      DEFAULT_TIMEZONE
    );
  }

  // "hoy" = hoy a las 9am (si ya pasó, mañana a las 9am)
  if (text.toLowerCase().includes("hoy")) {
    const today = new Date(zonedNow.getFullYear(), zonedNow.getMonth(), zonedNow.getDate(), 9, 0);
    if (today < zonedNow) {
      return zonedTimeToUtc(addDays(today, 1), DEFAULT_TIMEZONE);
    }
    return zonedTimeToUtc(today, DEFAULT_TIMEZONE);
  }

  // "en X horas"
  const hoursMatch = text.match(/en\s+(\d+)\s+horas?/i);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    return zonedTimeToUtc(addHours(zonedNow, hours), DEFAULT_TIMEZONE);
  }

  // "en X días"
  const daysMatch = text.match(/en\s+(\d+)\s+días?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    return zonedTimeToUtc(addDays(zonedNow, days), DEFAULT_TIMEZONE);
  }

  return null;
};

/**
 * Extrae hora de texto (ej: "5 pm", "17:00", "5:30 pm")
 */
const parseTime = (text: string): { hour: number; minute: number } | null => {
  // Formato "5 pm" o "5:30 pm"
  const pmMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*pm/i);
  if (pmMatch) {
    const hour = parseInt(pmMatch[1]);
    const minute = pmMatch[2] ? parseInt(pmMatch[2]) : 0;
    return { hour: hour === 12 ? 12 : hour + 12, minute };
  }

  // Formato "5 am" o "5:30 am"
  const amMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*am/i);
  if (amMatch) {
    const hour = parseInt(amMatch[1]);
    const minute = amMatch[2] ? parseInt(amMatch[2]) : 0;
    return { hour: hour === 12 ? 0 : hour, minute };
  }

  // Formato "17:00" o "17:30"
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return { hour: parseInt(timeMatch[1]), minute: parseInt(timeMatch[2]) };
  }

  return null;
};

/**
 * Endpoint principal de AI
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "El campo 'text' es requerido y debe ser un string",
      });
    }

    // Obtener contactos para contexto
    const contacts = await prisma.contact.findMany();
    const contactsContext = contacts
      .map((c) => `- ${c.name}: ${c.phone}`)
      .join("\n");

    // Obtener recordatorios activos para contexto
    const activeReminders = await prisma.reminder.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const remindersContext = activeReminders
      .map((r) => {
        let schedule = "";
        if (r.scheduleType === "once" && r.sendAt) {
          schedule = `una vez el ${new Date(r.sendAt).toLocaleDateString("es-CO")}`;
        } else if (r.scheduleType === "daily") {
          schedule = `diariamente a las ${r.hour}:${String(r.minute).padStart(2, "0")}`;
        } else if (r.scheduleType === "monthly") {
          schedule = `mensualmente el día ${r.dayOfMonth} a las ${r.hour}:${String(r.minute).padStart(2, "0")}`;
        }
        return `- ID: ${r.id.substring(0, 8)}... | Para: ${r.to} | ${schedule} | Mensaje: "${r.body.substring(0, 50)}"`;
      })
      .join("\n");

    // Definir tools para OpenAI
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "create_reminder",
          description: "Crea un nuevo recordatorio de WhatsApp. Usa esta función cuando el usuario quiera programar un mensaje.",
          parameters: {
            type: "object",
            properties: {
              to: {
                type: "string",
                description:
                  "Número de WhatsApp en formato 'whatsapp:+57xxxxxxxxxx'. Si el usuario menciona un nombre, primero intenta resolverlo usando los contactos disponibles. Si no existe, pregunta al usuario por el número.",
              },
              body: {
                type: "string",
                description: "El texto del mensaje que se enviará",
              },
              scheduleType: {
                type: "string",
                enum: ["once", "daily", "monthly"],
                description:
                  "Tipo de programación: 'once' para una vez, 'daily' para diario, 'monthly' para mensual",
              },
              sendAt: {
                type: "string",
                format: "date-time",
                description:
                  "Fecha y hora ISO para 'once'. Si el usuario dice 'mañana', 'hoy', 'en X horas', convierte a fecha real. Timezone: America/Bogota",
              },
              hour: {
                type: "integer",
                minimum: 0,
                maximum: 23,
                description: "Hora del día (0-23) para 'daily' o 'monthly'",
              },
              minute: {
                type: "integer",
                minimum: 0,
                maximum: 59,
                description: "Minuto (0-59) para 'daily' o 'monthly'",
              },
              dayOfMonth: {
                type: "integer",
                minimum: 1,
                maximum: 31,
                description: "Día del mes (1-31) para 'monthly'",
              },
            },
            required: ["to", "body", "scheduleType"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "list_reminders",
          description: "Lista los recordatorios activos. Usa esta función cuando el usuario pregunte qué recordatorios tiene, o quiera ver sus recordatorios.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "cancel_reminder",
          description:
            "Cancela (desactiva) un recordatorio. Usa esta función cuando el usuario quiera cancelar, eliminar o detener un recordatorio. Si menciona un nombre o mensaje, busca el recordatorio más reciente que coincida.",
          parameters: {
            type: "object",
            properties: {
              reminderId: {
                type: "string",
                description:
                  "ID del recordatorio a cancelar. Si el usuario menciona un nombre o mensaje, busca el recordatorio más reciente que coincida.",
              },
            },
            required: ["reminderId"],
          },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "create_contact",
          description:
            "Crea un nuevo contacto. Usa esta función cuando el usuario quiera guardar un nombre con su número de WhatsApp para usarlo después.",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Nombre del contacto (ej: 'Juan', 'María')",
              },
              phone: {
                type: "string",
                description: "Número de WhatsApp en formato 'whatsapp:+57xxxxxxxxxx'",
              },
            },
            required: ["name", "phone"],
          },
        },
      },
    ];

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asistente inteligente para gestionar recordatorios de WhatsApp.

CONTEXTO:
- Timezone: ${DEFAULT_TIMEZONE}
- Contactos disponibles:
${contactsContext || "  (ningún contacto guardado aún)"}

- Recordatorios activos recientes:
${remindersContext || "  (ningún recordatorio activo)"}

INSTRUCCIONES:
1. Si el usuario menciona un nombre (ej: "Juan"), primero intenta resolverlo usando los contactos. Si no existe, pregunta: "¿Qué número de WhatsApp tiene [nombre]?"
2. Si falta información crítica (hora, fecha, destinatario), haz UNA sola pregunta clara.
3. Siempre confirma al final lo que hiciste de forma clara y natural.
4. Para fechas relativas ("mañana", "hoy", "en 2 horas"), convierte a fecha real usando la función.
5. Sé conciso pero amigable.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      tools,
      tool_choice: "auto",
    });

    const message = completion.choices[0].message;
    const actions: Array<{ type: string; summary: string }> = [];

    // Procesar tool calls
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        try {
          if (functionName === "create_reminder") {
            // Resolver contacto si es necesario
            let to = args.to;
            if (!to.startsWith("whatsapp:+")) {
              const contactPhone = await resolveContact(to);
              if (contactPhone) {
                to = contactPhone;
              } else {
                // Si no se encuentra el contacto, OpenAI debe preguntar
                continue;
              }
            }

            // Procesar fecha relativa si es necesario
            let sendAt = args.sendAt;
            if (args.scheduleType === "once" && sendAt) {
              const relativeDate = parseRelativeTime(sendAt);
              if (relativeDate) {
                sendAt = relativeDate.toISOString();
              }
            }

            // Procesar hora si es necesario
            let hour = args.hour;
            let minute = args.minute;
            if (args.scheduleType === "daily" || args.scheduleType === "monthly") {
              if (args.hour === undefined || args.minute === undefined) {
                // Intentar extraer de texto
                const timeInfo = parseTime(text);
                if (timeInfo) {
                  hour = timeInfo.hour;
                  minute = timeInfo.minute;
                }
              }
            }

            const reminder = await prisma.reminder.create({
              data: {
                to,
                body: args.body,
                scheduleType: args.scheduleType,
                sendAt: args.scheduleType === "once" && sendAt ? new Date(sendAt) : null,
                hour: args.scheduleType !== "once" ? hour : null,
                minute: args.scheduleType !== "once" ? minute : null,
                dayOfMonth: args.scheduleType === "monthly" ? args.dayOfMonth : null,
                timezone: DEFAULT_TIMEZONE,
                isActive: true,
              },
            });

            let scheduleText = "";
            if (args.scheduleType === "once" && sendAt) {
              const date = new Date(sendAt);
              scheduleText = `el ${date.toLocaleDateString("es-CO")} a las ${date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
            } else if (args.scheduleType === "daily") {
              scheduleText = `todos los días a las ${hour}:${String(minute).padStart(2, "0")}`;
            } else if (args.scheduleType === "monthly") {
              scheduleText = `todos los meses el día ${args.dayOfMonth} a las ${hour}:${String(minute).padStart(2, "0")}`;
            }

            actions.push({
              type: "created",
              summary: `Recordatorio creado: Enviaré "${args.body}" a ${to} ${scheduleText}`,
            });
          } else if (functionName === "list_reminders") {
            const reminders = await prisma.reminder.findMany({
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
            });

            if (reminders.length === 0) {
              actions.push({
                type: "info",
                summary: "No tienes recordatorios activos",
              });
            } else {
              actions.push({
                type: "info",
                summary: `Tienes ${reminders.length} recordatorio(s) activo(s)`,
              });
            }
          } else if (functionName === "cancel_reminder") {
            const reminder = await prisma.reminder.findUnique({
              where: { id: args.reminderId },
            });

            if (!reminder) {
              // Buscar por nombre o mensaje
              const searchTerm = text.toLowerCase();
              const matchingReminder = await prisma.reminder.findFirst({
                where: {
                  isActive: true,
                  OR: [
                    { to: { contains: searchTerm, mode: "insensitive" } },
                    { body: { contains: searchTerm, mode: "insensitive" } },
                  ],
                },
                orderBy: { createdAt: "desc" },
              });

              if (matchingReminder) {
                await prisma.reminder.update({
                  where: { id: matchingReminder.id },
                  data: { isActive: false },
                });
                actions.push({
                  type: "canceled",
                  summary: `Recordatorio cancelado: "${matchingReminder.body}"`,
                });
              } else {
                actions.push({
                  type: "error",
                  summary: "No se encontró el recordatorio",
                });
              }
            } else {
              await prisma.reminder.update({
                where: { id: args.reminderId },
                data: { isActive: false },
              });
              actions.push({
                type: "canceled",
                summary: `Recordatorio cancelado: "${reminder.body}"`,
              });
            }
          } else if (functionName === "create_contact") {
            const contact = await prisma.contact.upsert({
              where: { phone: args.phone },
              update: { name: args.name },
              create: {
                name: args.name,
                phone: args.phone,
              },
            });

            actions.push({
              type: "created",
              summary: `Contacto guardado: ${contact.name} (${contact.phone})`,
            });
          }
        } catch (error: any) {
          console.error(`Error ejecutando tool ${functionName}:`, error);
          actions.push({
            type: "error",
            summary: `Error: ${error.message}`,
          });
        }
      }
    }

    // Obtener respuesta final de OpenAI
    let reply = message.content || "";

    // Si hay tool calls, obtener respuesta final
    if (message.tool_calls && message.tool_calls.length > 0) {
      const finalMessages = [
        {
          role: "system" as const,
          content: `Eres un asistente inteligente para gestionar recordatorios de WhatsApp.`,
        },
        {
          role: "user" as const,
          content: text,
        },
        message,
        ...message.tool_calls.map((tc) => ({
          role: "tool" as const,
          tool_call_id: tc.id,
          content: JSON.stringify(actions.find((a) => a.type !== "error") || { success: true }),
        })),
      ];

      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: finalMessages as any,
      });

      reply = finalCompletion.choices[0].message.content || reply;
    }

    return res.json({
      reply,
      actions: actions.length > 0 ? actions : undefined,
    });
  } catch (error: any) {
    console.error("Error en /api/ai:", error);
    return res.status(500).json({
      error: "Error procesando la solicitud",
      message: error.message,
    });
  }
});

export default router;
