# ✅ Probar el Webhook - Verificar que Funciona

## 🎯 PRUEBA RÁPIDA

### **PASO 1: Enviar Mensaje de Prueba**

1. **Abre WhatsApp** en tu teléfono
2. **Envía un mensaje** al número de Twilio Sandbox: `+1 415 523 8886`
3. **Escribe cualquier mensaje**, por ejemplo: `Hola, esto es una prueba del webhook`

---

### **PASO 2: Verificar en Render Logs**

1. **Ve a Render Dashboard:** https://dashboard.render.com/
2. **Haz clic en tu servicio:** `whatsapp-reminders`
3. **Haz clic en "Logs"** en la pestaña izquierda
4. **Espera 5-10 segundos** después de enviar el mensaje
5. **Busca en los logs** (últimos 1-2 minutos)

**✅ DEBERÍAS VER:**
```
[WEBHOOK] ========== WEBHOOK RECIBIDO ==========
[WEBHOOK] Método: POST
[WEBHOOK] URL: /webhooks/twilio/whatsapp
[WEBHOOK] 📩 Mensaje recibido de whatsapp:+57xxxxxxxxxx → whatsapp:+14155238886: "Hola, esto es una prueba del webhook"
[WEBHOOK] ✅ Mensaje guardado en DB (ID: ...)
[WEBHOOK] ✅ Mensaje reenviado a WhatsApp personal
[WEBHOOK] ✅ Webhook procesado exitosamente en Xms
```

**❌ SI NO VES NADA:**
- El webhook no está configurado correctamente
- O hay un problema con la URL
- O tu número no está unido al Sandbox

---

### **PASO 3: Verificar en tu WhatsApp Personal**

**Después de enviar el mensaje, deberías recibir en tu WhatsApp personal:**

```
📩 Respuesta de whatsapp:+57xxxxxxxxxx:

Hola, esto es una prueba del webhook
```

**Si recibes este mensaje:**
- ✅ El webhook está funcionando correctamente
- ✅ La configuración está bien
- ✅ Todo está conectado

---

## 🔍 VERIFICAR CONFIGURACIÓN

### **En Twilio Console:**

1. **Ve a:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. **Verifica que veas:**
   - **WHEN A MESSAGE COMES IN:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
   - **HTTP Method:** `POST`
   - **Estado:** Activo o Configurado

### **En Render:**

1. **Verifica que las variables estén configuradas:**
   - ✅ `TWILIO_ACCOUNT_SID` = `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ✅ `TWILIO_AUTH_TOKEN` = `●●●●●●●●` (marcado como SECRET)
   - ✅ `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`
   - ✅ `MY_WHATSAPP_NUMBER` = `whatsapp:+57xxxxxxxxxx`

---

## 🆘 SI NO FUNCIONA

### **Problema 1: No veo logs del webhook**

**Solución:**
- Verifica que la URL en Twilio sea exacta: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
- Verifica que el método sea POST
- Verifica que tu número esté unido al Sandbox (envíaste código `join`)
- Espera 10-15 segundos y revisa los logs de nuevo

### **Problema 2: Veo error 403 en los logs**

**Solución:**
- Verifica que `TWILIO_AUTH_TOKEN` esté correctamente configurado en Render
- Verifica que el token sea el correcto (no el Account SID)

### **Problema 3: No recibo el mensaje reenviado**

**Solución:**
- Verifica que `MY_WHATSAPP_NUMBER` esté configurado correctamente
- Verifica que el formato sea: `whatsapp:+57xxxxxxxxxx` (con código de país)
- Revisa los logs para ver si hay errores al reenviar

---

## ✅ CHECKLIST DE VERIFICACIÓN

**Antes de probar, verifica:**

- [ ] ✅ Webhook configurado en Twilio Console
- [ ] ✅ URL correcta en Twilio: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
- [ ] ✅ Método HTTP: POST
- [ ] ✅ Tu número unido al Sandbox (envíaste código `join`)
- [ ] ✅ Variables de Twilio configuradas en Render
- [ ] ✅ Servicio activo en Render

---

**¿Ya enviaste un mensaje de prueba? ¿Qué ves en los logs de Render? Avísame y verificamos que todo funcione correctamente. 🚀**
