# ✅ Migración a Cloud Run - Resumen

## 📦 Archivos Creados

### Cloud Run Service
- ✅ `cloud-run/Dockerfile` - Contenedor Docker con Chrome y Node.js
- ✅ `cloud-run/package.json` - Dependencias del servicio
- ✅ `cloud-run/tsconfig.json` - Configuración TypeScript
- ✅ `cloud-run/src/server.ts` - Servidor HTTP con endpoints de WhatsApp
- ✅ `cloud-run/deploy.ps1` - Script de despliegue para PowerShell
- ✅ `cloud-run/deploy.sh` - Script de despliegue para Linux/Mac

### Firebase Functions (Actualizadas)
- ✅ `functions/src/index.ts` - Actualizado para llamar a Cloud Run
- ✅ `functions/package.json` - Actualizado (removidas dependencias de Puppeteer, agregado axios)

### Documentación
- ✅ `INSTRUCCIONES-CLOUD-RUN.md` - Guía paso a paso completa

## 🚀 Próximos Pasos

### 1. Instalar Google Cloud SDK
```powershell
# Descargar e instalar desde:
# https://cloud.google.com/sdk/docs/install
```

### 2. Autenticarse
```powershell
gcloud auth login
```

### 3. Configurar proyecto
```powershell
gcloud config set project whatsapp-scheduler-2105b
```

### 4. Habilitar APIs
```powershell
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 5. Instalar dependencias de Cloud Run
```powershell
cd cloud-run
npm install
```

### 6. Desplegar a Cloud Run
```powershell
.\deploy.ps1
```

O manualmente:
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

### 7. Copiar la URL del servicio
Después del despliegue, copia la URL que aparece (algo como: `https://whatsapp-service-xxxxx-uc.a.run.app`)

### 8. Configurar Firebase Functions
```powershell
cd ..\functions
firebase functions:config:set cloud_run.url="https://whatsapp-service-xxxxx-uc.a.run.app"
```

### 9. Instalar axios en functions
```powershell
npm install --save axios
npm run build
```

### 10. Desplegar funciones actualizadas
```powershell
cd ..
firebase deploy --only functions
```

### 11. Probar
1. Abre: https://whatsapp-scheduler-2105b.web.app
2. Haz clic en "Generar código QR"
3. ¡Debería funcionar! 🎉

## ⚠️ Notas Importantes

- El primer despliegue de Cloud Run puede tardar 5-10 minutos
- Cloud Run tiene tier gratuito generoso (2M requests/mes gratis)
- El servicio se apaga automáticamente cuando no se usa (ahorra costos)
- La primera llamada después de estar apagado puede tardar unos segundos más

## 🔍 Verificar

```powershell
# Ver servicios desplegados
gcloud run services list --region us-central1

# Ver logs
gcloud run services logs read whatsapp-service --region us-central1
```

## 💰 Costos

Para tu uso (8 mensajes/día):
- **Cloud Run**: Prácticamente gratis (dentro del tier gratuito)
- **Firebase Functions**: Prácticamente gratis (dentro del tier gratuito)
- **Firestore**: Prácticamente gratis (dentro del tier gratuito)

**Total estimado: $0-1 USD/mes**
