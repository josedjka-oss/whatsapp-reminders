# Ejemplos de Recordatorios - PowerShell Script

# ============================================
# EJEMPLO 1: Recordatorio Único (Once)
# ============================================
# Enviar un mensaje mañana a las 2:00 PM

$recordatorioOnce = @{
    to = "whatsapp:+573001234567"
    body = "Hola, recordatorio: Reunión importante mañana a las 2 PM"
    scheduleType = "once"
    sendAt = "2025-01-11T14:00:00"
    timezone = "America/Bogota"
} | ConvertTo-Json

Write-Host "Ejemplo 1: Recordatorio Único" -ForegroundColor Cyan
Write-Host "Comando:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioOnce'" -ForegroundColor Gray
Write-Host ""

# ============================================
# EJEMPLO 2: Recordatorio Diario
# ============================================
# Enviar cada día a las 8:00 AM

$recordatorioDiario = @{
    to = "whatsapp:+573001234567"
    body = "Buenos días, que tengas un excelente día ❤️"
    scheduleType = "daily"
    hour = 8
    minute = 0
    timezone = "America/Bogota"
} | ConvertTo-Json

Write-Host "Ejemplo 2: Recordatorio Diario (8:00 AM)" -ForegroundColor Cyan
Write-Host "Comando:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioDiario'" -ForegroundColor Gray
Write-Host ""

# ============================================
# EJEMPLO 3: Recordatorio Mensual
# ============================================
# Enviar el día 5 de cada mes a las 9:00 AM

$recordatorioMensual = @{
    to = "whatsapp:+573001234567"
    body = "Recordatorio mensual: Factura pendiente de pago"
    scheduleType = "monthly"
    dayOfMonth = 5
    hour = 9
    minute = 0
    timezone = "America/Bogota"
} | ConvertTo-Json

Write-Host "Ejemplo 3: Recordatorio Mensual (Día 5, 9:00 AM)" -ForegroundColor Cyan
Write-Host "Comando:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioMensual'" -ForegroundColor Gray
Write-Host ""

# ============================================
# EJEMPLO 4: Recordatorio Diario a las 6:00 PM
# ============================================

$recordatorioTarde = @{
    to = "whatsapp:+573001234567"
    body = "Recordatorio: Revisar correos del día"
    scheduleType = "daily"
    hour = 18
    minute = 0
    timezone = "America/Bogota"
} | ConvertTo-Json

Write-Host "Ejemplo 4: Recordatorio Diario (6:00 PM)" -ForegroundColor Cyan
Write-Host "Comando:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:3000/api/reminders -H 'Content-Type: application/json' -d '$recordatorioTarde'" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "💡 INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Reemplaza 'whatsapp:+573001234567' con el número real" -ForegroundColor White
Write-Host "2. Ajusta las fechas/horas según necesites" -ForegroundColor White
Write-Host "3. Copia y pega el comando en PowerShell" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
