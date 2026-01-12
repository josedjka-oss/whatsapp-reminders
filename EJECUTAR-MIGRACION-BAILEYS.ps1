# Script para migrar automáticamente a Baileys y desplegar
# Ejecuta este script una vez y hará todo automáticamente

Write-Host "🚀 Iniciando migración a Baileys..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "cloud-run")) {
    Write-Host "❌ Error: No se encuentra el directorio cloud-run" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raíz del proyecto (donde está cloud-run)" -ForegroundColor Yellow
    exit 1
}

# Navegar al directorio cloud-run
Set-Location cloud-run

Write-Host "📝 Actualizando package.json..." -ForegroundColor Cyan

# Crear package.json usando un método más seguro
$packageJson = @'
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
'@

$packageJson | Out-File -FilePath "package.json" -Encoding UTF8 -NoNewline

Write-Host "📝 Actualizando Dockerfile..." -ForegroundColor Cyan

# Crear Dockerfile
$dockerfile = @'
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server-baileys.js"]
'@

$dockerfile | Out-File -FilePath "Dockerfile" -Encoding UTF8 -NoNewline

Write-Host "📝 Verificando server-baileys.ts..." -ForegroundColor Cyan
if (-not (Test-Path "src/server-baileys.ts")) {
    Write-Host "❌ Error: No se encuentra src/server-baileys.ts" -ForegroundColor Red
    Write-Host "El archivo debería existir. Verifica que esté en cloud-run/src/server-baileys.ts" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host "✅ Archivos actualizados" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Desplegando a Cloud Run..." -ForegroundColor Green
Write-Host "Esto puede tardar 5-10 minutos..." -ForegroundColor Yellow
Write-Host ""

# Desplegar a Cloud Run
$deployCommand = "gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1"

try {
    & gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 1Gi --timeout 900 --min-instances 0 --max-instances 1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Despliegue exitoso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Migración a Baileys completada" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Cyan
        Write-Host "1. Ve a: https://whatsapp-scheduler-2105b.web.app" -ForegroundColor White
        Write-Host "2. Haz clic en 'Generar código QR'" -ForegroundColor White
        Write-Host "3. Debería funcionar mucho mejor ahora" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Error en el despliegue. Revisa los mensajes de error arriba." -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error ejecutando el comando de despliegue:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Asegúrate de tener gcloud instalado y autenticado:" -ForegroundColor Yellow
    Write-Host "  gcloud auth login" -ForegroundColor White
}

# Volver al directorio raíz
Set-Location ..
