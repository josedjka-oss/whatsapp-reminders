/**
 * Servidor que integra Express (backend) con Next.js (frontend)
 * 
 * En producción, Next.js se compila y se sirve desde Express.
 * En desarrollo, Next.js corre por separado en puerto 3001.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { prisma } from "./db";
import remindersRouter from "./routes/reminders";
import webhooksRouter from "./routes/webhooks";
import messagesRouter from "./routes/messages";
import aiRouter from "./routes/ai";
import { startScheduler } from "./services/scheduler";
import next from "next";

// Cargar variables de entorno
dotenv.config();

const isDev = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT || "3000", 10);

// Inicializar Next.js
// __dirname apunta a dist/ después de compilar, necesitamos la raíz del proyecto
const projectRoot = path.join(__dirname, "..");
const nextApp = next({ dev: isDev, dir: projectRoot });
const nextHandler = nextApp.getRequestHandler();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
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

// Health check
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

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = "ok";
  } catch (error: any) {
    checks.checks.database = "error";
    checks.status = "error";
    checks.error = error.message;
  }

  checks.checks.scheduler = "ok";
  const statusCode = checks.status === "ok" ? 200 : 503;
  return res.status(statusCode).json(checks);
});

// Rutas API (antes de Next.js para que tengan prioridad)
// IMPORTANTE: Estas rutas NO se modifican, mantienen toda la lógica existente
app.use("/api/reminders", remindersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/ai", aiRouter);
app.use("/webhooks", webhooksRouter);

// Preparar Next.js
nextApp.prepare().then(() => {
  // Todas las demás rutas van a Next.js
  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  // Inicializar servidor
  async function main() {
    try {
      console.log("[INIT] Conectando a la base de datos...");
      await prisma.$connect();
      console.log("[INIT] ✅ Conectado a la base de datos");

      console.log("[INIT] Iniciando scheduler...");
      startScheduler();
      console.log("[INIT] ✅ Scheduler iniciado");

      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`[INIT] ✅ Servidor escuchando en puerto ${PORT}`);
        console.log(`[INIT] Health check: http://0.0.0.0:${PORT}/health`);
        console.log(`[INIT] Chat: http://0.0.0.0:${PORT}/chat`);
        console.log(`[INIT] API: http://0.0.0.0:${PORT}/api/reminders`);
      });

      server.on("error", (error: any) => {
        console.error("[SERVER] Error:", error);
        if (error.code === "EADDRINUSE") {
          console.error(`[SERVER] Puerto ${PORT} ya está en uso`);
          process.exit(1);
        }
      });
    } catch (error: any) {
      console.error("[INIT] ❌ Error:", error);
      process.exit(1);
    }
  }

  // Manejo de errores
  process.on("uncaughtException", (error: Error) => {
    console.error("[FATAL] Excepción no capturada:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason: any) => {
    console.error("[FATAL] Rechazo no manejado:", reason);
    gracefulShutdown("unhandledRejection");
  });

  async function gracefulShutdown(signal: string) {
    console.log(`[SHUTDOWN] Señal ${signal} recibida...`);
    try {
      await prisma.$disconnect();
      console.log("[SHUTDOWN] ✅ Base de datos cerrada");
    } catch (error) {
      console.error("[SHUTDOWN] Error:", error);
    }
    setTimeout(() => process.exit(0), 5000);
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  main();
}).catch((error) => {
  console.error("[NEXT] Error preparando Next.js:", error);
  process.exit(1);
});
