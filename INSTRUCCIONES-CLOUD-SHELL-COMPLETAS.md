# 🚀 Instrucciones Completas para Cloud Shell

## Paso 1: Crear estructura y archivos básicos

Ejecuta este comando completo en Cloud Shell:

```bash
mkdir -p ~/whatsapp-cloud-run/src && cd ~/whatsapp-cloud-run && \
cat > package.json << 'EOF'
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
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.12",
    "@types/cors": "^2.8.17",
    "typescript": "^5.5.4"
  },
  "private": true
}
EOF
```

## Paso 2: Crear tsconfig.json

```bash
cat > tsconfig.json << 'EOF'
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
EOF
```

## Paso 3: Crear Dockerfile

```bash
cat > Dockerfile << 'EOF'
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
    libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
    libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 lsb-release xdg-utils \
    && rm -rf /var/lib/apt/lists/*

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8080
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
CMD ["node", "dist/server.js"]
EOF
```

## Paso 4: Crear src/server.ts usando el Editor

1. Haz clic en el **ícono de lápiz** (arriba en Cloud Shell) para abrir el editor
2. Crea un nuevo archivo: `whatsapp-cloud-run/src/server.ts`
3. Copia el contenido completo del archivo `cloud-run/src/server.ts` de tu proyecto local
4. Guarda el archivo

## Paso 5: Desplegar

```bash
cd ~/whatsapp-cloud-run
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## ⏱️ El despliegue tardará 5-10 minutos

Al finalizar, copia la URL que aparece.
