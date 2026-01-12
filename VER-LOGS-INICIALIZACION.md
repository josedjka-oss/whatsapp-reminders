# 🔍 Ver Logs de Inicialización

## El servicio está funcionando pero no genera QR aún

Necesitamos ver los logs para entender qué está pasando.

## Pasos para ver los logs:

### 1. Ve a Cloud Run Console:
https://console.cloud.google.com/run?project=whatsapp-scheduler-2105b

### 2. Haz clic en el servicio "whatsapp-service"

### 3. Ve a la pestaña "LOGS"

### 4. Busca estos mensajes:

**Mensajes que deberías ver:**
- "Servidor WhatsApp escuchando en puerto 8080"
- "Iniciando initializeWhatsApp..."
- "Configurando Puppeteer con Chrome en: /usr/bin/google-chrome-stable"
- "Creando nuevo cliente..."
- "Inicializando cliente..."
- "Esperando QR... X/50 segundos"

**Mensajes de error a buscar:**
- "Error creating WhatsApp client:"
- "Error en initialize:"
- "Error message:"
- "Error stack:"
- "Could not find Chrome"
- "Browser was not found"
- "spawn ENOENT"

## Alternativa: Ver logs desde Cloud Shell

```bash
gcloud run services logs read whatsapp-service --region us-central1 --limit 50
```

## Comparte los logs

Especialmente cualquier línea que diga "Error" o "failed".
