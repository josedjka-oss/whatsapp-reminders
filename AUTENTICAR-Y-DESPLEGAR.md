# 🔐 Autenticarse y Desplegar

## Paso 1: Autenticarse de nuevo en esta sesión

Ejecuta:
```powershell
gcloud auth login
```

Esto abrirá tu navegador. Inicia sesión con la misma cuenta de Google que usas para Firebase.

## Paso 2: Después de autenticarte, ejecuta:

```powershell
# Habilitar APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Desplegar a Cloud Run (tarda 5-10 minutos)
cd C:\Users\user\Desktop\WHATS\cloud-run
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## ⚠️ Nota

Cada nueva sesión de PowerShell necesita autenticarse de nuevo. Por eso es importante ejecutar todos los comandos en la misma sesión.
