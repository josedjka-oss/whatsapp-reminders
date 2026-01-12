# Script para configurar el PATH con Node.js y Firebase CLI

Write-Host "Configurando PATH..." -ForegroundColor Yellow

# Agregar Node.js al PATH
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    $env:Path = "$nodePath;$env:Path"
    Write-Host "Node.js agregado al PATH" -ForegroundColor Green
}

# Agregar npm global al PATH
$npmPath = "$env:APPDATA\npm"
if (Test-Path $npmPath) {
    $env:Path = "$npmPath;$env:Path"
    Write-Host "npm global agregado al PATH" -ForegroundColor Green
}

# Verificar Firebase CLI
Write-Host "`nVerificando Firebase CLI..." -ForegroundColor Yellow
$firebaseCmd = "$env:APPDATA\npm\firebase.cmd"
if (Test-Path $firebaseCmd) {
    $firebaseVersion = & $firebaseCmd --version
    Write-Host "Firebase CLI encontrado: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "Firebase CLI no encontrado" -ForegroundColor Red
}

Write-Host "`nPATH configurado para esta sesion" -ForegroundColor Green
Write-Host "`nAhora puedes ejecutar: firebase login" -ForegroundColor Cyan
