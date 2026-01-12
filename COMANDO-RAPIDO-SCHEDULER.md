# ⚡ Comando Rápido: Cloud Scheduler

## URL Directa

Abre esta URL en tu navegador para ir directamente a Cloud Scheduler:

**https://console.cloud.google.com/cloudscheduler?project=whatsapp-scheduler-2105b**

## Configuración Rápida

1. **Crear Job** → Haz clic en "Crear trabajo" o "Create Job"

2. **Completar formulario:**
   - Nombre: `check-whatsapp-messages`
   - Región: `us-central1`
   - Frecuencia: `*/15 * * * *`
   - Zona horaria: Tu zona horaria
   - Target: Cloud Function
   - Function: `checkAndSendMessages`
   - Region: `us-central1`

3. **Crear** → Haz clic en "Crear" o "Create"

## ✅ Listo

El job se ejecutará automáticamente cada 15 minutos.
