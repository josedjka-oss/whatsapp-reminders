import OpenAI from "openai";
import { prisma } from "../db";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addHours, addDays, format } from "date-fns";
import { sendWhatsAppMessage } from "./twilio";
import { sendWhatsAppMessage } from "./twilio";

// Verificar que OPENAI_API_KEY esté configurado
if (!process.env.OPENAI_API_KEY) {
  console.error("[OPENAI] ⚠️  OPENAI_API_KEY no configurado en variables de entorno");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";
const DEFAULT_REMINDER_HOUR = parseInt(process.env.DEFAULT_REMINDER_HOUR || "9", 10);
const DEFAULT_REMINDER_MINUTE = parseInt(process.env.DEFAULT_REMINDER_MINUTE || "0", 10);
const AI_PENDING_TTL_MINUTES = parseInt(process.env.AI_PENDING_TTL_MINUTES || "30", 10);

/**
 * Verifica si una cadena es una fecha ISO válida
 * Acepta cualquier ISO válido con offset o Z
 */
const isValidISO = (str: string): boolean => {
  if (!str || typeof str !== "string") return false;
  return !isNaN(Date.parse(str));
};

/**
 * Parsea expresiones de tiempo relativo a fecha/hora desde texto natural
 */
const parseRelativeTime = (text: string): Date | null => {
  const now = new Date();
  const zonedNow = toZonedTime(now, DEFAULT_TIMEZONE);

  // "mañana" = día siguiente a la hora por defecto
  if (text.toLowerCase().includes("mañana")) {
    const tomorrow = addDays(zonedNow, 1);
    return fromZonedTime(
      new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE),
      DEFAULT_TIMEZONE
    );
  }

  // "hoy" = hoy a la hora por defecto (si ya pasó, mañana)
  if (text.toLowerCase().includes("hoy")) {
    const today = new Date(zonedNow.getFullYear(), zonedNow.getMonth(), zonedNow.getDate(), DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE);
    if (today < zonedNow) {
      return fromZonedTime(addDays(today, 1), DEFAULT_TIMEZONE);
    }
    return fromZonedTime(today, DEFAULT_TIMEZONE);
  }

  // "en X horas"
  const hoursMatch = text.match(/en\s+(\d+)\s+horas?/i);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    return fromZonedTime(addHours(zonedNow, hours), DEFAULT_TIMEZONE);
  }

  // "en X días"
  const daysMatch = text.match(/en\s+(\d+)\s+días?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    return fromZonedTime(addDays(zonedNow, days), DEFAULT_TIMEZONE);
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
 * Resuelve un nombre de contacto a número de WhatsApp
 */
const resolveContact = async (name: string): Promise<string | null> => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
    return contact?.phone || null;
  } catch (error) {
    console.error("[OPENAI] Error resolviendo contacto:", error);
    return null;
  }
};

/**
 * Tools para OpenAI
 */
export const getOpenAITools = () => [
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
      name: "update_reminder",
      description: "Actualiza un recordatorio existente. Usa esta función cuando el usuario quiera modificar un recordatorio.",
      parameters: {
        type: "object",
        properties: {
          reminderId: {
            type: "string",
            description: "ID del recordatorio a actualizar",
          },
          body: {
            type: "string",
            description: "Nuevo texto del mensaje (opcional)",
          },
          hour: {
            type: "integer",
            minimum: 0,
            maximum: 23,
            description: "Nueva hora (opcional)",
          },
          minute: {
            type: "integer",
            minimum: 0,
            maximum: 59,
            description: "Nuevo minuto (opcional)",
          },
        },
        required: ["reminderId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "cancel_reminder",
      description:
        "Cancela (desactiva) un recordatorio. Usa esta función cuando el usuario quiera cancelar, eliminar o detener un recordatorio.",
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
      name: "list_reminders",
      description: "Lista los recordatorios activos. Usa esta función cuando el usuario pregunte qué recordatorios tiene.",
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
      name: "send_message",
      description: "Envía un mensaje de WhatsApp inmediatamente (sin programar). Usa esta función cuando el usuario quiera enviar un mensaje ahora mismo, sin crear un recordatorio.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description:
              "Número de WhatsApp en formato 'whatsapp:+57xxxxxxxxxx'. Si el usuario menciona un nombre, primero intenta resolverlo usando los contactos disponibles.",
          },
          body: {
            type: "string",
            description: "El texto del mensaje que se enviará inmediatamente",
          },
        },
        required: ["to", "body"],
      },
    },
  },
];

