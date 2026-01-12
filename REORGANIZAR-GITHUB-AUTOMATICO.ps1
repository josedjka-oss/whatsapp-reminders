# Script para reorganizar automáticamente el repositorio en GitHub
# Ejecuta este script con: .\REORGANIZAR-GITHUB-AUTOMATICO.ps1

Write-Host "`n🔧 REORGANIZACIÓN AUTOMÁTICA DE REPOSITORIO GITHUB" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Verificar si Git está instalado
$gitInstalled = $false
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $gitInstalled = $true
        Write-Host "✅ Git está instalado: $gitVersion" -ForegroundColor Green
    }
} catch {
    $gitInstalled = $false
}

# Si Git no está instalado, intentar instalarlo
if (-not $gitInstalled) {
    Write-Host "`n⚠️  Git no está instalado. Intentando instalar..." -ForegroundColor Yellow
    
    # Intentar instalar con winget
    try {
        Write-Host "Intentando instalar Git con winget..." -ForegroundColor Yellow
        winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements 2>&1 | Out-Null
        
        # Esperar a que termine la instalación
        Start-Sleep -Seconds 10
        
        # Actualizar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verificar nuevamente
        $gitVersion = git --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $gitInstalled = $true
            Write-Host "✅ Git instalado correctamente: $gitVersion" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ No se pudo instalar Git automáticamente." -ForegroundColor Red
        Write-Host "`n📥 Por favor, instala Git manualmente desde:" -ForegroundColor Yellow
        Write-Host "   https://git-scm.com/download/win" -ForegroundColor Cyan
        Write-Host "`nLuego ejecuta este script nuevamente.`n" -ForegroundColor Yellow
        exit 1
    }
}

# Continuar solo si Git está instalado
if (-not $gitInstalled) {
    Write-Host "`n❌ No se puede continuar sin Git. Instálalo manualmente e intenta nuevamente.`n" -ForegroundColor Red
    exit 1
}

# Configurar variables
$repoUrl = "https://github.com/josedjka-oss/recordatorios-de-whatsapp.git"
$tempDir = Join-Path $env:TEMP "reorganizar-repo-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$currentDir = Get-Location

Write-Host "`n📂 Directorio temporal: $tempDir" -ForegroundColor Cyan
Write-Host "📂 Directorio actual: $currentDir`n" -ForegroundColor Cyan

