# Script simplificado para reorganizar repositorio en GitHub
# Ejecuta: .\FIX-GITHUB-REPO.ps1

Write-Host "`n[REORGANIZACION AUTOMATICA DE REPOSITORIO GITHUB]" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

# Verificar Git
try {
    $null = git --version 2>&1
    Write-Host "[OK] Git esta instalado" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git no esta instalado. Instala desde: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

$repoUrl = "https://github.com/josedjka-oss/recordatorios-de-whatsapp.git"
$tempDir = Join-Path $env:TEMP "fix-repo-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$currentDir = Get-Location

Write-Host "`n[INFO] Directorio temporal: $tempDir" -ForegroundColor Cyan
Write-Host "[INFO] Directorio actual: $currentDir`n" -ForegroundColor Cyan

# Crear directorio temporal
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    # Clonar repositorio
    Write-Host "[PASO 1] Clonando repositorio..." -ForegroundColor Yellow
    git clone $repoUrl $tempDir 2>&1 | Out-Null
    
    if (-not (Test-Path $tempDir)) {
        throw "No se pudo clonar el repositorio"
    }
    Write-Host "[OK] Repositorio clonado`n" -ForegroundColor Green
    
    # Cambiar a directorio temporal
    Push-Location $tempDir
    
    # Crear nueva rama
    Write-Host "[PASO 2] Creando rama fix-structure..." -ForegroundColor Yellow
    git checkout -b fix-structure 2>&1 | Out-Null
    Write-Host "[OK] Rama creada`n" -ForegroundColor Green
    
    # Verificar archivos locales
    $srcServerPath = Join-Path $currentDir "src\server.ts"
    $prismaSchemaPath = Join-Path $currentDir "prisma\schema.prisma"
    
    if (-not (Test-Path $srcServerPath)) {
        throw "No se encuentra src\server.ts en el directorio local"
    }
    if (-not (Test-Path $prismaSchemaPath)) {
        throw "No se encuentra prisma\schema.prisma en el directorio local"
    }
    Write-Host "[OK] Archivos locales verificados`n" -ForegroundColor Green
    
    # Eliminar archivos incorrectos
    Write-Host "[PASO 3] Eliminando archivos incorrectos..." -ForegroundColor Yellow
    @("servidor.ts", "esquema.prisma") | ForEach-Object {
        $filePath = Join-Path $tempDir $_
        if (Test-Path $filePath) {
            Remove-Item -Path $filePath -Force
            Write-Host "  [OK] Eliminado: $_" -ForegroundColor Green
        }
    }
    Write-Host ""
    
    # Crear carpetas
    $srcDir = Join-Path $tempDir "src"
    $prismaDir = Join-Path $tempDir "prisma"
    if (-not (Test-Path $srcDir)) { New-Item -ItemType Directory -Path $srcDir | Out-Null }
    if (-not (Test-Path $prismaDir)) { New-Item -ItemType Directory -Path $prismaDir | Out-Null }
    
    # Copiar archivos correctos
    Write-Host "[PASO 4] Copiando archivos correctos..." -ForegroundColor Yellow
    
    Copy-Item -Path $srcServerPath -Destination (Join-Path $srcDir "server.ts") -Force
    Write-Host "  [OK] src/server.ts" -ForegroundColor Green
    
    $srcRoutesLocal = Join-Path $currentDir "src\routes"
    $srcServicesLocal = Join-Path $currentDir "src\services"
    $srcUtilsLocal = Join-Path $currentDir "src\utils"
    
    if (Test-Path $srcRoutesLocal) {
        Copy-Item -Path $srcRoutesLocal -Destination (Join-Path $srcDir "routes") -Recurse -Force
        Write-Host "  [OK] src/routes/" -ForegroundColor Green
    }
    if (Test-Path $srcServicesLocal) {
        Copy-Item -Path $srcServicesLocal -Destination (Join-Path $srcDir "services") -Recurse -Force
        Write-Host "  [OK] src/services/" -ForegroundColor Green
    }
    if (Test-Path $srcUtilsLocal) {
        Copy-Item -Path $srcUtilsLocal -Destination (Join-Path $srcDir "utils") -Recurse -Force
        Write-Host "  [OK] src/utils/" -ForegroundColor Green
    }
    
    Copy-Item -Path $prismaSchemaPath -Destination (Join-Path $prismaDir "schema.prisma") -Force
    Write-Host "  [OK] prisma/schema.prisma" -ForegroundColor Green
    Write-Host ""
    
    # Copiar otros archivos si no existen
    @("package.json", "package-lock.json", "Procfile", "README.md", "render.yaml", "railway.json", "tsconfig.json", ".gitignore") | ForEach-Object {
        $localFile = Join-Path $currentDir $_
        $destFile = Join-Path $tempDir $_
        if ((Test-Path $localFile) -and (-not (Test-Path $destFile))) {
            Copy-Item -Path $localFile -Destination $destFile -Force
            Write-Host "  [OK] Actualizado: $_" -ForegroundColor Green
        }
    }
    Write-Host ""
    
    # Verificar estructura
    Write-Host "[PASO 5] Verificando estructura..." -ForegroundColor Yellow
    $structure = @(
        "src\server.ts",
        "src\routes\messages.ts",
        "src\routes\reminders.ts",
        "src\routes\webhooks.ts",
        "src\services\scheduler.ts",
        "src\services\twilio.ts",
        "src\utils\validation.ts",
        "prisma\schema.prisma"
    )
    
    $allOk = $true
    foreach ($item in $structure) {
        $fullPath = Join-Path $tempDir $item
        if (Test-Path $fullPath) {
            Write-Host "  [OK] $item" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] $item (FALTANTE)" -ForegroundColor Red
            $allOk = $false
        }
    }
    Write-Host ""
    
    if (-not $allOk) {
        throw "Faltan algunos archivos en la estructura"
    }
    
    # Git add y commit
    Write-Host "[PASO 6] Preparando commit..." -ForegroundColor Yellow
    git add -A 2>&1 | Out-Null
    
    $status = git status --short
    if ($status) {
        Write-Host "`nCambios a commitear:" -ForegroundColor Cyan
        $status | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        Write-Host ""
    } else {
        Write-Host "[INFO] No hay cambios para commitear. Los archivos ya estan correctos.`n" -ForegroundColor Yellow
        Pop-Location
        Remove-Item -Path $tempDir -Recurse -Force
        exit 0
    }
    
    git commit -m "Reorganizar estructura: mover archivos a carpetas correctas" 2>&1 | Out-Null
    Write-Host "[OK] Commit creado`n" -ForegroundColor Green
    
    # Push
    Write-Host "[PASO 7] Intentando push a GitHub..." -ForegroundColor Yellow
    Write-Host "(Si pide credenciales, ingresa tu usuario y token de GitHub)`n" -ForegroundColor Gray
    
    $pushResult = git push origin fix-structure 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Push exitoso!`n" -ForegroundColor Green
        Write-Host "[PROXIMOS PASOS]" -ForegroundColor Cyan
        Write-Host "1. Ve a: https://github.com/josedjka-oss/recordatorios-de-whatsapp" -ForegroundColor White
        Write-Host "2. Crea un Pull Request desde la rama 'fix-structure' a 'main'" -ForegroundColor White
        Write-Host "3. Haz merge del PR para aplicar los cambios`n" -ForegroundColor White
    } else {
        Write-Host "[INFO] Push requiere autenticacion manual`n" -ForegroundColor Yellow
        Write-Host "Ejecuta estos comandos manualmente:" -ForegroundColor Cyan
        Write-Host "  cd $tempDir" -ForegroundColor White
        Write-Host "  git push origin fix-structure`n" -ForegroundColor White
    }
    
    Pop-Location
    
} catch {
    Write-Host "`n[ERROR] $($_.Exception.Message)`n" -ForegroundColor Red
    if (Test-Path $tempDir) {
        Write-Host "[INFO] Directorio temporal mantenido: $tempDir`n" -ForegroundColor Yellow
    }
    if ((Get-Location).Path -ne $currentDir) {
        Pop-Location
    }
    exit 1
}

Write-Host "[OK] Proceso completado!`n" -ForegroundColor Green
