# Script alternativo para instalar Google Cloud SDK usando chocolatey o winget
Write-Host "Instalando Google Cloud SDK (metodo alternativo)..." -ForegroundColor Green
Write-Host ""

# Verificar si winget esta disponible
$wingetAvailable = Get-Command winget -ErrorAction SilentlyContinue

if ($wingetAvailable) {
    Write-Host "Usando winget para instalar..." -ForegroundColor Yellow
    try {
        winget install Google.CloudSDK
        Write-Host ""
        Write-Host "Instalacion completada con winget!" -ForegroundColor Green
        Write-Host "Cierra y vuelve a abrir PowerShell" -ForegroundColor Yellow
    } catch {
        Write-Host "Error con winget. Usa la descarga manual." -ForegroundColor Red
    }
} else {
    Write-Host "winget no esta disponible." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor descarga manualmente desde:" -ForegroundColor Cyan
    Write-Host "https://cloud.google.com/sdk/docs/install" -ForegroundColor White
    Write-Host ""
    Write-Host "Pasos:" -ForegroundColor Yellow
    Write-Host "1. Descarga el instalador" -ForegroundColor White
    Write-Host "2. Agrega exclusion en tu antivirus" -ForegroundColor White
    Write-Host "3. Ejecuta el instalador" -ForegroundColor White
    Write-Host "4. Marca 'Add to PATH' durante la instalacion" -ForegroundColor White
    Write-Host "5. Cierra y vuelve a abrir PowerShell" -ForegroundColor White
}
