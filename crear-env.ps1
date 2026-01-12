# Script para crear archivo .env.local
# Ejecuta este script después de obtener tus credenciales de Firebase

Write-Host "=== Crear archivo .env.local ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Por favor, ingresa tus credenciales de Firebase:" -ForegroundColor Yellow
Write-Host ""

# Solicitar credenciales
$apiKey = Read-Host "API Key (apiKey)"
$authDomain = Read-Host "Auth Domain (authDomain)"
$projectId = Read-Host "Project ID (projectId)"
$storageBucket = Read-Host "Storage Bucket (storageBucket)"
$messagingSenderId = Read-Host "Messaging Sender ID (messagingSenderId)"
$appId = Read-Host "App ID (appId)"

# Crear contenido del archivo
$envContent = @"
# Configuración de Firebase
# Generado automáticamente

NEXT_PUBLIC_FIREBASE_API_KEY=$apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=$appId
"@

# Escribir archivo
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✓ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Ubicación: $PWD\.env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "Siguiente paso: Ejecuta 'firebase login' y luego 'firebase init'" -ForegroundColor Yellow
