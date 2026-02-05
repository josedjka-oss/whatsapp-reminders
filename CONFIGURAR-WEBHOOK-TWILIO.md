# 🔧 Configurar Webhook en Twilio

## 🚨 Problema Detectado

**El webhook está configurado con el valor por defecto:**
- ❌ `https://example.com/webhook` (no funciona)

**Debe ser la URL real de tu backend:**
- ✅ `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`

---

## ✅ Solución: Configurar el Webhook Correcto

### Paso 1: Editar el WhatsApp Sender

1. En la página que estás viendo, busca la sección:
   **"Messaging Endpoint Configuration"**

2. En el campo **"Webhook URL for incoming messages"**, cambia:
   - ❌ `https://example.com/webhook`
   - ✅ `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`

### Paso 2: Configurar el Método

1. Asegúrate de que **"Webhook method for incoming messages URL"** esté en:
   - ✅ **HTTP Post**

### Paso 3: Guardar

1. Haz clic en **"Update WhatsApp Sender"** (botón al final de la página)
2. Espera a que se guarde la configuración

---

## 📋 Configuración Completa

### Webhook URL para Mensajes Entrantes

**Campo:** Webhook URL for incoming messages  
**Valor:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`  
**Método:** HTTP Post

### Webhook URL para Status Callback (Opcional)

**Campo:** Status callback URL  
**Valor:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/status` (si lo necesitas)  
**Método:** HTTP Post

### Fallback URL (Opcional)

**Campo:** Fallback URL for incoming messages  
**Valor:** Puedes dejarlo vacío o usar la misma URL  
**Método:** HTTP Post

---

## ✅ Verificación

### Después de Configurar

1. **Envía un mensaje de prueba:**
   - Desde otro número, envía un mensaje al `+573242145488`
   - Espera 1-2 segundos

2. **Revisa los logs en Render:**
   - Ve a Render Dashboard → Logs
   - Deberías ver:
     ```
     [WEBHOOK] ========== WEBHOOK RECIBIDO ==========
     [WEBHOOK] 📩 Mensaje recibido de whatsapp:+57XXXXXXXXXX
     ```

3. **Verifica en Twilio Console:**
   - Ve a Monitor → Logs
   - Busca el mensaje entrante
   - Debería mostrar que se hizo una petición HTTP al webhook

---

## 🎯 Resumen

**Antes (Incorrecto):**
```
Webhook URL: https://example.com/webhook ❌
```

**Después (Correcto):**
```
Webhook URL: https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp ✅
Method: HTTP Post ✅
```

---

## ⚠️ Importante

**Después de configurar el webhook:**
- Los mensajes entrantes llegarán al backend
- El backend los procesará y reenviará a tu número personal
- Verás los logs `[WEBHOOK]` en Render

**Si no configuras el webhook:**
- Los mensajes entrantes NO llegarán al backend
- NO se reenviarán a tu número personal
- NO verás logs `[WEBHOOK]` en Render

---

## ✅ Checklist

- [ ] Webhook URL configurado: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
- [ ] Método: HTTP Post
- [ ] Guardado: "Update WhatsApp Sender" clickeado
- [ ] Mensaje de prueba enviado
- [ ] Logs `[WEBHOOK]` aparecen en Render

---

**Configura el webhook y prueba enviando un mensaje. Deberías ver los logs en Render inmediatamente.**
