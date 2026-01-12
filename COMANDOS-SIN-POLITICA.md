# 🔧 Solución: Política de Ejecución de PowerShell

## ✅ Solución Rápida: Cambiar política solo para esta sesión

Ejecuta esto **al inicio** de tu sesión de PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
```

Luego ejecuta todos los comandos normalmente.

## 📋 Comandos Completos (Copia y pega todo):

```powershell
# 1. Cambiar política de ejecución (solo para esta sesión)
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# 2. Configurar PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"

# 3. Compilar
cd C:\Users\user\Desktop\WHATS\cloud-run
npm run build

# 4. Habilitar APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 5. Desplegar Cloud Run (tarda 5-10 minutos)
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## 🎯 Alternativa: Usar el script automático

Ejecuta:
```powershell
cd C:\Users\user\Desktop\WHATS
powershell -ExecutionPolicy Bypass -File .\ejecutar-todo.ps1
```

## ⚠️ Nota

`Set-ExecutionPolicy -Scope Process` solo afecta a la sesión actual de PowerShell. No cambia la política del sistema, es seguro.
