#!/bin/bash
# Script completo para crear y desplegar Baileys en Cloud Shell

echo "🚀 Creando proyecto Baileys en Cloud Shell..."

# Crear directorio
mkdir -p ~/whatsapp-baileys
cd ~/whatsapp-baileys

# Crear package.json
echo "📝 Creando package.json..."
cat > package.json << 'EOFPKG'
{
  "name": "whatsapp-cloud-run",
  "version": "1.0.0",
  "description": "WhatsApp service for Cloud Run",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@whiskeysockets/baileys": "^6.7.8",
    "@hapi/boom": "^10.0.1",
    "qrcode": "^1.5.3",
    "pino": "^8.17.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.12",
    "@types/cors": "^2.8.17",
    "@types/qrcode": "^1.5.5",
    "typescript": "^5.5.4"
  },
  "private": true
}
EOFPKG

# Crear tsconfig.json
echo "📝 Creando tsconfig.json..."
cat > tsconfig.json << 'EOFTS'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOFTS

# Crear Dockerfile
echo "📝 Creando Dockerfile..."
cat > Dockerfile << 'EOFDOCKER'
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]
EOFDOCKER

# Crear directorio src
mkdir -p src

# Crear server.ts
echo "📝 Creando server.ts..."
cat > src/server.ts << 'EOFSERVER'
import express from "express";
import cors from "cors";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode";
import pino from "pino";

const app = express();
app.use(cors());
app.use(express.json());

let socket: WASocket | null = null;
let qrCodeString: string | null = null;
let isConnected = false;
let isInitializing = false;

const initializeWhatsApp = async () => {
  if (socket && socket.user) {
    isConnected = true;
    return socket;
  }

  if (isInitializing) {
    let attempts = 0;
    while (isInitializing && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      if (socket && socket.user) break;
    }
    if (socket) return socket;
  }

  isInitializing = true;

  try {
    console.log("Inicializando Baileys...");

    const { state, saveCreds } = await useMultiFileAuthState("/tmp/.whatsapp-session");

    socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
    });

    socket.ev.on("creds.update", saveCreds);

    socket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcode.toDataURL(qr)
          .then((url) => {
            qrCodeString = url;
            console.log("QR Code generated");
            isInitializing = false;
          })
          .catch((err) => {
            console.error("Error generando QR:", err);
          });
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(
          "Conexión cerrada debido a",
          lastDisconnect?.error,
          ", reconectando:",
          shouldReconnect
        );

        isConnected = false;
        qrCodeString = null;
        isInitializing = false;
        socket = null;

        if (shouldReconnect) {
          setTimeout(() => {
            initializeWhatsApp().catch(console.error);
          }, 3000);
        }
      } else if (connection === "open") {
        console.log("WhatsApp conectado!");
        isConnected = true;
        qrCodeString = null;
        isInitializing = false;
      }
    });

    return socket;
  } catch (error: any) {
    isInitializing = false;
    console.error("Error inicializando Baileys:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

app.post("/initialize", async (req, res) => {
  try {
    console.log("POST /initialize llamado");

    if (socket && socket.user && isConnected) {
      console.log("Ya conectado");
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

    console.log("Iniciando WhatsApp...");
    initializeWhatsApp().catch((err) => {
      console.error("Error en initializeWhatsApp:", err);
    });

    return res.json({
      qr: null,
      connected: false,
      message: "Inicializando... Usa /status para verificar el progreso",
    });
  } catch (error: any) {
    console.error("Error en /initialize:", error);
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
    if (socket && socket.user && isConnected) {
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

    if (!socket || !socket.user || !isConnected) {
      return res.status(400).json({
        error: "WhatsApp no está conectado",
      });
    }

    const formattedNumber = phoneNumber.replace(/[^\d+]/g, "");
    const jid = `${formattedNumber.replace(/^\+/, "")}@s.whatsapp.net`;

    const result = await socket.sendMessage(jid, { text: message });

    return res.json({
      success: true,
      messageId: result.key.id,
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
  console.log(`Servidor WhatsApp (Baileys) escuchando en puerto ${PORT}`);
});
EOFSERVER

echo ""
echo "✅ Archivos creados"
echo ""
echo "🚀 Desplegando a Cloud Run..."
echo "Esto puede tardar 5-10 minutos..."
echo ""

gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1

echo ""
echo "✅ ¡Despliegue completado!"
echo ""
echo "Próximos pasos:"
echo "1. Ve a: https://whatsapp-scheduler-2105b.web.app"
echo "2. Haz clic en 'Generar código QR'"
echo "3. Debería funcionar mucho mejor ahora"
