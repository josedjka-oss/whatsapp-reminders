# 🚀 Comandos Completos para Cloud Shell

## Ejecuta estos comandos UNO POR UNO en Cloud Shell:

### 1. Crear directorio y navegar:

```bash
mkdir -p ~/whatsapp-baileys
cd ~/whatsapp-baileys
```

### 2. Crear package.json:

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

### 3. Crear tsconfig.json:

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

### 4. Crear Dockerfile:

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

### 5. Crear directorio src:

```bash
mkdir -p src
```

### 6. Verificar que se crearon los archivos:

```bash
ls -la
ls -la src/
```

Deberías ver: `package.json`, `tsconfig.json`, `Dockerfile`, y la carpeta `src/`

---

## Ahora crea server.ts usando el Editor:

1. **Abre el Editor de Cloud Shell:**
   - Haz clic en el **ícono de lápiz** (☰) en la parte superior de Cloud Shell
   - O presiona el botón "Open Editor" si está visible

2. **Navega al directorio:**
   - En el panel izquierdo del editor, busca: `home/josedjka/whatsapp-baileys/src/`
   - Si no ves `whatsapp-baileys`, refresca el panel (F5) o navega manualmente

3. **Crear el archivo:**
   - Haz clic derecho en la carpeta `src` (o dentro de ella)
   - Selecciona "New File"
   - Nombra el archivo: `server.ts`

4. **Pegar el contenido:**
   - Abre el archivo `CONTENIDO-SERVER-TS.txt` en tu computadora
   - Selecciona TODO (Ctrl+A) y copia (Ctrl+C)
   - Pégalo en el editor de Cloud Shell (Ctrl+V)

5. **Guardar:**
   - Presiona `Ctrl+S` o haz clic en el ícono de guardar

6. **Verificar:**
   - Cierra el editor
   - En Cloud Shell, ejecuta: `ls -la src/`
   - Deberías ver `server.ts`

---

## Después de crear server.ts, despliega:

```bash
cd ~/whatsapp-baileys
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1
```

---

## ✅ Listo!

Después del despliegue, prueba desde tu aplicación web.
