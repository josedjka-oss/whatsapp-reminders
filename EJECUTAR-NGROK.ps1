# Script para ejecutar ngrok con política de ejecución temporal

# Cambiar política de ejecución solo para esta sesión
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Ejecutar ngrok
Write-Host "🔗 Iniciando ngrok..." -ForegroundColor Cyan
Write-Host "⚠️  No cierres esta ventana mientras ngrok esté corriendo" -ForegroundColor Yellow
Write-Host "`n"

npx ngrok http 3000
