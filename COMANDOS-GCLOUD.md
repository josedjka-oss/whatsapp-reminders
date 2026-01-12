# 🔧 Comandos para Ejecutar gcloud

## Problema: Política de Ejecución de PowerShell

PowerShell está bloqueando los scripts. Usa estos comandos:

## ✅ Solución: Usar el comando .cmd directamente

### Opción 1: Usar comillas (Recomendada)

```powershell
& "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" auth login
```

### Opción 2: Cambiar política de ejecución (Solo para esta sesión)

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
$env:Path += ";C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"
gcloud auth login
```

### Opción 3: Usar CMD en lugar de PowerShell

Abre **CMD** (no PowerShell) y ejecuta:
```cmd
cd C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin
gcloud auth login
```

## 📋 Todos los comandos que necesitas (usa la Opción 1):

```powershell
# 1. Autenticarte
& "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" auth login

# 2. Habilitar APIs
& "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" services enable run.googleapis.com cloudbuild.googleapis.com

# 3. Configurar proyecto (si no está configurado)
& "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" config set project whatsapp-scheduler-2105b

# 4. Desplegar Cloud Run
cd C:\Users\user\Desktop\WHATS\cloud-run
& "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## 💡 Alternativa: Crear un alias

Ejecuta esto una vez para crear un alias:
```powershell
function gcloud { & "C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" $args }
```

Luego puedes usar `gcloud` normalmente:
```powershell
gcloud auth login
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```
