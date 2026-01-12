# ✅ Habilitar Cloud Run Admin API

## Paso a Paso:

1. **Haz clic en "Cloud Run Admin API"** (la primera opción en la lista)

2. En la página que se abre, haz clic en el botón **"HABILITAR"** o **"ENABLE"**

3. Espera unos segundos mientras se habilita

4. Verás un mensaje de confirmación cuando esté habilitada

## Después de habilitar:

Vuelve a PowerShell y ejecuta el despliegue:

```powershell
cd C:\Users\user\Desktop\WHATS\cloud-run
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## ⚠️ Nota:

- **Cloud Run Admin API** = La que necesitas ✅
- Las otras opciones (GKE Multi-Cloud, Cloud Deploy, etc.) no son necesarias para este proyecto
