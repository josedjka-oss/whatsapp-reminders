# 🚀 Instrucciones para Desplegar Cloud Run

## Paso 1: Instalar Google Cloud SDK (si no lo tienes)

1. Descarga e instala desde: https://cloud.google.com/sdk/docs/install
2. O usa este comando en PowerShell (requiere permisos de administrador):
   ```powershell
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

## Paso 2: Autenticarse con Google Cloud

```powershell
gcloud auth login
```

Esto abrirá tu navegador para autenticarte.

## Paso 3: Configurar el proyecto

```powershell
gcloud config set project whatsapp-scheduler-2105b
```

## Paso 4: Habilitar APIs necesarias

```powershell
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Paso 5: Instalar dependencias de Cloud Run

```powershell
cd cloud-run
npm install
```

## Paso 6: Desplegar a Cloud Run

### Opción A: Usar el script PowerShell

```powershell
.\deploy.ps1
```

### Opción B: Comando manual

```powershell
gcloud run deploy whatsapp-service `
  --source . `
  --platform managed `
  --region us-central1 `
  --project whatsapp-scheduler-2105b `
  --allow-unauthenticated `
  --memory 2Gi `
  --timeout 900 `
  --min-instances 0 `
  --max-instances 1
```

## Paso 7: Obtener la URL del servicio

Después del despliegue, copia la URL que aparece. Se verá algo como:
```
https://whatsapp-service-xxxxx-uc.a.run.app
```

## Paso 8: Configurar Firebase Functions

```powershell
cd ..\functions
firebase functions:config:set cloud_run.url="https://whatsapp-service-xxxxx-uc.a.run.app"
```

## Paso 9: Actualizar funciones de Firebase

```powershell
cd ..
npm install --save axios
cd functions
npm install --save axios
npm run build
cd ..
firebase deploy --only functions
```

## Paso 10: Probar

1. Abre: https://whatsapp-scheduler-2105b.web.app
2. Haz clic en "Generar código QR"
3. Debería funcionar ahora! 🎉

## ⚠️ Notas Importantes

- El primer despliegue puede tardar 5-10 minutos
- Cloud Run tiene un tier gratuito generoso (2M requests/mes gratis)
- El servicio se apagará automáticamente cuando no se use (min-instances: 0)
- La primera llamada después de estar apagado puede tardar unos segundos más

## 🔍 Verificar el despliegue

```powershell
gcloud run services list --region us-central1
```

## 📊 Ver logs

```powershell
gcloud run services logs read whatsapp-service --region us-central1
```
