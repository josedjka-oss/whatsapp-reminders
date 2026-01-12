# Script de verificación de instalación
# Ejecuta este script para verificar que todo esté configurado correctamente

Write-Host "=== Verificación de Instalación ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js NO está instalado" -ForegroundColor Red
    Write-Host "   Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm NO está instalado" -ForegroundColor Red
    exit 1
}

# Verificar Firebase CLI
Write-Host "3. Verificando Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "   ✓ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Firebase CLI NO está instalado" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm install -g firebase-tools" -ForegroundColor Yellow
}

# Verificar dependencias del proyecto
Write-Host "4. Verificando dependencias del proyecto..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Dependencias del frontend NO instaladas" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm install" -ForegroundColor Yellow
}

if (Test-Path "functions\node_modules") {
    Write-Host "   ✓ Dependencias de Functions instaladas" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Dependencias de Functions NO instaladas" -ForegroundColor Yellow
    Write-Host "   Ejecuta: cd functions && npm install" -ForegroundColor Yellow
}

# Verificar archivo .env.local
Write-Host "5. Verificando archivo .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✓ Archivo .env.local existe" -ForegroundColor Green
    
    # Verificar que tenga contenido
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_FIREBASE_API_KEY") {
        Write-Host "   ✓ Archivo .env.local tiene configuración" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Archivo .env.local está vacío o incompleto" -ForegroundColor Yellow
        Write-Host "   Completa el archivo con tus credenciales de Firebase" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠ Archivo .env.local NO existe" -ForegroundColor Yellow
    Write-Host "   Crea el archivo .env.local con tus credenciales de Firebase" -ForegroundColor Yellow
    Write-Host "   Puedes usar .env.local.example como plantilla" -ForegroundColor Yellow
}

# Verificar Firebase init
Write-Host "6. Verificando configuración de Firebase..." -ForegroundColor Yellow
if (Test-Path ".firebaserc") {
    Write-Host "   ✓ Firebase inicializado" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Firebase NO inicializado" -ForegroundColor Yellow
    Write-Host "   Ejecuta: firebase init" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Verificación completada ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "1. Si falta algo, sigue las instrucciones en INSTALACION.md" -ForegroundColor White
Write-Host "2. Una vez todo esté listo, ejecuta: npm run build" -ForegroundColor White
Write-Host "3. Luego despliega: firebase deploy" -ForegroundColor White
