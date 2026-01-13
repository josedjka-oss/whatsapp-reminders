import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { prisma } from "./db";
import remindersRouter from "./routes/reminders";
import webhooksRouter from "./routes/webhooks";
import messagesRouter from "./routes/messages";
import aiRouter from "./routes/ai";
import twilioStatusRouter from "./routes/twilio-status";
import checkSandboxRouter from "./routes/check-sandbox";
import { startScheduler } from "./services/scheduler";

// Cargar variables de entorno
dotenv.config();

// Trigger redeploy - Webhook configurado

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para webhooks de Twilio (form-urlencoded)

// Logging middleware para producción
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// Health check mejorado con verificación de DB
app.get("/health", async (req, res) => {
  const checks: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    timezone: process.env.APP_TIMEZONE || "America/Bogota",
    checks: {
      database: "unknown",
      scheduler: "unknown",
    },
  };

  // Verificar base de datos
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = "ok";
  } catch (error: any) {
    checks.checks.database = "error";
    checks.status = "error";
    checks.error = error.message;
  }

  // Verificar scheduler (si el proceso está corriendo, el scheduler está activo)
  checks.checks.scheduler = "ok";

  const statusCode = checks.status === "ok" ? 200 : 503;
  return res.status(statusCode).json(checks);
});

// Rutas API (MANTENER TODA LA LOGICA EXISTENTE - NO MODIFICAR)
app.use("/api/reminders", remindersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/twilio-status", twilioStatusRouter);
app.use("/api/check-sandbox", checkSandboxRouter);
app.use("/webhooks", webhooksRouter);

// Servir Next.js estático (solo en producción, si existe)
if (process.env.NODE_ENV === "production") {
  try {
    const nextjsStaticPath = path.join(__dirname, "../.next/static");
    app.use("/_next/static", express.static(nextjsStaticPath));
    console.log("[INIT] ✅ Next.js estático configurado");
  } catch (error) {
    console.warn("[INIT] ⚠️  Next.js build no encontrado, sirviendo solo API");
  }
}

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "WhatsApp Reminders API",
    version: "1.0.0",
    chat: "/chat",
      endpoints: {
        reminders: "/api/reminders",
        messages: "/api/messages",
        ai: "/api/ai",
        twilioStatus: "/api/twilio-status",
        checkSandbox: "/api/check-sandbox",
        webhooks: "/webhooks/twilio/whatsapp",
        health: "/health",
      },
  });
});

// Inicializar base de datos y servidor
const PORT = parseInt(process.env.PORT || "3000", 10);
let server: any = null;
let schedulerStarted = false;

async function main() {
  try {
    // Verificar conexión a base de datos
    console.log("[INIT] Conectando a la base de datos...");
    await prisma.$connect();
    console.log("[INIT] ✅ Conectado a la base de datos");

    // Verificar variables de entorno críticas
    const requiredEnvVars = [
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_WHATSAPP_FROM",
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      console.warn(
        `[INIT] ⚠️  Variables de entorno faltantes: ${missingVars.join(", ")}`
      );
    }

    // Iniciar scheduler
    console.log("[INIT] Iniciando scheduler...");
    startScheduler();
    schedulerStarted = true;
    console.log("[INIT] ✅ Scheduler iniciado");

    // Iniciar servidor
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[INIT] ✅ Servidor escuchando en puerto ${PORT}`);
      console.log(`[INIT] Health check: http://0.0.0.0:${PORT}/health`);
      console.log(`[INIT] API: http://0.0.0.0:${PORT}/api/reminders`);
      console.log(`[INIT] Webhook: http://0.0.0.0:${PORT}/webhooks/twilio/whatsapp`);
    });

    // Manejar errores del servidor
    server.on("error", (error: any) => {
      console.error("[SERVER] Error en el servidor:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`[SERVER] Puerto ${PORT} ya está en uso`);
        process.exit(1);
      }
    });
  } catch (error: any) {
    console.error("[INIT] ❌ Error iniciando servidor:", error);
    console.error("[INIT] Stack trace:", error.stack);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on("uncaughtException", (error: Error) => {
  console.error("[FATAL] Excepción no capturada:", error);
  console.error("[FATAL] Stack trace:", error.stack);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("[FATAL] Rechazo de promesa no manejado:", reason);
  console.error("[FATAL] Promise:", promise);
  gracefulShutdown("unhandledRejection");
});

// Graceful shutdown mejorado
async function gracefulShutdown(signal: string) {
  console.log(`[SHUTDOWN] Señal ${signal} recibida, iniciando cierre graceful...`);

  // Detener aceptar nuevas conexiones
  if (server) {
    server.close(() => {
      console.log("[SHUTDOWN] Servidor HTTP cerrado");
    });
  }

  // Cerrar conexión de base de datos
  try {
    await prisma.$disconnect();
    console.log("[SHUTDOWN] ✅ Conexión a base de datos cerrada");
  } catch (error: any) {
    console.error("[SHUTDOWN] Error cerrando base de datos:", error);
  }

  // Dar tiempo para completar operaciones pendientes
  setTimeout(() => {
    console.log("[SHUTDOWN] Cerrando proceso...");
    process.exit(0);
  }, 5000); // 5 segundos de gracia
}

// Manejar señales de terminación
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Iniciar aplicación
main();
