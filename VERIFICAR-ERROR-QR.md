# 🔍 Verificar Error al Generar QR

## El QR no aparece. Necesitamos ver los logs para identificar el problema.

### Paso 1: Ver logs de Firebase Functions

Ejecuta en PowerShell:

```powershell
cd C:\Users\user\Desktop\WHATS
firebase functions:log --only initializeWhatsApp
```

O ve a la consola web:
https://console.firebase.google.com/project/whatsapp-scheduler-2105b/functions/logs

### Paso 2: Verificar que Cloud Run esté funcionando

Prueba el endpoint directamente en tu navegador:

```
https://whatsapp-service-890959892342.us-central1.run.app/health
```

Deberías ver: `{"status":"ok"}`

### Paso 3: Ver logs de Cloud Run

1. Ve a: https://console.cloud.google.com/run?project=whatsapp-scheduler-2105b
2. Haz clic en el servicio "whatsapp-service"
3. Ve a la pestaña "LOGS"
4. Revisa los errores recientes

### Paso 4: Probar endpoint de inicialización

Prueba en tu navegador (o con curl):

```
https://whatsapp-service-890959892342.us-central1.run.app/initialize
```

O desde PowerShell:

```powershell
Invoke-WebRequest -Uri "https://whatsapp-service-890959892342.us-central1.run.app/health" -Method GET
```

## Posibles problemas:

1. **Cloud Run no está respondiendo**: El servicio puede estar apagado
2. **Error en la comunicación**: Firebase Functions no puede llamar a Cloud Run
3. **Error en Puppeteer**: Chrome no se está ejecutando correctamente en Cloud Run
4. **Timeout**: La inicialización tarda más de lo esperado
