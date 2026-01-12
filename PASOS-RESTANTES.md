# 🚀 Pasos Restantes para Completar el Despliegue

## ✅ Ya Completado:
- ✅ Google Cloud SDK instalado
- ✅ Proyecto configurado: `whatsapp-scheduler-2105b`
- ⏳ Autenticación pendiente
- ⏳ APIs pendientes de habilitar
- ⏳ Dependencias de Cloud Run pendientes

## 📋 Pasos que DEBES hacer manualmente:

### Paso 1: Autenticarte con Google Cloud
Ejecuta en PowerShell:
```powershell
$env:Path += ";C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin"
gcloud auth login
```

Esto abrirá tu navegador. Inicia sesión con la misma cuenta de Google que usas para Firebase.

### Paso 2: Habilitar APIs
Después de autenticarte, ejecuta:
```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### Paso 3: Instalar dependencias de Cloud Run
```powershell
cd C:\Users\user\Desktop\WHATS\cloud-run
npm install
```

### Paso 4: Desplegar a Cloud Run
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

### Paso 5: Copiar la URL del servicio
Después del despliegue, copia la URL que aparece (algo como: `https://whatsapp-service-xxxxx-uc.a.run.app`)

### Paso 6: Configurar Firebase Functions
```powershell
cd C:\Users\user\Desktop\WHATS\functions
firebase functions:config:set cloud_run.url="<PEGA_AQUI_LA_URL>"
npm install --save axios
npm run build
```

### Paso 7: Desplegar funciones
```powershell
cd C:\Users\user\Desktop\WHATS
firebase deploy --only functions
```

### Paso 8: Probar
Abre: https://whatsapp-scheduler-2105b.web.app y haz clic en "Generar código QR"

## ⚡ Comandos Rápidos (Copia y pega todo junto):

```powershell
# 1. Configurar PATH
$env:Path += ";C:\Users\user\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin;C:\Program Files\nodejs"

# 2. Autenticarte (esto abrirá el navegador)
gcloud auth login

# 3. Habilitar APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Instalar dependencias
cd C:\Users\user\Desktop\WHATS\cloud-run
npm install

# 5. Desplegar Cloud Run
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --project whatsapp-scheduler-2105b --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

Después del paso 5, copia la URL y continúa con los pasos 6-8.
