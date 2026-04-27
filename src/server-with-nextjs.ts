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

// Health check (el balanceador pide /health en cuanto levanta el proceso: debe responder
// sin esperar a Next.js; si la DB aún no conecta, 200 "degraded" evita cierre por 503)
app.get("/health", async (req, res) => {
  const checks: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    timezone: process.env.APP_TIMEZONE || "America/Bogota",
    checks: {
      database: "unknown",
      scheduler: "ok",
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = "ok";
  } catch (error: any) {
    checks.checks.database = "error";
    checks.databaseError = error.message;
    // Liveness: el despliegue (Render, etc.) no debe matar el contenedor mientras la DB
    // aún inicia; /health/ready (si se usa) puede exigir DB.
    if (error?.code === "P1001" || String(error?.message ?? "").includes("Can't reach")) {
      checks.status = "degraded";
    } else {
      checks.status = "error";
    }
  }

  const statusCode = checks.status === "error" ? 503 : 200;
  return res.status(statusCode).json(checks);
});

// Rutas API (antes de Next.js para que tengan prioridad)
// IMPORTANTE: Estas rutas NO se modifican, mantienen toda la lógica existente
app.use("/api/reminders", remindersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/ai", aiRouter);
app.use("/webhooks", webhooksRouter);

// Importante: abrir el puerto ANTES de nextApp.prepare(). Si prepare() tarda, el
// health check de la plataforma (p. ej. :10000/health) no debe recibir "connection refused".

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

process.on("uncaughtException", (error: Error) => {
  console.error("[FATAL] Excepción no capturada:", error);
  void gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[FATAL] Rechazo no manejado:", reason);
  void gracefulShutdown("unhandledRejection");
});

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));

async function main() {
  try {
    app
      .listen(PORT, "0.0.0.0", () => {
        console.log(`[INIT] ✅ Servidor escuchando en 0.0.0.0:${PORT} (API y /health listos; Next se enlaza al terminar prepare)`);
        console.log(`[INIT] Health check: http://0.0.0.0:${PORT}/health`);
      })
      .on("error", (error: NodeJS.ErrnoException) => {
      console.error("[SERVER] Error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`[SERVER] Puerto ${PORT} ya está en uso`);
        process.exit(1);
      }
    });

    console.log("[INIT] Conectando a la base de datos...");
    try {
      await prisma.$connect();
      console.log("[INIT] ✅ Conectado a la base de datos");
    } catch (dbError: any) {
      console.error("[INIT] ⚠️  DB aún no disponible, el proceso sigue (revisa DATABASE_URL):", dbError?.message);
    }

    try {
      startScheduler();
      console.log("[INIT] ✅ Scheduler iniciado");
    } catch (schedError: any) {
      console.error("[INIT] ❌ Error scheduler:", schedError);
    }

    nextApp
      .prepare()
      .then(() => {
        app.all("*", (req, res) => nextHandler(req, res));
        console.log(`[INIT] ✅ Next.js listo: rutas /chat, etc.`);
      })
      .catch((err: unknown) => {
        console.error("[NEXT] Error preparando Next.js (API y /health siguen activos):", err);
      });
  } catch (error: unknown) {
    console.error("[INIT] ❌ Error:", error);
    process.exit(1);
  }
}

void main();
