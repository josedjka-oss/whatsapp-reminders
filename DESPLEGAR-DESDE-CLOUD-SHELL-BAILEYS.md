# 🚀 Desplegar Baileys desde Cloud Shell

## El build está fallando desde PowerShell

Vamos a desplegar directamente desde Cloud Shell donde el entorno está más controlado.

## Pasos:

### 1. Abre Cloud Shell:
https://shell.cloud.google.com/?project=whatsapp-scheduler-2105b

### 2. Sube los archivos necesarios:

En Cloud Shell, ejecuta estos comandos:

```bash
# Crear directorio
mkdir -p ~/whatsapp-baileys
cd ~/whatsapp-baileys

# Crear package.json
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
```

### 3. Subir server.ts:

Necesitas copiar el contenido de `cloud-run/src/server.ts` desde tu computadora y pegarlo en Cloud Shell:

```bash
# En Cloud Shell, crear el archivo
nano src/server.ts
# O usar el editor de Cloud Shell (ícono de lápiz)
```

Luego pega el contenido completo del archivo `cloud-run/src/server.ts` de tu computadora.

### 4. Desplegar:

```bash
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1
```

## Alternativa más fácil:

Si prefieres, puedo darte el contenido completo de `server.ts` para que lo copies directamente en Cloud Shell.

¿Quieres que te dé el contenido completo del archivo para copiarlo en Cloud Shell?
