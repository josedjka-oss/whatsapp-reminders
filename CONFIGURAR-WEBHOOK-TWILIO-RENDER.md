# 🔗 Configurar Webhook de Twilio en Render

## 🔴 PROBLEMA

**Después de enviar mensajes a Twilio, no estás recibiendo las respuestas.**

Esto significa que el **webhook de Twilio no está configurado correctamente** o **no está apuntando a la URL correcta de Render**.

---

## ✅ SOLUCIÓN: Configurar Webhook en Twilio Console

### **PASO 1: Obtener URL del Webhook en Render**

Tu URL del webhook en Render es:
```
https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp
```

**Verifica que esta URL esté funcionando:**
1. Abre en tu navegador: `https://whatsapp-reminders-mzex.onrender.com/health`
2. Debe responder con `{"status":"ok",...}`

---

### **PASO 2: Configurar Webhook en Twilio Console**

#### **2.1 Ir a Twilio Console**

1. **Ve a:** https://console.twilio.com/
2. **Haz clic en "Messaging"** (Mensajería) en el menú lateral
3. **Haz clic en "Try it out"** → **"Send a WhatsApp message"**
   - O ve directamente a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

#### **2.2 Configurar el Webhook**

1. **Busca la sección "Configuration"** o **"Configuración"**
2. **Busca el campo "WHEN A MESSAGE COMES IN"** o **"CUANDO LLEGUE UN MENSAJE"**
3. **Pega esta URL:**
   ```
   https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp
   ```
4. **Selecciona el método:** **HTTP POST**
5. **Haz clic en "Save"** o **"Guardar"**

---

### **PASO 3: Verificar Configuración**

**Después de guardar, deberías ver:**
- ✅ URL del webhook configurada correctamente
- ✅ Método: POST
- ✅ Estado: Activo

---

## 🔍 VERIFICAR QUE EL WEBHOOK FUNCIONA

### **Opción 1: Ver Logs en Render**

1. **Ve a Render Dashboard** → Tu servicio web `whatsapp-reminders`
2. **Haz clic en "Logs"** en la pestaña izquierda
3. **Envía un mensaje de prueba** a tu número de Twilio desde WhatsApp
4. **Deberías ver en los logs:**
   ```
   [WEBHOOK] ========== WEBHOOK RECIBIDO ==========
   [WEBHOOK] Método: POST
   [WEBHOOK] URL: /webhooks/twilio/whatsapp
   [WEBHOOK] 📩 Mensaje recibido de whatsapp:+... → whatsapp:+...
   ```

### **Opción 2: Verificar en Twilio Console**

1. **Ve a Twilio Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. **Busca "Webhook Logs"** o **"Registros de Webhook"**
3. **Deberías ver:**
   - ✅ Peticiones exitosas (200 OK)
   - ✅ O errores si hay algún problema

---

## 🆘 SI EL WEBHOOK SIGUE SIN FUNCIONAR

### **Problema 1: URL Incorrecta**

**Síntoma:** No ves logs del webhook en Render

**Solución:**
- Verifica que la URL en Twilio sea **exactamente:**
  ```
  https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp
  ```
- **No debe tener** espacios, saltos de línea, o caracteres extra
- **Debe ser HTTPS** (no HTTP)
- **No debe tener** `/` al final

### **Problema 2: Validación de Firma Rechazando**

**Síntoma:** Ves logs pero dice "Firma de Twilio inválida"

**Solución:**
- Verifica que `TWILIO_AUTH_TOKEN` esté correctamente configurado en Render
- Verifica que el token sea el **Auth Token actual** de Twilio (no Account SID)
- Si el problema persiste, temporalmente puedes deshabilitar la validación en desarrollo

### **Problema 3: Render Bloqueando Peticiones**

**Síntoma:** No ves ningún log del webhook

**Solución:**
- Verifica que el servicio web esté **activo** (no pausado)
- Verifica que la URL sea **pública** (Render Starter permite tráfico público)
- Prueba hacer una petición manual con curl:
  ```bash
  curl -X POST https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "From=whatsapp:+14155238886&To=whatsapp:+57xxxxxxxxxx&Body=test"
  ```

### **Problema 4: Webhook No Configurado en Twilio**

**Síntoma:** No has configurado el webhook en Twilio Console

**Solución:**
- Sigue los pasos del **PASO 2** arriba
- Asegúrate de guardar los cambios en Twilio

---

## 📋 CHECKLIST

**Verifica que tengas:**

- [ ] ✅ Webhook configurado en Twilio Console
- [ ] ✅ URL correcta: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
- [ ] ✅ Método: **HTTP POST**
- [ ] ✅ `TWILIO_AUTH_TOKEN` configurado en Render
- [ ] ✅ Servicio web activo en Render
- [ ] ✅ Logs habilitados en Render para ver peticiones entrantes

---

## 🔧 PROBAR EL WEBHOOK

**Para probar que el webhook funciona:**

1. **Configura el webhook** en Twilio Console (PASO 2)
2. **Envía un mensaje de WhatsApp** a tu número de Twilio desde tu teléfono
3. **Verifica los logs de Render** - Deberías ver:
   ```
   [WEBHOOK] ========== WEBHOOK RECIBIDO ==========
   [WEBHOOK] 📩 Mensaje recibido de whatsapp:+57xxxxxxxxxx → whatsapp:+14155238886: "Hola"
   [WEBHOOK] ✅ Mensaje guardado en DB
   [WEBHOOK] ✅ Mensaje reenviado a WhatsApp personal
   ```
4. **Verifica tu WhatsApp personal** - Deberías recibir el mensaje reenviado con formato:
   ```
   📩 Respuesta de whatsapp:+57xxxxxxxxxx:
   
   Hola
   ```

---

## 📝 NOTA IMPORTANTE

**Si estás usando Twilio WhatsApp Sandbox:**

- El número de sandbox es: `whatsapp:+14155238886`
- Debes enviar el código de unión primero: `join <palabra-secreta>`
- Solo puedes recibir mensajes de números que estén unidos al sandbox
- El webhook funciona igual para sandbox y números aprobados

---

**¿Ya configuraste el webhook en Twilio Console? Verifica los logs de Render y avísame si ves peticiones entrantes. 🔗**
