# 🔍 Diagnosticar Problema

## Observaciones:

1. El `curl` a `/initialize` está tardando 21-51 segundos (muy lento)
2. Los logs no aparecen con los comandos normales
3. El servicio puede estar colgándose durante la inicialización

## Posibles causas:

1. **Chrome/Puppeteer no se está iniciando correctamente**
2. **El servicio se está quedando sin recursos**
3. **Hay un timeout o error silencioso**

## Soluciones a probar:

### 1. Verificar la respuesta completa del curl:

```bash
curl -v -X POST https://whatsapp-service-890959892342.us-central1.run.app/initialize -H "Content-Type: application/json" -d "{}" --max-time 60
```

### 2. Ver logs desde la consola web directamente:

Ve a: https://console.cloud.google.com/logs/query?project=whatsapp-scheduler-2105b

Y pega esta consulta:
```
resource.type="cloud_run_revision"
resource.labels.service_name="whatsapp-service"
timestamp>="2026-01-09T17:00:00Z"
```

### 3. Verificar si el servicio está realmente funcionando:

```bash
curl https://whatsapp-service-890959892342.us-central1.run.app/health
```

### 4. Aumentar el timeout y memoria del servicio:

El servicio puede necesitar más tiempo o memoria para inicializar Chrome.
