# 📋 Ver Logs desde Cloud Shell

## Ejecuta este comando en Cloud Shell:

```bash
gcloud run services logs read whatsapp-service --region us-central1 --limit 50
```

Esto mostrará los últimos 50 logs del servicio.

## O para ver logs en tiempo real:

```bash
gcloud run services logs tail whatsapp-service --region us-central1
```

## Busca específicamente errores:

```bash
gcloud run services logs read whatsapp-service --region us-central1 --limit 100 | grep -i error
```

## Comparte los resultados

Especialmente cualquier línea que contenga:
- "Error"
- "failed"
- "Error message:"
- "Error stack:"
