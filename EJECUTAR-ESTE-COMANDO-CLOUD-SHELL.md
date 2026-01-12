# 🚀 Ejecutar en Cloud Shell - Comando Completo

## ⚠️ NO pegues el código directamente en la terminal

Necesitas ejecutar un **script** que crea el archivo automáticamente.

## 📋 Pasos:

### 1. Abre Cloud Shell:
https://shell.cloud.google.com/?project=whatsapp-scheduler-2105b

### 2. Copia y pega este comando COMPLETO (todo de una vez):

```bash
mkdir -p ~/whatsapp-baileys && cd ~/whatsapp-baileys && cat > package.json << 'EOFPKG'
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
mkdir -p src
```

### 3. Luego ejecuta este otro comando para crear server.ts:

**IMPORTANTE:** Este comando es MUY LARGO. Cópialo completo desde `cat > src/server.ts` hasta el último `EOFSERVER`

El archivo `EJECUTAR-EN-CLOUD-SHELL-COMPLETO.sh` tiene el contenido completo. 

**O mejor aún:** Usa el editor de Cloud Shell (ícono de lápiz) para crear el archivo `src/server.ts` y pega el contenido de `cloud-run/src/server.ts` de tu computadora.

### 4. Después de crear todos los archivos, despliega:

```bash
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1
```

## 🎯 Método más fácil:

1. Crea los archivos básicos (package.json, tsconfig.json, Dockerfile) con los comandos del paso 2
2. Usa el **editor de Cloud Shell** (ícono de lápiz) para crear `src/server.ts`
3. Copia el contenido de `cloud-run/src/server.ts` desde tu computadora
4. Pégalo en el editor de Cloud Shell
5. Guarda el archivo
6. Ejecuta el comando de despliegue del paso 4