/**
 * Ejecuta una tool de OpenAI
 */
export const executeTool = async (
  functionName: string,
  args: any,
  originalText: string
): Promise<{ type: string; summary: string }> => {
  try {
    if (functionName === "create_reminder") {
      // Resolver contacto si es necesario
      let to = args.to;
      if (!to.startsWith("whatsapp:+")) {
        const contactPhone = await resolveContact(to);
        if (contactPhone) {
          to = contactPhone;
        } else {
          // Si no es un contacto y no tiene formato whatsapp:+, intentar formatearlo
          if (!to.startsWith("+")) {
            to = `+${to}`;
          }
          if (!to.startsWith("whatsapp:")) {
            to = `whatsapp:${to}`;
          }
        }
      }
      
      // Validar formato final
      if (!to.match(/^whatsapp:\+\d{10,15}$/)) {
        throw new Error(`Formato de número inválido: ${to}. Debe ser 'whatsapp:+573001234567'`);
      }
      
      console.log(`[OPENAI] create_reminder - Número formateado: ${to}`);

      // Procesar fecha para scheduleType="once"
      let sendAt: string | null = args.sendAt || null;
      if (args.scheduleType === "once") {
        // Si sendAt es ISO válido, usarlo directo
        if (sendAt && isValidISO(sendAt)) {
          // Ya es ISO válido, usar tal cual
        } else {
          // Intentar inferir desde originalText
          const relativeDate = parseRelativeTime(originalText);
          const timeInfo = parseTime(originalText);
          
          if (relativeDate) {
            // Si hay hora en el texto, combinarla con la fecha relativa
            if (timeInfo) {
              const zonedDate = toZonedTime(relativeDate, DEFAULT_TIMEZONE);
              zonedDate.setHours(timeInfo.hour, timeInfo.minute, 0, 0);
              sendAt = fromZonedTime(zonedDate, DEFAULT_TIMEZONE).toISOString();
            } else {
              sendAt = relativeDate.toISOString();
            }
          } else if (timeInfo) {
            // Solo hay hora, usar hoy + hora
            const now = new Date();
            const zonedBase = toZonedTime(now, DEFAULT_TIMEZONE);
            const candidate = new Date(zonedBase);
            candidate.setHours(timeInfo.hour, timeInfo.minute, 0, 0);
            // Si la hora ya pasó hoy, usar mañana
            if (candidate <= zonedBase) {
              candidate.setDate(candidate.getDate() + 1);
            }
            sendAt = fromZonedTime(candidate, DEFAULT_TIMEZONE).toISOString();
          } else {
            throw new Error("Necesito la fecha y hora para un recordatorio único. ¿Cuándo quieres enviarlo? (ej: 'mañana a las 5pm', 'hoy a las 10am')");
          }
        }
      }

      // Procesar hora para daily/monthly
      let hour = args.hour;
      let minute = args.minute;
      if ((args.scheduleType === "daily" || args.scheduleType === "monthly") && (hour === undefined || minute === undefined)) {
        const timeInfo = parseTime(originalText);
        if (timeInfo) {
          hour = timeInfo.hour;
          minute = timeInfo.minute;
        } else {
          throw new Error("Necesito la hora para este tipo de recordatorio. ¿A qué hora? (ej: '5pm', '17:00')");
        }
      }

      // Validaciones finales
      if (args.scheduleType === "once" && !sendAt) {
        throw new Error("Necesito la fecha y hora para un recordatorio único. ¿Cuándo quieres enviarlo?");
      }

      if ((args.scheduleType === "daily" || args.scheduleType === "monthly") && (hour === undefined || minute === undefined)) {
        throw new Error("Necesito la hora para este tipo de recordatorio. ¿A qué hora?");
      }

      if (args.scheduleType === "monthly" && !args.dayOfMonth) {
        throw new Error("Necesito el día del mes para un recordatorio mensual. ¿Qué día del mes? (1-31)");
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

      // Formatear scheduleText con timezone correcto
      let scheduleText = "";
      if (args.scheduleType === "once" && sendAt) {
        const utcDate = new Date(sendAt);
        const zonedDate = toZonedTime(utcDate, DEFAULT_TIMEZONE);
        scheduleText = `el ${format(zonedDate, "dd/MM/yyyy")} a las ${format(zonedDate, "HH:mm")}`;
      } else if (args.scheduleType === "daily") {
        scheduleText = `todos los días a las ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      } else if (args.scheduleType === "monthly") {
        scheduleText = `todos los meses el día ${args.dayOfMonth} a las ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }

      return {
        type: "created",
        summary: `Recordatorio creado: Enviaré "${args.body}" a ${to} ${scheduleText}`,
      };
    }

    if (functionName === "update_reminder") {
      const reminder = await prisma.reminder.findUnique({
        where: { id: args.reminderId },
      });

      if (!reminder) {
        throw new Error("No se encontró el recordatorio con ese ID");
      }

      const updateData: any = {};
      if (args.body !== undefined) updateData.body = args.body;
      if (args.hour !== undefined) updateData.hour = args.hour;
      if (args.minute !== undefined) updateData.minute = args.minute;

      await prisma.reminder.update({
        where: { id: args.reminderId },
        data: updateData,
      });

      return {
        type: "updated",
        summary: `Recordatorio actualizado: "${reminder.body}"`,
      };
    }

    if (functionName === "cancel_reminder") {
      let reminder = await prisma.reminder.findUnique({
        where: { id: args.reminderId },
      });

      if (!reminder) {
        // Buscar por palabras clave en body o contacto
        const searchTerms = originalText.toLowerCase().split(/\s+/).filter(term => term.length > 2);
        
        // Buscar coincidencias
        const matchingReminders = await prisma.reminder.findMany({
          where: {
            isActive: true,
            OR: [
              ...searchTerms.map(term => ({
                body: { contains: term, mode: "insensitive" as const },
              })),
              ...searchTerms.map(term => ({
                to: { contains: term, mode: "insensitive" as const },
              })),
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        if (matchingReminders.length === 0) {
          throw new Error("No se encontró ningún recordatorio que coincida. ¿Puedes ser más específico?");
        }

        if (matchingReminders.length === 1) {
          reminder = matchingReminders[0];
        } else {
          // Múltiples coincidencias - guardar opciones en DB y devolver needs_clarification
          const options = matchingReminders.slice(0, 5).map((r: any, idx: number) => ({
            index: idx + 1,
            id: r.id,
            body: r.body,
            to: r.to,
            scheduleType: r.scheduleType,
          }));

          // Guardar en DB (upsert para solo 1 usuario)
          try {
            await prisma.aiPending.upsert({
              where: {
                userId_type: {
                  userId: "default",
                  type: "cancel_reminder",
                },
              },
              update: {
                options: options as any,
              },
              create: {
                userId: "default",
                type: "cancel_reminder",
                options: options as any,
              },
            });
          } catch (error) {
            console.error("[OPENAI] Error guardando opciones en AiPending:", error);
            // Continuar aunque falle guardar en DB
          }

          const remindersList = options
            .map((opt: any) => `${opt.index}. "${opt.body.substring(0, 50)}" para ${opt.to}`)
            .join("\n");
          
          return {
            type: "needs_clarification",
            summary: `Encontré ${matchingReminders.length} recordatorios que coinciden. ¿Cuál quieres cancelar?\n\n${remindersList}\n\nResponde con el número (1-${options.length}) o sé más específico.`,
          };
        }
      }

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { isActive: false },
      });

      return {
        type: "canceled",
        summary: `Recordatorio cancelado: "${reminder.body}"`,
      };
    }

    if (functionName === "list_reminders") {
      const reminders = await prisma.reminder.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5, // Solo los 5 más recientes
      });

      if (reminders.length === 0) {
        return {
          type: "listed",
          summary: "No tienes recordatorios activos",
        };
      }

      // Formatear lista con números, ID corto y resumen
      const remindersList = reminders
        .map((r: any, idx: number) => {
          let schedule = "";
          if (r.scheduleType === "once" && r.sendAt) {
            const zonedDate = toZonedTime(new Date(r.sendAt), DEFAULT_TIMEZONE);
            schedule = `el ${format(zonedDate, "dd/MM/yyyy")} a las ${format(zonedDate, "HH:mm")}`;
          } else if (r.scheduleType === "daily") {
            schedule = `diariamente a las ${String(r.hour).padStart(2, "0")}:${String(r.minute).padStart(2, "0")}`;
          } else if (r.scheduleType === "monthly") {
            schedule = `mensualmente el día ${r.dayOfMonth} a las ${String(r.hour).padStart(2, "0")}:${String(r.minute).padStart(2, "0")}`;
          }
          return `${idx + 1}. ID: ${r.id.substring(0, 8)}... | Para: ${r.to} | ${schedule} | "${r.body.substring(0, 40)}${r.body.length > 40 ? "..." : ""}"`;
        })
        .join("\n");

      return {
        type: "listed",
        summary: `Tienes ${reminders.length} recordatorio(s) activo(s):\n\n${remindersList}`,
      };
    }

    throw new Error(`Función desconocida: ${functionName}`);
  } catch (error: any) {
    console.error(`[OPENAI] Error ejecutando tool ${functionName}:`, error);
    throw error;
  }
};

/**
 * Procesa un mensaje del usuario usando OpenAI
 */
export const processUserMessage = async (text: string): Promise<{ reply: string; actions?: Array<{ type: string; summary: string }> }> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no configurado. Por favor, configura esta variable de entorno en Render.");
  }

  // Verificar si el usuario está respondiendo a una pregunta de clarificación (número 1-5)
  const numericMatch = text.trim().match(/^(\d+)$/);
  if (numericMatch) {
    const selectedIndex = parseInt(numericMatch[1]);
    
    // Validar rango
    if (selectedIndex < 1 || selectedIndex > 5) {
      return {
        reply: "Elige un número válido (1-5).",
        actions: [],
      };
    }
    
    // Buscar pending de cancel_reminder
    try {
      const pending = await prisma.aiPending.findUnique({
        where: {
          userId_type: {
            userId: "default",
            type: "cancel_reminder",
          },
        },
      });

      if (pending) {
        // Limpieza defensiva: Si options no es array o está vacío, borrar pending
        if (!pending.options || !Array.isArray(pending.options) || pending.options.length === 0) {
          await prisma.aiPending.delete({
            where: {
              userId_type: {
                userId: "default",
                type: "cancel_reminder",
              },
            },
          });

          return {
            reply: "La lista de opciones no es válida o está vacía. Por favor, vuelve a intentar cancelar el recordatorio.",
            actions: [],
          };
        }

        // Verificar TTL (configurable, default 30 minutos)
        const now = new Date();
        const pendingAge = now.getTime() - pending.updatedAt.getTime();
        const ttlMs = AI_PENDING_TTL_MINUTES * 60 * 1000;

        if (pendingAge > ttlMs) {
          // Pending expirado, eliminar y notificar
          await prisma.aiPending.delete({
            where: {
              userId_type: {
                userId: "default",
                type: "cancel_reminder",
              },
            },
          });

          return {
            reply: `La lista de opciones ha expirado (más de ${AI_PENDING_TTL_MINUTES} minutos). Por favor, vuelve a intentar cancelar el recordatorio.`,
            actions: [],
          };
        }

        const options = pending.options as any[];
        const selectedOption = options.find((opt) => opt.index === selectedIndex);
        
        if (selectedOption) {
          // Ejecutar cancel_reminder con el ID correcto
          await prisma.reminder.update({
            where: { id: selectedOption.id },
            data: { isActive: false },
          });

          // Eliminar pending
          await prisma.aiPending.delete({
            where: {
              userId_type: {
                userId: "default",
                type: "cancel_reminder",
              },
            },
          });

          return {
            reply: `He cancelado el recordatorio: "${selectedOption.body}"`,
            actions: [{
              type: "canceled",
              summary: `Recordatorio cancelado: "${selectedOption.body}"`,
            }],
          };
        } else {
          return {
            reply: `No encontré la opción ${selectedIndex}. Por favor, elige un número de la lista anterior (1-${options.length}).`,
            actions: [],
          };
        }
      }
    } catch (error) {
      console.error("[OPENAI] Error procesando respuesta numérica:", error);
      // Continuar con el flujo normal si hay error
    }
  }

  // Obtener contexto (manejar error si Contact no existe)
  let contacts: any[] = [];
  try {
    contacts = await prisma.contact.findMany();
  } catch (error) {
    console.warn("[OPENAI] No se pudo obtener contactos (modelo Contact puede no existir):", error);
    contacts = [];
  }
  const contactsContext = contacts.map((c) => `- ${c.name}: ${c.phone}`).join("\n");

  const activeReminders = await prisma.reminder.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const remindersContext = activeReminders
    .map((r: any) => {
      let schedule = "";
      if (r.scheduleType === "once" && r.sendAt) {
        const zonedDate = toZonedTime(new Date(r.sendAt), DEFAULT_TIMEZONE);
        schedule = `una vez el ${format(zonedDate, "dd/MM/yyyy HH:mm")}`;
      } else if (r.scheduleType === "daily") {
        schedule = `diariamente a las ${String(r.hour).padStart(2, "0")}:${String(r.minute).padStart(2, "0")}`;
      } else if (r.scheduleType === "monthly") {
        schedule = `mensualmente el día ${r.dayOfMonth} a las ${String(r.hour).padStart(2, "0")}:${String(r.minute).padStart(2, "0")}`;
      }
      return `- ID: ${r.id.substring(0, 8)}... | Para: ${r.to} | ${schedule} | Mensaje: "${r.body.substring(0, 50)}"`;
    })
    .join("\n");

  const tools = getOpenAITools();

  // Primera llamada a OpenAI
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
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolResults: any[] = [];
    let hasNeedsClarification = false;

    for (const toolCall of message.tool_calls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      try {
        const action = await executeTool(functionName, args, text);
        actions.push(action);
        
        // Si hay needs_clarification, retornar inmediatamente sin segunda llamada
        if (action.type === "needs_clarification") {
          hasNeedsClarification = true;
          // NO agregar a toolResults, retornar directo
          return {
            reply: action.summary,
            actions: [action],
          };
        }
        
        // Solo agregar a toolResults si NO es needs_clarification
        toolResults.push({
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: true, result: action.summary }),
        });
      } catch (error: any) {
        console.error(`[OPENAI] Error en tool ${functionName}:`, error);
        toolResults.push({
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: false, error: error.message }),
        });
        actions.push({
          type: "error",
          summary: `Error: ${error.message}`,
        });
      }
    }

    // Solo hacer segunda llamada si NO hay needs_clarification
    if (!hasNeedsClarification) {
      // Segunda llamada para obtener respuesta final
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un asistente inteligente para gestionar recordatorios de WhatsApp. Responde de forma clara y natural.",
          },
          {
            role: "user",
            content: text,
          },
          message,
          ...toolResults,
        ],
      });

      const reply = finalCompletion.choices[0].message.content || "Listo, he procesado tu solicitud.";

      return {
        reply,
        actions: actions.length > 0 ? actions : undefined,
      };
    }
  }

  // Si no hay tool calls, devolver respuesta directa
  return {
    reply: message.content || "No entendí tu solicitud. ¿Puedes reformularla?",
  };
};
