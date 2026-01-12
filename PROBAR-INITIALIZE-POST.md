# 🧪 Probar /initialize con POST

## El endpoint /initialize requiere POST, no GET

### Opción 1: Usar PowerShell

Ejecuta en PowerShell:

```powershell
$body = @{} | ConvertTo-Json
Invoke-WebRequest -Uri "https://whatsapp-service-890959892342.us-central1.run.app/initialize" -Method POST -ContentType "application/json" -Body $body
```

### Opción 2: Usar curl (si lo tienes instalado)

```powershell
curl -X POST https://whatsapp-service-890959892342.us-central1.run.app/initialize -H "Content-Type: application/json" -d "{}"
```

### Opción 3: Usar Postman o herramienta similar

- URL: `https://whatsapp-service-890959892342.us-central1.run.app/initialize`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: `{}`

## Ver logs de Cloud Run

Después de probar, ve a:
1. https://console.cloud.google.com/run?project=whatsapp-scheduler-2105b
2. Haz clic en "whatsapp-service"
3. Pestaña "LOGS"
4. Revisa los logs recientes

## Ver logs de Firebase Functions

1. https://console.firebase.google.com/project/whatsapp-scheduler-2105b/functions/logs
2. Busca errores en `initializeWhatsApp`
