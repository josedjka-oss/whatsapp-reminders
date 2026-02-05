# 🔍 Verificar Webhook de Mensajes Entrantes

## ✅ Estado Actual

**`MY_WHATSAPP_NUMBER` está configurado correctamente:**
- ✅ `MY_WHATSAPP_NUMBER: whatsapp:+573024002656`
- ✅ Los recordatorios se envían correctamente

**Pero los mensajes entrantes con foto NO se reenvían.**

---

## 🔍 Diferencia: Scheduler vs Webhook

### Scheduler (Lo que viste en los logs)
- **Función:** Envía recordatorios programados
- **Dirección:** Saliente (outbound)
- **Logs:** `[SCHEDULER]` y `[TWILIO] 📤 Enviando mensaje`
- **Estado:** ✅ Funcionando correctamente

### Webhook (Lo que necesitamos ver)
- **Función:** Recibe mensajes entrantes y los reenvía
- **Dirección:** Entrante (inbound)
- **Logs:** `[WEBHOOK]` y `[TWILIO] Reenviando mensaje`
- **Estado:** ❓ Necesitamos verificar

---

## 🔍 Qué Buscar en los Logs del Webhook

Cuando alguien envía un mensaje con foto al `+573242145488`, deberías ver estos logs:

### 1. Recepción del Webhook
```
[WEBHOOK] ========== WEBHOOK RECIBIDO ==========
[WEBHOOK] 📩 Mensaje recibido de whatsapp:+573024002656 → whatsapp:+573242145488
[WEBHOOK] 📷 Mensaje con 1 archivo(s) multimedia
```

### 2. Guardado en Base de Datos
```
[WEBHOOK] ✅ Mensaje guardado en DB (ID: ...)
```

### 3. Intento de Reenvío
```
[TWILIO] Reenviando mensaje con 1 imagen(es)
[TWILIO] Procesando imagen 1/1...
```

### 4. Resultado
**Si funciona:**
```
[TWILIO] ✅ Imagen 1 procesada
[TWILIO] Mensaje con 1 imagen(es) reenviado. SID: ...
[WEBHOOK] ✅ Mensaje reenviado a WhatsApp personal
```

**Si falla:**
```
[TWILIO] ❌ Error procesando imagen 1: [error]
[TWILIO] No se pudieron procesar las imágenes, enviando solo texto
[WEBHOOK] ❌ Error reenviando mensaje: [error]
```

---

## 🔍 Cómo Verificar el Webhook

### Paso 1: Enviar un Mensaje de Prueba

1. Desde otro número, envía un mensaje con foto al `+573242145488`
2. Espera 1-2 segundos

### Paso 2: Revisar Logs en Render

1. Ve a Render Dashboard → Logs
2. Busca mensajes que contengan:
   - `[WEBHOOK]`
   - `Mensaje recibido`
   - `Reenviando mensaje`
   - `Error reenviando`

### Paso 3: Verificar Configuración del Webhook en Twilio

1. Ve a Twilio Console
2. WhatsApp Senders → `+573242145488` → Edit
3. Verifica que el webhook esté configurado:
   - **Webhook URL:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
   - **Method:** HTTP Post

---

## 🚨 Posibles Problemas

### 1. Webhook No Configurado en Twilio

**Síntoma:** No aparecen logs `[WEBHOOK]` cuando se envía un mensaje

**Solución:**
- Configurar el webhook en Twilio Console
- URL: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`

### 2. Error al Procesar la Imagen

**Síntoma:** Aparecen logs `[WEBHOOK]` pero hay error al procesar imagen

**Logs esperados:**
```
[TWILIO] ❌ Error procesando imagen 1: [error]
[TWILIO] No se pudieron procesar las imágenes, enviando solo texto
```

**Problema:** Las URLs de Twilio requieren autenticación y pueden no funcionar para reenvío

### 3. Error al Reenviar el Mensaje

**Síntoma:** La imagen se procesa pero falla al enviar

**Logs esperados:**
```
[WEBHOOK] ❌ Error reenviando mensaje: [error específico]
```

---

## ✅ Acción Inmediata

### 1. Verificar Webhook en Twilio

1. Ve a: https://console.twilio.com/
2. WhatsApp Senders → `+573242145488` → Edit
3. Verifica:
   - **Webhook URL:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
   - **Method:** HTTP Post

### 2. Enviar Mensaje de Prueba

1. Desde otro número, envía un mensaje con foto al `+573242145488`
2. Espera 1-2 segundos

### 3. Revisar Logs en Render

1. Ve a Render Dashboard → Logs
2. Busca mensajes con `[WEBHOOK]`
3. Comparte los logs que aparezcan

---

## 📋 Checklist

- [ ] `MY_WHATSAPP_NUMBER` configurado ✅ (ya verificado)
- [ ] Webhook configurado en Twilio
- [ ] Logs `[WEBHOOK]` aparecen cuando se envía mensaje
- [ ] No hay errores al procesar imagen
- [ ] No hay errores al reenviar mensaje

---

## 🎯 Próximo Paso

**Envía un mensaje con foto al `+573242145488` y comparte los logs que aparezcan en Render.**

**Busca específicamente:**
- `[WEBHOOK] 📩 Mensaje recibido`
- `[TWILIO] Reenviando mensaje`
- `[WEBHOOK] ❌ Error reenviando mensaje`

**Eso me dirá exactamente qué está fallando.**
