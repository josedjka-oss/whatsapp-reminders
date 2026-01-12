#!/bin/bash
# Script para ver logs de Cloud Run

echo "🔍 Obteniendo logs del servicio whatsapp-service..."

# Ver logs desde Cloud Logging
echo ""
echo "=== Últimos 50 logs ==="
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=whatsapp-service" --limit 50 --format "table(timestamp,textPayload)" --project whatsapp-scheduler-2105b

echo ""
echo "=== Buscando errores ==="
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=whatsapp-service AND (severity>=ERROR OR textPayload=~\"Error\" OR textPayload=~\"error\")" --limit 20 --format "table(timestamp,textPayload)" --project whatsapp-scheduler-2105b

echo ""
echo "✅ Para ver logs en tiempo real, usa:"
echo "gcloud logging tail \"resource.type=cloud_run_revision AND resource.labels.service_name=whatsapp-service\" --project whatsapp-scheduler-2105b"
