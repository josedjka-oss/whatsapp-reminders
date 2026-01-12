# ✅ Cloud Run API Habilitada - Desplegar Ahora

## ✅ Estado: Cloud Run Admin API está HABILITADA

Ahora puedes desplegar el servicio.

## 🚀 Ejecuta en PowerShell:

```powershell
# Asegúrate de estar autenticado (si no lo estás)
gcloud auth login

# Ir a la carpeta
cd C:\Users\user\Desktop\WHATS\cloud-run

# Desplegar (tarda 5-10 minutos)
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## ⏱️ Durante el despliegue verás:

- Building container...
- Uploading container...
- Deploying container...
- Service URL: https://whatsapp-service-xxxxx-uc.a.run.app

## 📋 Después del despliegue:

1. **Copia la URL** que aparece (algo como: `https://whatsapp-service-xxxxx-uc.a.run.app`)
2. **Avísame** y continuamos con la configuración de Firebase Functions
