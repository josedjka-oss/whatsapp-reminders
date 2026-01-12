# Configurar Cloud Scheduler

## ✅ Aplicación Desplegada

Tu aplicación está disponible en:
**https://whatsapp-scheduler-2105b.web.app**

## Configurar Cloud Scheduler

Para que los mensajes se envíen automáticamente, necesitas configurar Cloud Scheduler:

### Opción 1: Desde Google Cloud Console (Recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Asegúrate de que el proyecto `whatsapp-scheduler-2105b` esté seleccionado
3. Ve a **Cloud Scheduler** (busca en el menú o en la barra de búsqueda)
4. Haz clic en **"Crear trabajo"** o **"Create Job"**
5. Configura:
   - **Nombre**: `check-whatsapp-messages`
   - **Región**: `us-central1` (o la región donde desplegaste Functions)
   - **Descripción**: `Verifica y envía mensajes programados de WhatsApp`
   - **Frecuencia**: `*/15 * * * *` (cada 15 minutos)
   - **Zona horaria**: Tu zona horaria (ej: `America/Mexico_City`)
   - **Target**: Cloud Function
   - **Function**: Selecciona `checkAndSendMessages` del dropdown
   - **Region**: `us-central1` (o la región donde desplegaste)
6. Haz clic en **"Crear"** o **"Create"**

### Opción 2: Desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `whatsapp-scheduler-2105b`
3. Ve a **Functions**
4. Busca la función `checkAndSendMessages`
5. Haz clic en los 3 puntos (⋮) → **"Ver en Cloud Console"**
6. Desde ahí puedes configurar Cloud Scheduler

### Verificar que Funciona

Después de crear el job, deberías ver:
- Estado: **Habilitado**
- Última ejecución: Se actualizará cada 15 minutos
- Próxima ejecución: En los próximos 15 minutos

## Prueba la Aplicación

1. Abre: **https://whatsapp-scheduler-2105b.web.app**
2. Haz clic en **"Generar código QR"**
3. Escanea el QR con WhatsApp desde tu teléfono
4. Una vez conectado, crea un mensaje programado
5. El mensaje se enviará automáticamente cuando llegue la fecha/hora programada

## Funciones Desplegadas

✅ `initializeWhatsApp` - Inicializa la conexión con WhatsApp
✅ `getWhatsAppStatus` - Verifica el estado de la conexión
✅ `checkAndSendMessages` - Verifica y envía mensajes programados (se ejecuta cada 15 min)

## Notas Importantes

- ⚠️ La sesión de WhatsApp se mantiene en el servidor
- ⚠️ Si desvinculas WhatsApp, necesitarás escanear el QR nuevamente
- ⚠️ Los mensajes se verifican cada 15 minutos (puede haber un retraso de hasta 15 min)
- ⚠️ Para mensajes recurrentes mensuales, el sistema crea automáticamente el siguiente mensaje
