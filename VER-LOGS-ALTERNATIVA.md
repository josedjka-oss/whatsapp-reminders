# 🔍 Ver Logs - Método Alternativo

## El comando anterior no mostró logs

Probemos otras formas de ver los logs:

## Opción 1: Ver logs desde Cloud Logging

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=whatsapp-service" --limit 50 --format json
```

## Opción 2: Ver logs en formato texto

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=whatsapp-service" --limit 50 --format "table(timestamp,textPayload)"
```

## Opción 3: Ver logs desde la consola web

1. Ve a: https://console.cloud.google.com/logs/query?project=whatsapp-scheduler-2105b
2. En el editor de consultas, pega esto:
   ```
   resource.type="cloud_run_revision"
   resource.labels.service_name="whatsapp-service"
   ```
3. Haz clic en "Ejecutar consulta"

## Opción 4: Probar el servicio y ver logs en tiempo real

1. En Cloud Shell, ejecuta:
   ```bash
   curl -X POST https://whatsapp-service-890959892342.us-central1.run.app/initialize -H "Content-Type: application/json" -d "{}"
   ```

2. Luego inmediatamente ejecuta:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=whatsapp-service" --limit 20 --format "table(timestamp,textPayload)" --freshness=1m
   ```
