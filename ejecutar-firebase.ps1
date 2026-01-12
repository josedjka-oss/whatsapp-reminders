# Script para ejecutar Firebase con PATH configurado

# Configurar PATH
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path

# Cambiar al directorio del proyecto
Set-Location "C:\Users\user\Desktop\WHATS"

Write-Host "PATH configurado. Ejecutando Firebase..." -ForegroundColor Green
Write-Host ""

# Ejecutar el comando que se pase como argumento
if ($args.Count -gt 0) {
    $command = $args -join " "
    Invoke-Expression "firebase $command"
} else {
    Write-Host "Uso: .\ejecutar-firebase.ps1 login" -ForegroundColor Yellow
    Write-Host "     .\ejecutar-firebase.ps1 init" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ejecutando firebase --version para verificar..." -ForegroundColor Cyan
    firebase --version
}
