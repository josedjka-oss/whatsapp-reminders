# Script para ejecutar todos los comandos necesarios
# Cambiar política de ejecución solo para esta sesión
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Configurar PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"

Write-Host "Compilando TypeScript..." -ForegroundColor Yellow
cd C:\Users\user\Desktop\WHATS\cloud-run
npm run build

Write-Host "Habilitando APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

Write-Host "Desplegando a Cloud Run (esto puede tardar 5-10 minutos)..." -ForegroundColor Yellow
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1

Write-Host ""
Write-Host "Despliegue completado! Copia la URL que aparece arriba." -ForegroundColor Green
