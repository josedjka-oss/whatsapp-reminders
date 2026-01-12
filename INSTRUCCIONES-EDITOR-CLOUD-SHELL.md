# 📝 Instrucciones para Usar el Editor de Cloud Shell

## Paso 1: Crear archivos básicos en Cloud Shell

Ejecuta estos comandos **uno por uno** en Cloud Shell:

```bash
mkdir -p ~/whatsapp-baileys
cd ~/whatsapp-baileys
```

```bash
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
```

```bash
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
```

```bash
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
```

```bash
mkdir -p src
```

---

## Paso 2: Crear server.ts usando el Editor de Cloud Shell

### 2.1. Abre el Editor:
- En Cloud Shell, haz clic en el **ícono de lápiz** (☰) en la parte superior derecha
- O presiona `Ctrl+Shift+P` y busca "Open Editor"

### 2.2. Navega al directorio:
- En el panel izquierdo del editor, navega a: `home/josedjka/whatsapp-baileys/src/`
- Si no existe la carpeta `src`, créala haciendo clic derecho → "New Folder" → `src`

### 2.3. Crear el archivo:
- Haz clic derecho en la carpeta `src`
- Selecciona "New File"
- Nombra el archivo: `server.ts`

### 2.4. Copiar el contenido:
- Abre el archivo `cloud-run/src/server.ts` en tu computadora
- Selecciona TODO el contenido (Ctrl+A)
- Cópialo (Ctrl+C)
- Pégalo en el editor de Cloud Shell (Ctrl+V)

### 2.5. Guardar:
- Presiona `Ctrl+S` o haz clic en el ícono de guardar
- Cierra el editor

---

## Paso 3: Verificar que el archivo existe

En Cloud Shell, ejecuta:

```bash
cd ~/whatsapp-baileys
ls -la src/
```

Deberías ver `server.ts` en la lista.

---

## Paso 4: Desplegar

```bash
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1
```

---

## ✅ Listo!

Después del despliegue, prueba desde tu aplicación web.
