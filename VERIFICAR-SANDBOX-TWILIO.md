# 🔍 Verificar si Twilio está en Modo Sandbox

## ¿Qué es Twilio Sandbox?

Twilio Sandbox es un modo de prueba que **solo permite enviar mensajes a números verificados**. Es útil para desarrollo, pero tiene limitaciones.

## Cómo Verificar si Estás en Sandbox

### Método 1: Revisar el Número de Origen

El número de origen en Sandbox suele ser:
- `whatsapp:+14155238886` (número de prueba de Twilio)
- O un número que empiece con `whatsapp:+1` seguido de un número específico de Twilio

**Verificar en tu código:**
1. Revisa la variable de entorno `TWILIO_WHATSAPP_FROM`
2. Si es `whatsapp:+14155238886` o similar, probablemente estás en Sandbox

### Método 2: Revisar en Twilio Console

1. Ve a [Twilio Console](https://console.twilio.com/)
2. Ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Si ves un mensaje como:
   - "Join code: [CÓDIGO]" o
   - "Send 'join [código]' to +1 415 523 8886"
   
   **Estás en Sandbox**

### Método 3: Verificar el Error en los Logs

Si intentas enviar a un número no verificado, verás errores como:
- **Error Code: 21608** - "Unverified number"
- **Error Message**: "The number +XXXXXXXXXX is not verified for sending messages"

## Cómo Funciona Sandbox

### En Sandbox:
1. ✅ Puedes enviar a números que hayas verificado previamente
2. ❌ NO puedes enviar a números nuevos sin verificar
3. ⚠️ Para verificar un número, el destinatario debe enviar un código específico a Twilio

### En Production:
1. ✅ Puedes enviar a cualquier número (con algunas restricciones)
2. ✅ No necesitas verificar números individuales
3. ⚠️ Requiere verificación de tu cuenta de Twilio

## Cómo Verificar un Número en Sandbox

### Paso 1: Obtener el Código de Unión

1. Ve a [Twilio Console](https://console.twilio.com/)
2. Ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Verás un código como: `join xyz-abc-123`
4. O un número como: `+1 415 523 8886`

### Paso 2: El Destinatario Debe Enviar el Código

El destinatario debe:
1. Abrir WhatsApp
2. Enviar un mensaje a `+1 415 523 8886` (o el número que te muestre)
3. Escribir: `join xyz-abc-123` (el código que viste)
4. Esperar confirmación

### Paso 3: Verificar que Está Verificado

Después de que el destinatario envíe el código:
- El número quedará verificado por 24 horas
- Podrás enviar mensajes a ese número durante ese tiempo
- Después de 24 horas, necesitarás verificar de nuevo

## Cómo Migrar a Production

### Requisitos:
1. **Verificar tu cuenta de Twilio** (completar perfil)
2. **Agregar método de pago** (tarjeta de crédito)
3. **Solicitar acceso a WhatsApp Production** (puede tardar días)

### Pasos:
1. Ve a [Twilio Console](https://console.twilio.com/)
2. Ve a **Messaging** → **Settings** → **WhatsApp Senders**
3. Busca la opción para **"Request Production Access"**
4. Completa el formulario
5. Espera aprobación (puede tardar 1-7 días)

## Verificar con el Endpoint de la API

Puedes usar el endpoint que creamos para verificar si hay errores de Sandbox:

```bash
# Verificar un mensaje específico
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status/SM3fd8fc9c748961c50e2e80be2986ee10
```

Si ves:
```json
{
  "errorCode": "21608",
  "errorMessage": "Unverified number"
}
```

**Estás en Sandbox y el número no está verificado.**

## Soluciones Rápidas

### Opción 1: Verificar Números en Sandbox
- Pro: Rápido, no requiere cambios
- Contra: Solo funciona 24 horas, necesitas que el destinatario envíe código

### Opción 2: Migrar a Production
- Pro: Puedes enviar a cualquier número
- Contra: Requiere verificación de cuenta (puede tardar días)

### Opción 3: Usar Números de Prueba
- Pro: Funciona inmediatamente
- Contra: Solo para desarrollo/testing

## Próximos Pasos

1. **Verifica si estás en Sandbox** usando los métodos arriba
2. **Revisa los logs** del mensaje usando el endpoint `/api/twilio-status`
3. **Si estás en Sandbox y el número no está verificado:**
   - Obtén el código de unión de Twilio Console
   - Pide al destinatario que envíe el código
   - O solicita acceso a Production

## Verificar Estado Actual

Usa este comando para ver los últimos mensajes y sus estados:

```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=5
```

Revisa los `errorCode` y `errorMessage` para identificar problemas de Sandbox.
