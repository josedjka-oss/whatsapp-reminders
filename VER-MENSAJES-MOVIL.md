# 📱 Cómo Ver Mensajes en el Móvil

## 🎯 Resumen

Los mensajes que llegan al número de WhatsApp Business (`+573242145488`) se **reenvían automáticamente** a tu número personal configurado en `MY_WHATSAPP_NUMBER`.

---

## ✅ Opción 1: Ver Mensajes Reenviados a tu WhatsApp Personal

### Configuración Requerida

**Variable de entorno en Render:**
- `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX` (tu número personal)

### Cómo Funciona

1. **Alguien escribe** al número de WhatsApp Business: `+573242145488`
2. **El webhook recibe** el mensaje en el backend
3. **El sistema reenvía** automáticamente el mensaje a tu número personal
4. **Recibes** el mensaje en tu WhatsApp con el formato:
   ```
   📩 Respuesta de whatsapp:+573024002656:
   
   [Mensaje original aquí]
   ```

### Verificar Configuración

1. **Ve a Render Dashboard:**
   - https://dashboard.render.com/
   - Selecciona tu servicio (backend)
   - Ve a **Environment**

2. **Verifica que exista:**
   - `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX`
   - (Reemplaza `+57XXXXXXXXXX` con tu número personal)

3. **Si no existe, agrégalo:**
   - Haz clic en **Add Environment Variable**
   - Key: `MY_WHATSAPP_NUMBER`
   - Value: `whatsapp:+57XXXXXXXXXX` (tu número personal)
   - Haz clic en **Save Changes**
   - **Reinicia el servicio** para que tome la nueva variable

### Probar que Funciona

1. **Envía un mensaje** desde otro número al `+573242145488`
2. **Espera 1-2 segundos**
3. **Deberías recibir** el mensaje reenviado en tu WhatsApp personal

---

## ✅ Opción 2: Ver Mensajes en la Aplicación Web

### Ver Mensajes Entrantes

**URL:** https://whatsapp-reminders.vercel.app/messages

**O usar la API directamente:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/messages
```

### Filtrar por Dirección

**Solo mensajes entrantes:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/messages?direction=inbound
```

**Solo mensajes salientes:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/messages?direction=outbound
```

### Filtrar por Remitente

**Mensajes de un número específico:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/messages?from=whatsapp:+573024002656
```

---

## ✅ Opción 3: Ver Mensajes en Twilio Console

### Pasos

1. **Ve a Twilio Console:**
   - https://console.twilio.com/
   - Inicia sesión

2. **Navega a:**
   - **Messaging** → **Monitor** → **Logs**

3. **Filtra por:**
   - **Direction:** Incoming
   - **To:** `+573242145488`

4. **Verás:**
   - Todos los mensajes entrantes
   - Fecha y hora
   - Contenido del mensaje
   - Estado (Received, Delivered, etc.)

---

## 🔍 Verificar que el Reenvío Esté Funcionando

### 1. Revisar Logs en Render

1. **Ve a Render Dashboard:**
   - https://dashboard.render.com/
   - Selecciona tu servicio
   - Haz clic en **Logs**

2. **Busca mensajes como:**
   ```
   [WEBHOOK] 📩 Mensaje recibido de whatsapp:+57XXXXXXXXXX
   [TWILIO] Reenviando mensaje a whatsapp:+57XXXXXXXXXX
   [TWILIO] ✅ Mensaje reenviado a WhatsApp personal
   ```

3. **Si ves errores como:**
   ```
   [TWILIO] MY_WHATSAPP_NUMBER no configurado
   ```
   - Significa que falta configurar la variable de entorno

### 2. Probar Manualmente

1. **Envía un mensaje** desde otro número al `+573242145488`
2. **Revisa los logs** en Render
3. **Verifica** que aparezca el mensaje de reenvío
4. **Confirma** que recibiste el mensaje en tu WhatsApp personal

---

## ⚙️ Configuración Actual

### Número de WhatsApp Business
- **Número:** `+573242145488`
- **Estado:** Online
- **WABA ID:** 1281121247401247

### Variable de Entorno Requerida
- **Key:** `MY_WHATSAPP_NUMBER`
- **Value:** `whatsapp:+57XXXXXXXXXX` (tu número personal)
- **Ubicación:** Render Dashboard → Environment Variables

---

## 📋 Checklist de Verificación

- [ ] `MY_WHATSAPP_NUMBER` configurado en Render
- [ ] Servicio reiniciado después de agregar la variable
- [ ] Mensaje de prueba enviado al `+573242145488`
- [ ] Mensaje reenviado recibido en WhatsApp personal
- [ ] Logs en Render muestran el reenvío exitoso

---

## 🎯 Resumen de Opciones

| Método | Cómo Acceder | Ventajas |
|--------|--------------|----------|
| **WhatsApp Personal** | Configurar `MY_WHATSAPP_NUMBER` | Notificaciones inmediatas en móvil |
| **Aplicación Web** | `/messages` o API | Historial completo, búsqueda |
| **Twilio Console** | Monitor → Logs | Información detallada, estado de entrega |

---

## 🚨 Solución de Problemas

### No Recibo Mensajes Reenviados

1. **Verifica `MY_WHATSAPP_NUMBER`:**
   - Debe estar configurado en Render
   - Formato: `whatsapp:+57XXXXXXXXXX`
   - Debe incluir el prefijo `whatsapp:`

2. **Reinicia el servicio:**
   - Render Dashboard → Tu servicio → Manual Deploy

3. **Revisa los logs:**
   - Busca errores relacionados con `MY_WHATSAPP_NUMBER`

### Los Mensajes No Aparecen en la Web

1. **Verifica que el webhook esté configurado:**
   - Twilio Console → WhatsApp Senders → Edit
   - Webhook URL debe ser: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`

2. **Revisa los logs en Render:**
   - Busca mensajes de webhook recibidos

---

## ✅ Conclusión

**La forma más fácil de ver los mensajes en tu móvil es:**

1. **Configurar `MY_WHATSAPP_NUMBER`** en Render
2. **Reiniciar el servicio**
3. **Los mensajes se reenviarán automáticamente** a tu WhatsApp personal

**También puedes ver los mensajes en:**
- La aplicación web: `/messages`
- Twilio Console: Monitor → Logs

¿Necesitas ayuda para configurar `MY_WHATSAPP_NUMBER` o verificar que funcione?
