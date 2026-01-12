# 🔄 Actualizar y Redesplegar en Cloud Shell

## Pasos para actualizar el código con mejor logging:

### 1. En Cloud Shell, ejecuta este comando:

```bash
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
  if (whatsappClient && whatsappClient.info && isConnected) {
    return whatsappClient;
  }

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

app.post("/initialize", async (req, res) => {
  try {
    console.log("Iniciando initializeWhatsApp...");

    if (whatsappClient && whatsappClient.info && isConnected) {
      console.log("Cliente ya conectado");
      return res.json({
        qr: null,
        connected: true,
      });
    }

    if (qrCodeString) {
      console.log("QR ya generado");
      return res.json({
        qr: qrCodeString,
        connected: false,
      });
    }

    if (!whatsappClient) {
      console.log("Creando nuevo cliente...");
      await initializeWhatsAppClient();
    }

    const client = whatsappClient!;

    if (!client.info) {
      console.log("Inicializando cliente...");
      try {
        const initPromise = client.initialize();
        
        initPromise.catch((err: any) => {
          console.error("Error en initialize:", err);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        });

        let waited = 0;
        const maxWait = 50;
        while (waited < maxWait && !qrCodeString && !isConnected) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          waited++;
          if (waited % 10 === 0) {
            console.log(`Esperando QR... ${waited}/${maxWait} segundos`);
          }
        }
        
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

    const formattedNumber = phoneNumber.replace(/[^\d+]/g, "");

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

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor WhatsApp escuchando en puerto ${PORT}`);
});
EOFSERVER
```

### 2. Luego redesplegar:

```bash
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

### 3. Después de redesplegar, prueba de nuevo y revisa los logs

Los logs ahora mostrarán más detalles sobre cualquier error que ocurra.
