# 🔧 Habilitar APIs desde la Consola Web

## Opción 1: Buscar y Habilitar

1. En la parte superior de la página, haz clic en **"+ HABILITAR API"** o **"ENABLE APIS AND SERVICES"**
2. Busca **"Cloud Run API"** y haz clic en "Habilitar"
3. Busca **"Cloud Build API"** y verifica que esté habilitada (ya aparece en tu lista, así que probablemente ya está)

## Opción 2: Buscar directamente

1. En el buscador de la consola (arriba), escribe: **"Cloud Run API"**
2. Haz clic en el resultado
3. Haz clic en **"HABILITAR"** o **"ENABLE"**

## Después de habilitar:

Vuelve a PowerShell y ejecuta el despliegue:

```powershell
cd C:\Users\user\Desktop\WHATS\cloud-run
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```
