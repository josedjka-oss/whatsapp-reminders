# 🔄 Cómo Actualizar el Número de WhatsApp en Twilio

## 🎯 Objetivo
Actualizar la configuración para usar el nuevo número verificado en Meta.

---

## 📋 Paso 1: Identificar el Nuevo Número

Primero, identifica el número verificado usando la guía `VERIFICAR-NUMERO-META.md`.

**Número verificado:** `+57XXXXXXXXXX` (anótalo aquí)

---

## 🔧 Paso 2: Actualizar Variables de Entorno en Render

### Opción A: Desde Render Dashboard (Recomendado)

1. Ve a: **https://dashboard.render.com/**
2. Inicia sesión con tu cuenta
3. Selecciona tu servicio (backend)
4. Ve a la pestaña: **"Environment"**
5. Busca la variable: `TWILIO_WHATSAPP_FROM`
6. Haz clic en el ícono de edición (lápiz ✏️)
7. Actualiza el valor a: `whatsapp:+57XXXXXXXXXX` (usa el número verificado)
8. Haz clic en **"Save Changes"**
9. Render reiniciará automáticamente el servicio

### Opción B: Verificar Variables Actuales

Para ver qué número está configurado actualmente:

```bash
# Verificar en los logs
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
```

Busca el campo `configuredFrom` en la respuesta.

---

## ✅ Paso 3: Verificar que se Actualizó

### Verificar en los Logs

1. Ve a: **Render Dashboard** → Tu servicio → **Logs**
2. Busca líneas que contengan:
   ```
   [TWILIO] TWILIO_WHATSAPP_FROM: whatsapp:+57XXXXXXXXXX
   ```
3. Debe mostrar el nuevo número

### Verificar con el Endpoint

```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
```

La respuesta debe mostrar:
```json
{
  "configuredFrom": "whatsapp:+57XXXXXXXXXX",
  ...
}
```

---

## 🔍 Paso 4: Verificar en Twilio Console

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el nuevo número: `+57XXXXXXXXXX`
3. Verifica que:
   - ✅ El número esté listado
   - ✅ El estado sea "Verified" o "Active"
   - ✅ No esté bloqueado

---

## 📝 Paso 5: Verificar Templates

1. Ve a: **https://console.twilio.com/us1/develop/sms/content-templates**
2. Busca el template: `HX1d443af43266b056998367e82a4441bd`
3. Verifica que:
   - ✅ El template esté "Approved"
   - ✅ Esté asociado al nuevo número
   - ✅ No tenga restricciones

---

## 🧪 Paso 6: Probar el Nuevo Número

### Opción A: Crear un Recordatorio de Prueba

1. Ve a: **https://whatsapp-reminders.vercel.app/chat**
2. Escribe: "Recuérdame en 5 minutos probar el nuevo número"
3. Espera a que se envíe
4. Verifica que llegue al WhatsApp

### Opción B: Usar el Endpoint de Creación Manual

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573024002656",
    "body": "Prueba del nuevo número",
    "scheduledFor": "2026-01-16T20:00:00-05:00",
    "scheduleType": "once"
  }'
```

**Nota**: Ajusta la fecha/hora a unos minutos en el futuro.

---

## 📊 Paso 7: Monitorear el Envío

### Ver Logs en Render

1. Ve a: **Render Dashboard** → Tu servicio → **Logs**
2. Busca líneas que contengan:
   ```
   [SCHEDULER] ⏰ Recordatorio ...
   [TWILIO] 📤 Enviando mensaje ...
   [TWILIO] ✅ Mensaje creado en Twilio. SID: ...
   ```

### Verificar Estado del Mensaje

Usa el SID del mensaje para verificar:

```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status/MMXXXXXXXXXX
```

Reemplaza `MMXXXXXXXXXX` con el SID del mensaje.

---

## 🚨 Problemas Comunes

### "El número no aparece en Twilio Console"

**Solución:**
- Verifica que el número esté registrado en Twilio
- Puede necesitar conectarse desde Meta Business Suite
- Contacta soporte de Twilio si es necesario

### "El template no está aprobado para el nuevo número"

**Solución:**
- Necesitas aprobar el template para el nuevo número
- Ve a Twilio Console → Content Templates
- Solicita aprobación si es necesario

### "Los mensajes siguen fallando"

**Solución:**
1. Verifica el estado del número:
   ```bash
   curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/573043577875
   ```
2. Revisa el `errorCode` en los mensajes fallidos
3. Si el error es 63051 (locked), contacta soporte de Twilio

---

## ✅ Checklist Final

Antes de considerar que está todo listo:

- [ ] Número identificado en Meta Business Suite
- [ ] Variable `TWILIO_WHATSAPP_FROM` actualizada en Render
- [ ] Servicio reiniciado en Render
- [ ] Número verificado en Twilio Console
- [ ] Template aprobado para el nuevo número
- [ ] Mensaje de prueba enviado exitosamente
- [ ] Mensaje recibido en WhatsApp
- [ ] Estado del mensaje es "delivered" ✅

---

## 📞 Si Algo Sale Mal

Si después de actualizar el número sigue habiendo problemas:

1. **Verifica el estado:**
   ```bash
   curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
   ```

2. **Revisa los logs** en Render para ver errores específicos

3. **Verifica en Twilio Console** el estado del número

4. **Comparte la información** para ayudarte a diagnosticar

---

## 🎯 Resumen Rápido

1. **Identifica** el número verificado en Meta
2. **Actualiza** `TWILIO_WHATSAPP_FROM` en Render
3. **Verifica** que se actualizó correctamente
4. **Prueba** enviando un mensaje
5. **Monitorea** los logs y el estado
