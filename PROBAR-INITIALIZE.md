# 🧪 Probar Endpoint /initialize

## Paso 1: Probar /initialize directamente

Abre en tu navegador:

```
https://whatsapp-service-890959892342.us-central1.run.app/initialize
```

O desde PowerShell:

```powershell
Invoke-WebRequest -Uri "https://whatsapp-service-890959892342.us-central1.run.app/initialize" -Method POST -ContentType "application/json" -Body "{}"
```

## Paso 2: Ver logs de Cloud Run

1. Ve a: https://console.cloud.google.com/run?project=whatsapp-scheduler-2105b
2. Haz clic en el servicio "whatsapp-service"
3. Ve a la pestaña "LOGS"
4. Revisa los logs recientes después de probar /initialize

## Paso 3: Ver logs de Firebase Functions

1. Ve a: https://console.firebase.google.com/project/whatsapp-scheduler-2105b/functions/logs
2. Busca errores en `initializeWhatsApp`
3. Copia cualquier error que veas

## Posibles problemas:

1. **Puppeteer no puede ejecutarse**: Chrome no se está ejecutando correctamente en Cloud Run
2. **Timeout**: La inicialización tarda más de 50 segundos
3. **Error de whatsapp-web.js**: Problema al inicializar el cliente