# Crear directorio temporal
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    # Clonar repositorio
    Write-Host "📥 Clonando repositorio de GitHub..." -ForegroundColor Yellow
    git clone $repoUrl $tempDir 2>&1 | Out-Null
    
    if (-not (Test-Path $tempDir)) {
        throw "No se pudo clonar el repositorio"
    }
    
    Write-Host "✅ Repositorio clonado correctamente`n" -ForegroundColor Green
    
    # Cambiar a directorio temporal
    Push-Location $tempDir
    
    # Crear nueva rama
    Write-Host "🌿 Creando rama para corrección..." -ForegroundColor Yellow
    git checkout -b fix-structure 2>&1 | Out-Null
    Write-Host "✅ Rama creada: fix-structure`n" -ForegroundColor Green
    
    # Verificar archivos locales correctos
    $srcServerPath = Join-Path $currentDir "src\server.ts"
    $prismaSchemaPath = Join-Path $currentDir "prisma\schema.prisma"
    
    if (-not (Test-Path $srcServerPath)) {
        throw "No se encuentra src\server.ts en el directorio local"
    }
    
    if (-not (Test-Path $prismaSchemaPath)) {
        throw "No se encuentra prisma\schema.prisma en el directorio local"
    }
    
    Write-Host "✅ Archivos locales verificados:`n" -ForegroundColor Green
    Write-Host "   - $srcServerPath" -ForegroundColor White
    Write-Host "   - $prismaSchemaPath`n" -ForegroundColor White
    
    # Eliminar archivos incorrectos de la raíz
    Write-Host "🗑️  Eliminando archivos incorrectos..." -ForegroundColor Yellow
    
    $filesToDelete = @("servidor.ts", "esquema.prisma")
    foreach ($file in $filesToDelete) {
        $filePath = Join-Path $tempDir $file
        if (Test-Path $filePath) {
            Remove-Item -Path $filePath -Force
            Write-Host "   ✅ Eliminado: $file" -ForegroundColor Green
        } else {
            Write-Host "   ℹ️  No existe: $file (ignorado)" -ForegroundColor Gray
        }
    }
    
    # Asegurar que las carpetas existan
    $srcDir = Join-Path $tempDir "src"
    $prismaDir = Join-Path $tempDir "prisma"
    
    if (-not (Test-Path $srcDir)) {
        New-Item -ItemType Directory -Path $srcDir | Out-Null
        Write-Host "✅ Carpeta src/ creada" -ForegroundColor Green
    }
    
    if (-not (Test-Path $prismaDir)) {
        New-Item -ItemType Directory -Path $prismaDir | Out-Null
        Write-Host "✅ Carpeta prisma/ creada" -ForegroundColor Green
    }
    
    # Copiar archivos correctos
    Write-Host "`n📋 Copiando archivos correctos..." -ForegroundColor Yellow
    
    # Copiar src/server.ts
    $destServerPath = Join-Path $srcDir "server.ts"
    Copy-Item -Path $srcServerPath -Destination $destServerPath -Force
    Write-Host "   ✅ Copiado: src/server.ts" -ForegroundColor Green
    
    # Copiar src/routes/
    $srcRoutesLocal = Join-Path $currentDir "src\routes"
    $srcRoutesDest = Join-Path $srcDir "routes"
    if (Test-Path $srcRoutesLocal) {
        Copy-Item -Path $srcRoutesLocal -Destination $srcRoutesDest -Recurse -Force
        Write-Host "   ✅ Copiado: src/routes/" -ForegroundColor Green
    }
    
    # Copiar src/services/
    $srcServicesLocal = Join-Path $currentDir "src\services"
    $srcServicesDest = Join-Path $srcDir "services"
    if (Test-Path $srcServicesLocal) {
        Copy-Item -Path $srcServicesLocal -Destination $srcServicesDest -Recurse -Force
        Write-Host "   ✅ Copiado: src/services/" -ForegroundColor Green
    }
    
    # Copiar src/utils/
    $srcUtilsLocal = Join-Path $currentDir "src\utils"
    $srcUtilsDest = Join-Path $srcDir "utils"
    if (Test-Path $srcUtilsLocal) {
        Copy-Item -Path $srcUtilsLocal -Destination $srcUtilsDest -Recurse -Force
        Write-Host "   ✅ Copiado: src/utils/" -ForegroundColor Green
    }
    
    # Copiar prisma/schema.prisma
    $destSchemaPath = Join-Path $prismaDir "schema.prisma"
    Copy-Item -Path $prismaSchemaPath -Destination $destSchemaPath -Force
    Write-Host "   ✅ Copiado: prisma/schema.prisma" -ForegroundColor Green
    
    # Copiar otros archivos importantes si no existen
    $filesToCopy = @(
        "package.json",
        "package-lock.json",
        "Procfile",
        "README.md",
        "render.yaml",
        "railway.json",
        "tsconfig.json",
        ".gitignore"
    )
    
    Write-Host "`n📋 Verificando otros archivos..." -ForegroundColor Yellow
    foreach ($file in $filesToCopy) {
        $localFile = Join-Path $currentDir $file
        $destFile = Join-Path $tempDir $file
        
        if (Test-Path $localFile) {
            if (-not (Test-Path $destFile) -or (Get-FileHash $localFile).Hash -ne (Get-FileHash $destFile).Hash) {
                Copy-Item -Path $localFile -Destination $destFile -Force
                Write-Host "   ✅ Actualizado: $file" -ForegroundColor Green
            } else {
                Write-Host "   ℹ️  Ya existe: $file" -ForegroundColor Gray
            }
        }
    }
    
    # Verificar estructura final
    Write-Host "`n📁 Verificando estructura final..." -ForegroundColor Cyan
    $structure = @(
        "src/server.ts",
        "src/routes/messages.ts",
        "src/routes/reminders.ts",
        "src/routes/webhooks.ts",
        "src/services/scheduler.ts",
        "src/services/twilio.ts",
        "src/utils/validation.ts",
        "prisma/schema.prisma"
    )
    
    $allFilesExist = $true
    foreach ($item in $structure) {
        $fullPath = Join-Path $tempDir $item
        if (Test-Path $fullPath) {
            Write-Host "   ✅ $item" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $item (FALTANTE)" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
    
    if (-not $allFilesExist) {
        throw "Faltan algunos archivos en la estructura. Revisa los errores anteriores."
    }
    
    # Agregar cambios a Git
    Write-Host "`n📝 Preparando commit..." -ForegroundColor Yellow
    git add -A 2>&1 | Out-Null
    
    # Verificar qué se va a commitear
    $status = git status --short
    if ($status) {
        Write-Host "`n📋 Cambios a commitear:" -ForegroundColor Cyan
        $status | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "`n⚠️  No hay cambios para commitear." -ForegroundColor Yellow
        Write-Host "   Es posible que los archivos ya estén correctos en GitHub.`n" -ForegroundColor Gray
        Pop-Location
        Remove-Item -Path $tempDir -Recurse -Force
        exit 0
    }
    
    # Commit
    Write-Host "`n💾 Haciendo commit..." -ForegroundColor Yellow
    git commit -m "Reorganizar estructura: mover archivos a carpetas correctas

- Eliminar servidor.ts y esquema.prisma de la raíz
- Mover src/server.ts a ubicación correcta
- Mover prisma/schema.prisma a ubicación correcta
- Asegurar estructura de carpetas correcta" 2>&1 | Out-Null
    
    Write-Host "✅ Commit creado correctamente`n" -ForegroundColor Green
    
    # Intentar hacer push (puede requerir autenticación)
    Write-Host "🚀 Intentando hacer push a GitHub..." -ForegroundColor Yellow
    Write-Host "   (Si pide credenciales, ingresa tu usuario y token de GitHub)`n" -ForegroundColor Gray
    
    try {
        git push origin fix-structure 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push exitoso!" -ForegroundColor Green
            Write-Host "`n🎉 Reorganización completada correctamente!" -ForegroundColor Green
            Write-Host "`n📝 SIGUIENTE PASO:" -ForegroundColor Cyan
            Write-Host "   1. Ve a: https://github.com/josedjka-oss/recordatorios-de-whatsapp" -ForegroundColor White
            Write-Host "   2. Haz clic en 'Pull requests' o 'Compare & pull request'" -ForegroundColor White
            Write-Host "   3. Crea un Pull Request desde la rama 'fix-structure' a 'main'" -ForegroundColor White
            Write-Host "   4. Haz merge del PR para aplicar los cambios`n" -ForegroundColor White
        } else {
            throw "Error al hacer push"
        }
    } catch {
        Write-Host "⚠️  No se pudo hacer push automáticamente." -ForegroundColor Yellow
        Write-Host "   Puede ser que necesites autenticarte manualmente.`n" -ForegroundColor Gray
        
        Write-Host "📝 INSTRUCCIONES MANUALES:" -ForegroundColor Cyan
        Write-Host "   1. Navega a: $tempDir" -ForegroundColor White
        Write-Host "   2. Ejecuta: git push origin fix-structure" -ForegroundColor White
        Write-Host "   3. Ingresa tus credenciales de GitHub" -ForegroundColor White
        Write-Host "   4. Crea un Pull Request desde GitHub para hacer merge`n" -ForegroundColor White
        
        Write-Host "   O alternativamente, ejecuta estos comandos:" -ForegroundColor Gray
        Write-Host "   cd $tempDir" -ForegroundColor Cyan
        Write-Host "   git push origin fix-structure" -ForegroundColor Cyan
    }
    
    Pop-Location
    
    # Preguntar si eliminar directorio temporal
    Write-Host "`n¿Deseas mantener el directorio temporal para revisar cambios? (S/N)" -ForegroundColor Yellow
    Write-Host "Directorio: $tempDir" -ForegroundColor Gray
    $response = Read-Host
    if ($response -eq "N" -or $response -eq "n") {
        Remove-Item -Path $tempDir -Recurse -Force
        Write-Host "✅ Directorio temporal eliminado" -ForegroundColor Green
    } else {
        Write-Host "📂 Directorio temporal mantenido: $tempDir" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nStack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    
    if (Test-Path $tempDir) {
        Write-Host "`n📂 Directorio temporal mantenido para depuración: $tempDir" -ForegroundColor Yellow
    }
    
    if ((Get-Location).Path -ne $currentDir) {
        Pop-Location
    }
    
    exit 1
}

Write-Host "`n[OK] Proceso completado!`n" -ForegroundColor Green
