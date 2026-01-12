# Script simple para crear recordatorio
$apiUrl = "http://localhost:3000/api/reminders"
$fecha5Minutos = (Get-Date).AddMinutes(5).ToString("yyyy-MM-ddTHH:mm:ss")

$json = @"
{
  "to": "whatsapp:+573024002656",
  "body": "Prueba de recordatorio automatico - Este mensaje se envio automaticamente",
  "scheduleType": "once",
  "sendAt": "$fecha5Minutos",
  "timezone": "America/Bogota"
}
"@

Write-Host "Creando recordatorio..." -ForegroundColor Cyan
Write-Host "Fecha programada: $fecha5Minutos" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $json -ContentType "application/json"
    Write-Host "Recordatorio creado exitosamente!" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Se enviara en: $($response.sendAt)" -ForegroundColor Yellow
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
