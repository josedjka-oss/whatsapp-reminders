# 🧪 Probar el Servicio Directamente

## Paso 1: Probar el endpoint de health

Abre en tu navegador:

```
https://whatsapp-service-890959892342.us-central1.run.app/health
```

Deberías ver: `{"status":"ok"}`

Si no funciona, el servicio puede estar apagado o hay un problema.

## Paso 2: Probar el endpoint de inicialización

Abre en tu navegador:

```
https://whatsapp-service-890959892342.us-central1.run.app/initialize
```

O desde PowerShell:

```powershell
Invoke-WebRequest -Uri "https://whatsapp-service-890959892342.us-central1.run.app/initialize" -Method POST -ContentType "application/json" -Body "{}"
```

## Paso 3: Ver logs de Cloud Run

1. Ve a: https://console.cloud.google.com/run?project=whatsapp-scheduler-2105b
2. Haz clic en el servicio "whatsapp-service"
3. Ve a la pestaña "LOGS"
4. Revisa los errores recientes

## Paso 4: Ver logs de Firebase Functions

1. Ve a: https://console.firebase.google.com/project/whatsapp-scheduler-2105b/functions/logs
2. Busca errores en `initializeWhatsApp`

## Posibles problemas:

1. **Cloud Run está apagado**: La primera llamada puede tardar en iniciar
2. **Error de Puppeteer**: Chrome no se está ejecutando correctamente
3. **Timeout**: La inicialización tarda más de 60 segundos
4. **Error de comunicación**: Firebase Functions no puede llamar a Cloud Run
