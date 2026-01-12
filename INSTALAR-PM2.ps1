# Script para instalar y configurar PM2

Write-Host "`n🛡️ INSTALACIÓN DE PM2 - Process Manager" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PM2 ya está instalado
$pm2Instalado = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2Instalado) {
    Write-Host "✅ PM2 ya está instalado" -ForegroundColor Green
    pm2 --version
} else {
    Write-Host "📦 Instalando PM2 globalmente..." -ForegroundColor Yellow
    npm install -g pm2
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PM2 instalado exitosamente" -ForegroundColor Green
        pm2 --version
    } else {
        Write-Host "❌ Error instalando PM2" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Compila el proyecto: npm run build" -ForegroundColor White
Write-Host "2. Inicia con PM2: pm2 start dist/server.js --name whatsapp-reminders" -ForegroundColor White
Write-Host "3. Ver estado: pm2 status" -ForegroundColor White
Write-Host "4. Ver logs: pm2 logs whatsapp-reminders" -ForegroundColor White
Write-Host "5. Guardar configuración: pm2 save" -ForegroundColor White
Write-Host "6. Iniciar al arrancar sistema: pm2 startup" -ForegroundColor White
Write-Host ""
