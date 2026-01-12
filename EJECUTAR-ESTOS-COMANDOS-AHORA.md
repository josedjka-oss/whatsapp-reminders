# 🚀 Ejecuta Estos Comandos en la Misma Sesión de PowerShell

**IMPORTANTE:** Ejecuta estos comandos en la **misma ventana de PowerShell** donde ejecutaste `gcloud auth login`.

## Paso 1: Configurar PATH y compilar

```powershell
# Agregar rutas al PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"

# Ir a la carpeta de cloud-run
cd C:\Users\user\Desktop\WHATS\cloud-run

# Compilar TypeScript
npm run build
```

## Paso 2: Habilitar APIs

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

## Paso 3: Desplegar a Cloud Run

```powershell
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

**⏱️ Esto puede tardar 5-10 minutos.** Al finalizar, copia la URL que aparece (algo como: `https://whatsapp-service-xxxxx-uc.a.run.app`)

## Paso 4: Configurar Firebase Functions

Después de copiar la URL del paso 3, ejecuta:

```powershell
cd C:\Users\user\Desktop\WHATS\functions
firebase functions:config:set cloud_run.url="<PEGA_AQUI_LA_URL>"
npm install --save axios
npm run build
```

## Paso 5: Desplegar funciones

```powershell
cd C:\Users\user\Desktop\WHATS
firebase deploy --only functions
```

## Paso 6: Probar

Abre: https://whatsapp-scheduler-2105b.web.app y haz clic en "Generar código QR"

---

## 📋 Comandos Completos (Copia y pega todo):

```powershell
# Configurar PATH
$env:Path += ";C:\Program Files\nodejs;C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"

# Compilar
cd C:\Users\user\Desktop\WHATS\cloud-run
npm run build

# Habilitar APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Desplegar Cloud Run (tarda 5-10 min)
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

**Después del despliegue, copia la URL y continúa con los pasos 4-6.**
