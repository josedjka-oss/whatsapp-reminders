# Script para iniciar la aplicación con PM2

Write-Host "`n🚀 INICIANDO APLICACIÓN CON PM2" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PM2 está instalado
$pm2Instalado = Get-Command pm2 -ErrorAction SilentlyContinue

if (-not $pm2Instalado) {
    Write-Host "❌ PM2 no está instalado" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\INSTALAR-PM2.ps1" -ForegroundColor Yellow
    exit 1
}

# Verificar si dist/ existe
if (-not (Test-Path "dist")) {
    Write-Host "📦 Compilando proyecto..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al compilar" -ForegroundColor Red
        exit 1
    }
}

# Verificar si el proceso ya está corriendo
$proceso = pm2 list | Select-String "whatsapp-reminders"

if ($proceso) {
    Write-Host "⚠️  La aplicación ya está corriendo con PM2" -ForegroundColor Yellow
    Write-Host "¿Deseas reiniciarla? (s/n): " -ForegroundColor Yellow -NoNewline
    $respuesta = Read-Host
    
    if ($respuesta -eq "s" -or $respuesta -eq "S") {
        Write-Host "🔄 Reiniciando aplicación..." -ForegroundColor Yellow
        pm2 restart whatsapp-reminders
    } else {
        Write-Host "✅ Aplicación ya está corriendo" -ForegroundColor Green
        pm2 status
    }
} else {
    Write-Host "▶️  Iniciando aplicación con PM2..." -ForegroundColor Yellow
    pm2 start dist/server.js --name whatsapp-reminders
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Aplicación iniciada exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Estado:" -ForegroundColor Cyan
        pm2 status
        Write-Host ""
        Write-Host "💡 Comandos útiles:" -ForegroundColor Yellow
        Write-Host "   - Ver logs: pm2 logs whatsapp-reminders" -ForegroundColor White
        Write-Host "   - Ver estado: pm2 status" -ForegroundColor White
        Write-Host "   - Reiniciar: pm2 restart whatsapp-reminders" -ForegroundColor White
        Write-Host "   - Detener: pm2 stop whatsapp-reminders" -ForegroundColor White
        Write-Host "   - Guardar: pm2 save" -ForegroundColor White
    } else {
        Write-Host "❌ Error al iniciar aplicación" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
