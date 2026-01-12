# 🧪 Prueba del Webhook de Twilio

## Verificación Rápida

Aunque el método aparezca como "CORREO" en la interfaz de Twilio, esto puede ser solo una traducción. Los webhooks de WhatsApp de Twilio siempre usan POST por defecto.

## Prueba Manual

### Paso 1: Verificar que todo está corriendo

✅ **Servidor**: Debe estar corriendo en `localhost:3000` (terminal con `npm run dev`)
✅ **ngrok**: Debe estar corriendo (terminal con `npx ngrok http 3000`)
✅ **Webhook configurado**: URL guardada en Twilio Console

### Paso 2: Enviar mensaje de prueba

1. **Abre WhatsApp en tu teléfono**
2. **Envía un mensaje** al número de Twilio: `+1 415 523 8886`
3. **Escribe cualquier mensaje** (ejemplo: "Hola, esto es una prueba")
4. **Envía el mensaje**

### Paso 3: Verificar en los logs

**En la terminal donde está corriendo el servidor** (`npm run dev`), deberías ver:

```
📩 Mensaje recibido de whatsapp:+573024002656: Hola, esto es una prueba
✅ Mensaje reenviado exitosamente a tu WhatsApp personal
```

### Paso 4: Verificar en tu WhatsApp personal

**En tu WhatsApp personal** (`+573024002656`), deberías recibir:

```
📩 Respuesta de whatsapp:+1 415 523 8886:

Hola, esto es una prueba
```

---

## Si funciona ✅

Si ves estos mensajes en los logs y recibes el reenvío en tu WhatsApp, entonces:
- ✅ El webhook está funcionando correctamente
- ✅ El método POST está funcionando (aunque aparezca como "CORREO")
- ✅ Tu aplicación está completamente configurada

---

## Si no funciona ❌

Si no ves nada en los logs:

1. **Verifica que ngrok esté corriendo**: Debe mostrar "Session Status: online"
2. **Verifica que el servidor esté corriendo**: Debe mostrar "Servidor escuchando en puerto 3000"
3. **Verifica la URL en Twilio**: Debe ser exactamente `https://matchable-semiprovincial-yuonne.ngrok-free.dev/webhooks/twilio/whatsapp`
4. **Intenta enviar el mensaje de nuevo**: A veces tarda unos segundos

---

## Solución si "CORREO" no funciona

Si después de probar no funciona, puedes:

1. **Usar la API de Twilio directamente** para actualizar el webhook:
   ```bash
   curl -X POST https://api.twilio.com/2010-04-01/Accounts/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/Messaging/WebhookConfiguration.json \
     -u "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:20bc1efaed4966c3f221f48fd885aa69" \
     -d "WebhookUrl=https://matchable-semiprovincial-yuonne.ngrok-free.dev/webhooks/twilio/whatsapp" \
     -d "Method=POST"
   ```

2. **O simplemente prueba primero**: Es probable que "CORREO" funcione como POST.

---

**¿Listo para probar?** Envía un mensaje desde tu WhatsApp al `+1 415 523 8886` y revisa los logs.
