# Script para crear un recordatorio de prueba

# Configuración
$apiUrl = "http://localhost:3000/api/reminders"
$destinatario = "whatsapp:+573024002656"

# Calcular fecha en 5 minutos
$fecha5Minutos = (Get-Date).AddMinutes(5).ToString("yyyy-MM-ddTHH:mm:ss")

# Recordatorio de prueba (una vez, en 5 minutos)
$recordatorio = @{
    to = $destinatario
    body = "🧪 Prueba de recordatorio automático - Este mensaje se envió automáticamente desde la aplicación"
    scheduleType = "once"
    sendAt = $fecha5Minutos
    timezone = "America/Bogota"
}

Write-Host "`n📅 CREANDO RECORDATORIO DE PRUEBA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Detalles:" -ForegroundColor Yellow
Write-Host "   - Tipo: Una vez" -ForegroundColor White
Write-Host "   - Fecha/Hora: $fecha5Minutos" -ForegroundColor White
Write-Host "   - Destinatario: $destinatario" -ForegroundColor White
Write-Host "   - Mensaje: $($recordatorio.body)" -ForegroundColor White
Write-Host ""

try {
    # Convertir a JSON
    $bodyJson = $recordatorio | ConvertTo-Json -Compress
    
    # Hacer request
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $bodyJson -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ ¡Recordatorio creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Detalles del recordatorio:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    Write-Host "⏰ El mensaje se enviará automáticamente en aproximadamente 5 minutos" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "❌ Error al crear el recordatorio:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "💡 Verifica que:" -ForegroundColor Yellow
    Write-Host "   1. El servidor esté corriendo (npm run dev)" -ForegroundColor White
    Write-Host "   2. El puerto 3000 esté disponible" -ForegroundColor White
    Write-Host "   3. La base de datos esté configurada correctamente" -ForegroundColor White
}
