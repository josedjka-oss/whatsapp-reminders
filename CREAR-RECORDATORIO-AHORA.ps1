# Script para crear recordatorios rápidamente

# ============================================
# OPCIÓN 1: Recordatorio Único (En 5 minutos)
# ============================================
# Calcula fecha/hora 5 minutos desde ahora
$fecha5Minutos = (Get-Date).AddMinutes(5).ToString("yyyy-MM-ddTHH:mm:ss")

$recordatorioPrueba = @{
    to = "whatsapp:+573024002656"
    body = "🧪 Prueba de recordatorio automático - Este mensaje se envió automáticamente"
    scheduleType = "once"
    sendAt = $fecha5Minutos
    timezone = "America/Bogota"
} | ConvertTo-Json -Compress

Write-Host "📅 RECORDATORIO ÚNICO (En 5 minutos)" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fecha/Hora programada: $fecha5Minutos" -ForegroundColor Yellow
Write-Host ""
Write-Host "Comando para crear:" -ForegroundColor White
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioPrueba'" -ForegroundColor Gray
Write-Host ""

# ============================================
# OPCIÓN 2: Recordatorio Diario (8:00 AM)
# ============================================
$recordatorioDiario = @{
    to = "whatsapp:+573024002656"
    body = "☀️ Buenos días - Recordatorio diario automático"
    scheduleType = "daily"
    hour = 8
    minute = 0
    timezone = "America/Bogota"
} | ConvertTo-Json -Compress

Write-Host "📅 RECORDATORIO DIARIO (8:00 AM cada día)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comando para crear:" -ForegroundColor White
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioDiario'" -ForegroundColor Gray
Write-Host ""

# ============================================
# OPCIÓN 3: Recordatorio Mensual (Día 15, 9:00 AM)
# ============================================
$recordatorioMensual = @{
    to = "whatsapp:+573024002656"
    body = "📆 Recordatorio mensual - Factura pendiente"
    scheduleType = "monthly"
    dayOfMonth = 15
    hour = 9
    minute = 0
    timezone = "America/Bogota"
} | ConvertTo-Json -Compress

Write-Host "📅 RECORDATORIO MENSUAL (Día 15, 9:00 AM)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comando para crear:" -ForegroundColor White
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioMensual'" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Elige el tipo de recordatorio que quieres" -ForegroundColor White
Write-Host "2. Copia el comando correspondiente" -ForegroundColor White
Write-Host "3. Pégalo en PowerShell y ejecútalo" -ForegroundColor White
Write-Host "4. El recordatorio se creará automáticamente" -ForegroundColor White
Write-Host ""
