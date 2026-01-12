# Script para ver los logs del último build fallido

Write-Host "🔍 Obteniendo logs del último build..." -ForegroundColor Cyan

$buildId = & "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" builds list --limit=1 --format="value(id)" --project=whatsapp-scheduler-2105b

if ($buildId) {
    Write-Host "Build ID: $buildId" -ForegroundColor Green
    Write-Host ""
    Write-Host "Últimas 100 líneas del log:" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    & "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" builds log $buildId --project=whatsapp-scheduler-2105b | Select-Object -Last 100
} else {
    Write-Host "❌ No se encontró build ID" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ve manualmente a:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/cloud-build/builds?project=whatsapp-scheduler-2105b" -ForegroundColor White
}
