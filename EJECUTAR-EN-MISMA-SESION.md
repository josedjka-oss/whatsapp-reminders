# ⚠️ IMPORTANTE: Ejecuta en la MISMA sesión de PowerShell

El script se ejecuta en una nueva sesión, por eso no tiene la autenticación. 

## ✅ Solución: Ejecuta los comandos directamente

En la **misma ventana de PowerShell** donde ejecutaste `gcloud auth login`, ejecuta estos comandos uno por uno:

```powershell
# 1. Cambiar política de ejecución
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# 2. Configurar PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"

# 3. Compilar (ya se hizo, pero por si acaso)
cd C:\Users\user\Desktop\WHATS\cloud-run
npm run build

# 4. Habilitar APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 5. Desplegar Cloud Run (tarda 5-10 minutos)
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## 🎯 O si prefieres, autentícate de nuevo en esta sesión:

```powershell
# Cambiar política
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Configurar PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"

# Autenticarte de nuevo
gcloud auth login

# Luego ejecuta los comandos del paso 3-5 arriba
```
