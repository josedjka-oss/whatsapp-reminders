# 📱 Cómo Verificar Qué Línea de WhatsApp Está Verificada

## 🎯 Método 1: Usar el Endpoint de la API (Más Rápido)

### Verificar Todos los Números

**URL:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
```

**Con curl:**
```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
```

**Respuesta esperada:**
```json
{
  "configuredFrom": "whatsapp:+573043577875",
  "senders": [
    {
      "number": "whatsapp:+573043577875",
      "phoneNumber": "+573043577875",
      "status": "locked",
      "lastMessageStatus": "undelivered",
      "lastError": {
        "code": 63051,
        "message": "WhatsApp Business Account is Locked"
      },
      "isConfigured": true,
      "messageCount": 5
    }
  ],
  "total": 1
}
```

### Verificar un Número Específico

**URL:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/573043577875
```

**Con curl:**
```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/573043577875
```

**Respuesta esperada:**
```json
{
  "number": "whatsapp:+573043577875",
  "phoneNumber": "+573043577875",
  "status": "locked",
  "lastMessageStatus": "undelivered",
  "lastError": {
    "code": 63051,
    "message": "WhatsApp Business Account is Locked"
  },
  "statistics": {
    "totalMessages": 10,
    "successCount": 0,
    "errorCount": 5
  },
  "recentMessages": [
    {
      "sid": "MM...",
      "status": "undelivered",
      "errorCode": 63051,
      "errorMessage": "WhatsApp Business Account is Locked",
      "to": "whatsapp:+573024002656",
      "dateCreated": "2026-01-16T01:12:03Z"
    }
  ]
}
```

## 📊 Interpretar el Status

### ✅ Estados Exitosos:
- **verified**: Número verificado y funcionando ✅
- **active**: Número activo (mensajes enviados exitosamente)
- **pending**: Pendiente de verificación

### ❌ Estados de Error:
- **locked**: Cuenta bloqueada (error 63051) 🔒
- **not_verified**: Número no verificado (error 21608)
- **no_whatsapp**: Número no tiene WhatsApp (error 21614)
- **error**: Error general
- **unknown**: Estado desconocido (sin mensajes recientes)
- **no_messages**: No hay mensajes para analizar

## 🖥️ Método 2: Verificar en Twilio Console

### Paso 1: Acceder a WhatsApp Senders

1. Ve a: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
2. Inicia sesión con tu cuenta de Twilio
3. Verás una lista de todos los números de WhatsApp

### Paso 2: Buscar Tu Número

1. Busca el número: **+573043577875**
2. Revisa la columna **"Status"**:
   - ✅ **Verified** = Verificado y activo
   - ⚠️ **Pending** = Pendiente de verificación
   - ❌ **Blocked** = Bloqueado
   - ❌ **Locked** = Bloqueado (error 63051)

### Paso 3: Ver Detalles del Número

1. Haz clic en el número
2. Verás información detallada:
   - **Status**: Estado actual
   - **Verification Date**: Fecha de verificación
   - **Business Account**: Cuenta de negocio asociada
   - **Templates**: Templates aprobados

## 🔍 Método 3: Verificar en Meta Business Suite

### Paso 1: Acceder a Meta Business Suite

1. Ve a: https://business.facebook.com/
2. Inicia sesión con tu cuenta
3. Selecciona el portfolio: **ultralents**

### Paso 2: Verificar Estado

1. Ve a: **Configuración** → **Verificación del negocio**
2. Busca: **DISTRIBUIDORA ULTRALENTS SAS**
3. Verás:
   - **Estado**: Verificado ✅
   - **Fecha**: Feb 04, 2026
   - **Número**: +573043577875 (si está visible)

### Paso 3: Ver Números Conectados

1. Ve a: **Configuración** → **WhatsApp Business**
2. Verás los números conectados a tu cuenta
3. Revisa el estado de cada número

## 🔧 Método 4: Verificar en los Logs del Backend

### Ver Logs en Render

1. Ve a: https://dashboard.render.com/
2. Selecciona tu servicio
3. Ve a la pestaña **"Logs"**
4. Busca líneas que contengan:
   - `[TWILIO] TWILIO_WHATSAPP_FROM: whatsapp:+573043577875`
   - `[TWILIO] ✅ Mensaje creado en Twilio`
   - `[TWILIO] ❌ Error enviando mensaje`

### Ver Mensajes Recientes

Usa el endpoint de mensajes:
```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=10
```

Busca el campo `from` para ver qué número se está usando.

## 📋 Resumen de Estados

| Estado | Significado | Acción |
|--------|-------------|--------|
| ✅ **verified** | Verificado y funcionando | Ninguna, todo OK |
| ⚠️ **pending** | Pendiente de verificación | Esperar aprobación |
| 🔒 **locked** | Bloqueado (error 63051) | Contactar soporte Twilio |
| ❌ **blocked** | Bloqueado | Contactar soporte Twilio |
| ❌ **not_verified** | No verificado | Verificar en Meta Business |
| ❌ **no_whatsapp** | No tiene WhatsApp | Verificar número |
| ❓ **unknown** | Estado desconocido | Enviar mensaje de prueba |

## 🚀 Ejemplo Completo

```bash
# 1. Verificar todos los números
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders

# 2. Verificar número específico
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/573043577875

# 3. Ver últimos mensajes
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=5
```

## ⚠️ Si el Número Está Bloqueado

Si el estado es **locked** o **blocked**:

1. **Contacta soporte de Twilio:**
   - Ve a: https://support.twilio.com/
   - Crea un ticket explicando el problema
   - Menciona que la cuenta está verificada en Meta Business Suite

2. **Verifica en Meta Business Suite:**
   - Asegúrate de que la cuenta esté verificada
   - Revisa que no haya restricciones

3. **Espera respuesta de soporte:**
   - Típicamente 24-48 horas
   - No intentes enviar más mensajes mientras esté bloqueado

## 📝 Notas Importantes

- **La verificación en Meta NO es suficiente**: También debe estar activa en Twilio
- **El estado puede cambiar**: Revisa periódicamente
- **Los errores son específicos**: Revisa el `errorCode` para más detalles
- **Contacta soporte si está bloqueado**: No se resuelve automáticamente
