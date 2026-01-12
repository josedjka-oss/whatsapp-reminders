# Script de backup automático de base de datos

$backupDir = ".\backups"
$dbFile = ".\prisma\dev.db"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\dev_$timestamp.db"

Write-Host "`n💾 BACKUP DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Crear directorio de backups si no existe
if (!(Test-Path $backupDir)) {
    Write-Host "📁 Creando directorio de backups..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Verificar si existe el archivo de base de datos
if (!(Test-Path $dbFile)) {
    Write-Host "❌ No se encontró el archivo de base de datos: $dbFile" -ForegroundColor Red
    exit 1
}

# Crear backup
Write-Host "📦 Creando backup..." -ForegroundColor Yellow
Copy-Item $dbFile $backupFile

if (Test-Path $backupFile) {
    $fileSize = (Get-Item $backupFile).Length / 1KB
    Write-Host "✅ Backup creado exitosamente" -ForegroundColor Green
    Write-Host "   Archivo: $backupFile" -ForegroundColor White
    Write-Host "   Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor White
    Write-Host ""
    
    # Mantener solo últimos 10 backups
    Write-Host "🧹 Limpiando backups antiguos (manteniendo últimos 10)..." -ForegroundColor Yellow
    $backups = Get-ChildItem $backupDir -Filter "dev_*.db" | Sort-Object LastWriteTime -Descending
    $backups | Select-Object -Skip 10 | ForEach-Object {
        Write-Host "   Eliminando: $($_.Name)" -ForegroundColor Gray
        Remove-Item $_.FullName
    }
    
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Backups disponibles:" -ForegroundColor Cyan
    Get-ChildItem $backupDir -Filter "dev_*.db" | Sort-Object LastWriteTime -Descending | Select-Object -First 10 | ForEach-Object {
        Write-Host "   - $($_.Name) ($([math]::Round($_.Length / 1KB, 2)) KB) - $($_.LastWriteTime)" -ForegroundColor White
    }
} else {
    Write-Host "❌ Error al crear backup" -ForegroundColor Red
    exit 1
}

Write-Host ""
