#!/bin/bash
# Script para actualizar server.ts en Cloud Shell

cd ~/whatsapp-cloud-run

cat > src/server.ts << 'EOFSERVER'
import express from "express";
import cors from "cors";
import { Client, LocalAuth } from "whatsapp-web.js";
// @ts-ignore
import * as qrcode from "qrcode-terminal";

const app = express();
app.use(cors());
app.use(express.json());

let whatsappClient: Client | null = null;
let qrCodeString: string | null = null;
let isConnected = false;
let isInitializing = false;

const initializeWhatsAppClient = async () => {
  // Si ya está inicializado y conectado, retornar
  if (whatsappClient && whatsappClient.info && isConnected) {
    return whatsappClient;
  }

  // Si ya se está inicializando, esperar
  if (isInitializing) {
    let attempts = 0;
    while (isInitializing && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      if (whatsappClient && whatsappClient.info) break;
    }
    if (whatsappClient) return whatsappClient;
  }

  isInitializing = true;

  try {
    // Verificar que Chrome esté disponible
    const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable";
    console.log("Configurando Puppeteer con Chrome en:", chromePath);
    
    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: "/tmp/.whatsapp-session",
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--disable-software-rasterizer",
          "--disable-extensions",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-breakpad",
          "--disable-client-side-phishing-detection",
          "--disable-default-apps",
          "--disable-hang-monitor",
          "--disable-popup-blocking",
          "--disable-prompt-on-repost",
          "--disable-sync",
          "--disable-translate",
          "--metrics-recording-only",
          "--no-default-browser-check",
          "--safebrowsing-disable-auto-update",
          "--enable-automation",
          "--password-store=basic",
          "--use-mock-keychain",
        ],
        timeout: 60000,
        ignoreHTTPSErrors: true,
        executablePath: chromePath,
      },
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html",
      },
    });

    whatsappClient.on("qr", (qr) => {
      qrCodeString = qr;
      qrcode.generate(qr, { small: true });
      console.log("QR Code generated");
      isInitializing = false;
    });

    whatsappClient.on("ready", () => {
      isConnected = true;
      qrCodeString = null;
      isInitializing = false;
      console.log("WhatsApp client is ready!");
    });

    whatsappClient.on("authenticated", () => {
      isConnected = true;
      qrCodeString = null;
      isInitializing = false;
      console.log("WhatsApp authenticated");
    });

    whatsappClient.on("auth_failure", (msg) => {
      isConnected = false;
      isInitializing = false;
      console.error("Authentication failure:", msg);
    });

    whatsappClient.on("disconnected", (reason) => {
      isConnected = false;
      isInitializing = false;
      console.log("WhatsApp disconnected:", reason);
      whatsappClient = null;
    });

    whatsappClient.on("loading_screen", (percent, message) => {
      console.log(`Loading: ${percent}% - ${message}`);
    });

    return whatsappClient;
  } catch (error: any) {
    isInitializing = false;
    console.error("Error creating WhatsApp client:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    if (error.message) {
      console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    throw error;
  }
};

// Endpoint para inicializar WhatsApp y obtener QR
app.post("/initialize", async (req, res) => {
  try {
    console.log("Iniciando initializeWhatsApp...");

    // Si ya está conectado, retornar
    if (whatsappClient && whatsappClient.info && isConnected) {
      console.log("Cliente ya conectado");
      return res.json({
        qr: null,
        connected: true,
      });
    }

    // Si hay QR pendiente, retornarlo
    if (qrCodeString) {
      console.log("QR ya generado");
      return res.json({
        qr: qrCodeString,
        connected: false,
      });
    }

    // Crear cliente si no existe
    if (!whatsappClient) {
      console.log("Creando nuevo cliente...");
      await initializeWhatsAppClient();
    }

    const client = whatsappClient!;

    // Si no está inicializado, inicializar
    if (!client.info) {
      console.log("Inicializando cliente...");
      try {
        // Inicializar y capturar errores
        const initPromise = client.initialize();
        
        // Capturar errores de inicialización
        initPromise.catch((err: any) => {
          console.error("Error en initialize:", err);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        });

        // Esperar hasta 50 segundos para que se genere el QR
        let waited = 0;
        const maxWait = 50;
        while (waited < maxWait && !qrCodeString && !isConnected) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          waited++;
          if (waited % 10 === 0) {
            console.log(`Esperando QR... ${waited}/${maxWait} segundos`);
          }
        }
        
        // Si después de esperar no hay QR, verificar si hubo error
        if (!qrCodeString && !isConnected) {
          try {
            await Promise.race([
              initPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout esperando QR")), 5000)
              ),
            ]);
          } catch (timeoutError: any) {
            console.error("Timeout o error esperando QR:", timeoutError.message);
          }
        }
      } catch (initError: any) {
        console.error("Error en client.initialize():", initError);
        console.error("Error message:", initError.message);
        console.error("Error stack:", initError.stack);
      }
    }

    console.log(`Estado final: connected=${isConnected}, qr=${!!qrCodeString}`);

    // Retornar resultado
    if (isConnected) {
      return res.json({
        qr: null,
        connected: true,
      });
    }

    if (qrCodeString) {
      return res.json({
        qr: qrCodeString,
        connected: false,
      });
    }

    // Si no hay QR ni conexión, puede que esté en proceso
    return res.json({
      qr: null,
      connected: false,
      message: "Inicializando... Por favor intenta de nuevo en unos segundos",
    });
  } catch (error: any) {
    console.error("Error initializing WhatsApp:", error);
    console.error("Error stack:", error.stack);
    isInitializing = false;

    return res.status(500).json({
      qr: null,
      connected: false,
      error: error.message || "Error desconocido al inicializar WhatsApp",
    });
  }
});

// Endpoint para obtener estado
app.get("/status", async (req, res) => {
  try {
    if (whatsappClient && whatsappClient.info && isConnected) {
      return res.json({
        connected: true,
        qr: null,
      });
    }

    if (qrCodeString) {
      return res.json({
        connected: false,
        qr: qrCodeString,
      });
    }

    return res.json({
      connected: false,
      qr: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Error al obtener estado",
    });
  }
});

// Endpoint para enviar mensaje
app.post("/send-message", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: "phoneNumber y message son requeridos",
      });
    }

    if (!whatsappClient || !whatsappClient.info || !isConnected) {
      return res.status(400).json({
        error: "WhatsApp no está conectado",
      });
    }

    // Formatear número de teléfono (eliminar caracteres no numéricos excepto +)
    const formattedNumber = phoneNumber.replace(/[^\d+]/g, "");

    // Enviar mensaje
    const result = await whatsappClient.sendMessage(
      `${formattedNumber}@c.us`,
      message
    );

    return res.json({
      success: true,
      messageId: result.id._serialized,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      error: error.message || "Error al enviar mensaje",
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor WhatsApp escuchando en puerto ${PORT}`);
});
EOFSERVER

echo "✅ Archivo server.ts actualizado"
echo "Ahora ejecuta: gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1"
