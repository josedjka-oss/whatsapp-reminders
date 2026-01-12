# 🚀 Migración Completa a Baileys - Instrucciones

## ✅ Cambios Realizados:

1. ✅ Creado `server-baileys.ts` - Nueva implementación con Baileys
2. ✅ Actualizado `package.json` - Dependencias de Baileys
3. ✅ Creado `Dockerfile.baileys` - Dockerfile simplificado (sin Chrome)

## 📋 Pasos para Migrar:

### 1. En Cloud Shell, reemplazar server.ts:

```bash
cd ~/whatsapp-cloud-run
```

Luego copia el contenido completo de `server-baileys.ts` que acabo de crear.

### 2. Actualizar package.json:

```bash
cat > package.json << 'EOF'
{
  "name": "whatsapp-cloud-run",
  "version": "1.0.0",
  "description": "WhatsApp service for Cloud Run",
  "main": "dist/server-baileys.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server-baileys.js",
    "dev": "ts-node src/server-baileys.ts"
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
    "typescript": "^5.5.4",
    "ts-node": "^10.9.2"
  },
  "private": true
}
EOF
```

### 3. Actualizar Dockerfile (simplificado, sin Chrome):

```bash
cat > Dockerfile << 'EOF'
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server-baileys.js"]
EOF
```

### 4. Actualizar tsconfig.json (si es necesario):

Asegúrate de que compile `server-baileys.ts`:

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

### 5. Redesplegar:

```bash
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1
```

**Nota:** Reduje la memoria a 1Gi porque Baileys no necesita Chrome, es mucho más ligero.

## 🎯 Ventajas de esta migración:

✅ **Sin Chrome** - No más problemas de Puppeteer
✅ **Más rápido** - Inicia en segundos
✅ **Menos memoria** - 1Gi es suficiente (vs 2Gi)
✅ **Más estable** - Sin errores SIGPIPE
✅ **Mismo comportamiento** - QR, mensajes, todo igual

## 🧪 Después de desplegar:

1. Prueba el endpoint `/health` - Debería responder rápido
2. Prueba `/initialize` - Debería responder inmediatamente
3. Prueba `/status` - Debería mostrar el QR cuando esté listo
4. Prueba desde el frontend - Debería funcionar igual pero mejor

## ⚠️ Si hay errores de compilación:

Verifica que `tsconfig.json` incluya `server-baileys.ts` y que todas las dependencias estén instaladas.
