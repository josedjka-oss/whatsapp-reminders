# 🔗 Guía Completa: Configurar Webhook de Twilio

## 📖 ¿QUÉ ES UN WEBHOOK?

**Un webhook es una URL que Twilio llama automáticamente cuando recibes un mensaje de WhatsApp.**

**Flujo:**
1. Alguien envía un mensaje a tu número de Twilio (`+1 415 523 8886`)
2. Twilio recibe el mensaje
3. Twilio llama automáticamente a tu webhook (tu URL en Render)
4. Tu aplicación procesa el mensaje y lo reenvía a tu WhatsApp personal

**Sin webhook configurado:**
- ❌ Twilio recibe el mensaje pero no sabe dónde enviarlo
- ❌ Tu aplicación nunca se entera del mensaje
- ❌ No recibes las respuestas

**Con webhook configurado:**
- ✅ Twilio llama a tu URL automáticamente
- ✅ Tu aplicación recibe el mensaje
- ✅ El mensaje se guarda en la base de datos
- ✅ El mensaje se reenvía a tu WhatsApp personal

---

## 🎯 PASO A PASO: Configurar Webhook en Twilio

### **PASO 1: Acceder a Twilio Console**

1. **Abre tu navegador** y ve a: https://console.twilio.com/
2. **Inicia sesión** con tu cuenta de Twilio
3. **Verás el Dashboard** de Twilio

---

### **PASO 2: Ir a WhatsApp Sandbox**

**Opción A: Desde el menú lateral**

1. **En el menú izquierdo**, busca **"Messaging"** (Mensajería)
2. **Haz clic en "Messaging"**
3. **Busca "Try it out"** o **"Pruébalo"**
4. **Haz clic en "Send a WhatsApp message"** o **"Enviar un mensaje de WhatsApp"**

**Opción B: URL directa**

1. **Ve directamente a:**
   ```
   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   ```

---

### **PASO 3: Encontrar la Sección de Configuración**

**En la página de WhatsApp Sandbox, verás:**

1. **Número de Sandbox:** `+1 415 523 8886`
2. **Código de unión:** `join <palabra-secreta>` (ejemplo: `join happy-dog-123`)
3. **Sección "Configuration"** o **"Configuración"**

**Busca específicamente:**
- Un campo que dice **"WHEN A MESSAGE COMES IN"** o **"CUANDO LLEGUE UN MENSAJE"**
- O un campo que dice **"Webhook URL"**
- O un botón que dice **"Configure"** o **"Configurar"**

---

### **PASO 4: Configurar la URL del Webhook**

**Tu URL del webhook es:**
```
https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp
```

**Pasos:**

1. **Encuentra el campo de texto** para la URL del webhook
2. **Borra cualquier URL que esté ahí** (si hay una)
3. **Pega exactamente esta URL:**
   ```
   https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp
   ```
4. **Verifica que:**
   - ✅ Comienza con `https://` (no `http://`)
   - ✅ No tiene espacios al inicio o al final
   - ✅ No tiene `/` al final
   - ✅ Está completa y correcta

---

### **PASO 5: Seleccionar el Método HTTP**

**Debes seleccionar el método HTTP:**

1. **Busca un dropdown o selector** que dice:
   - **"HTTP Method"** o **"Método HTTP"**
   - O botones de radio con opciones: `GET`, `POST`, etc.

2. **Selecciona:** **HTTP POST** o **POST**

   ⚠️ **IMPORTANTE:** Debe ser **POST**, NO GET

---

### **PASO 6: Guardar la Configuración**

1. **Busca el botón "Save"** o **"Guardar"**
2. **Haz clic en "Save"**
3. **Espera confirmación** (puede decir "Configuration saved" o "Configuración guardada")

---

## 📸 DESCRIPCIÓN VISUAL DE LA INTERFAZ

**La interfaz de Twilio puede verse así:**

```
┌─────────────────────────────────────────────────┐
│  WhatsApp Sandbox                               │
├─────────────────────────────────────────────────┤
│                                                  │
│  Send a WhatsApp message                        │
│                                                  │
│  Sandbox number: +1 415 523 8886                │
│  Join code: join happy-dog-123                  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Configuration                            │  │
│  │                                           │  │
│  │ WHEN A MESSAGE COMES IN:                 │  │
│  │ ┌─────────────────────────────────────┐  │  │
│  │ │ https://whatsapp-reminders...      │  │  │
│  │ └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │ HTTP Method: [POST ▼]                    │  │
│  │                                           │  │
│  │ [Save] [Cancel]                          │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔍 DÓNDE ENCONTRAR LA CONFIGURACIÓN (Diferentes Versiones de Twilio)

### **Versión 1: Interfaz Clásica**

**Si ves una página con pestañas:**

1. **Busca la pestaña "Configuration"** o **"Configuración"**
2. **Haz clic en esa pestaña**
3. **Verás el campo "WHEN A MESSAGE COMES IN"**

### **Versión 2: Interfaz Moderna**

**Si ves una página con secciones colapsables:**

1. **Busca una sección que dice "Webhook"** o **"Configuration"**
2. **Haz clic para expandirla**
3. **Verás el campo para la URL**

### **Versión 3: Menú de Configuración**

**Si ves un botón de configuración:**

1. **Busca un botón con ícono de engranaje** ⚙️ o **"Settings"**
2. **Haz clic en él**
3. **Busca "Webhook URL"** o **"Incoming Webhook"**

---

## ✅ VERIFICAR QUE ESTÁ CONFIGURADO

**Después de guardar, verifica:**

1. **La URL debe aparecer en el campo:**
   ```
   https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp
   ```

2. **El método debe ser:** `POST` o `HTTP POST`

3. **Debe haber un indicador de estado:**
   - ✅ "Active" o "Activo"
   - ✅ "Configured" o "Configurado"
   - ✅ Un checkmark verde ✓

---

## 🧪 PROBAR EL WEBHOOK

### **Paso 1: Enviar Mensaje de Prueba**

1. **Abre WhatsApp** en tu teléfono
2. **Envía un mensaje** al número: `+1 415 523 8886`
3. **Escribe cualquier mensaje**, por ejemplo: `Hola, esto es una prueba`

### **Paso 2: Verificar en Render Logs**

1. **Ve a Render Dashboard** → Tu servicio `whatsapp-reminders`
2. **Haz clic en "Logs"** en la pestaña izquierda
3. **Busca en los logs** (últimos 1-2 minutos)

**Deberías ver:**
```
[WEBHOOK] ========== WEBHOOK RECIBIDO ==========
[WEBHOOK] Método: POST
[WEBHOOK] URL: /webhooks/twilio/whatsapp
[WEBHOOK] 📩 Mensaje recibido de whatsapp:+57xxxxxxxxxx → whatsapp:+14155238886: "Hola, esto es una prueba"
[WEBHOOK] ✅ Mensaje guardado en DB (ID: ...)
[WEBHOOK] ✅ Mensaje reenviado a WhatsApp personal
[WEBHOOK] ✅ Webhook procesado exitosamente en Xms
```

### **Paso 3: Verificar en tu WhatsApp Personal**

**Deberías recibir un mensaje en tu WhatsApp personal con formato:**
```
📩 Respuesta de whatsapp:+57xxxxxxxxxx:

Hola, esto es una prueba
```

---

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### **Problema 1: No encuentro la sección de configuración**

**Solución:**
- Busca en la misma página de "Send a WhatsApp message"
- Busca un botón "Configure" o "Settings"
- O busca "Webhook" en el menú lateral
- Si no lo encuentras, intenta buscar "Incoming webhook" o "Webhook entrante"

### **Problema 2: El campo está deshabilitado o bloqueado**

**Solución:**
- Verifica que tu cuenta esté activa
- Asegúrate de estar en la sección correcta (WhatsApp Sandbox, no SMS)
- Intenta refrescar la página

### **Problema 3: No puedo guardar la configuración**

**Solución:**
- Verifica que la URL sea válida (debe comenzar con `https://`)
- Verifica que no haya espacios extra
- Asegúrate de seleccionar el método POST
- Intenta guardar de nuevo

### **Problema 4: El webhook no recibe mensajes**

**Solución:**
1. **Verifica la URL** en Twilio Console (debe ser exacta)
2. **Verifica que el método sea POST**
3. **Verifica que tu servicio en Render esté activo**
4. **Verifica los logs de Render** para ver si hay errores
5. **Verifica que tu número esté unido al Sandbox** (envíaste código `join`)

### **Problema 5: Veo errores 403 en los logs**

**Solución:**
- Esto significa que la validación de firma de Twilio está fallando
- Verifica que `TWILIO_AUTH_TOKEN` esté correctamente configurado en Render
- Verifica que el token sea el correcto (no el Account SID)

---

## 📋 CHECKLIST COMPLETO

**Antes de probar, verifica:**

- [ ] ✅ Tu número está unido al Sandbox (envíaste código `join`)
- [ ] ✅ Webhook configurado en Twilio Console
- [ ] ✅ URL correcta: `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
- [ ] ✅ Método HTTP: **POST**
- [ ] ✅ Configuración guardada en Twilio
- [ ] ✅ Variables de Twilio configuradas en Render:
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN` (marcado como SECRET)
  - [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`
  - [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+57xxxxxxxxxx`
- [ ] ✅ Servicio activo en Render
- [ ] ✅ Logs de Render accesibles

---

## 🎯 RESUMEN RÁPIDO

**Para configurar el webhook:**

1. **Ve a:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. **Busca:** "Configuration" o "WHEN A MESSAGE COMES IN"
3. **Pega:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`
4. **Selecciona:** HTTP POST
5. **Guarda**

**Para probar:**

1. **Envía mensaje** desde WhatsApp a `+1 415 523 8886`
2. **Verifica logs** en Render
3. **Verifica** que recibas el mensaje reenviado en tu WhatsApp personal

---

## 📞 SI NECESITAS AYUDA

**Si después de seguir estos pasos el webhook no funciona:**

1. **Comparte una captura de pantalla** de la configuración en Twilio Console
2. **Comparte los logs de Render** (últimos 5 minutos)
3. **Indica qué error específico ves** (si hay alguno)

**Con esa información podré ayudarte a diagnosticar el problema específico.**

---

**¿Ya encontraste la sección de configuración en Twilio Console? Si tienes dudas sobre algún paso específico, avísame y te ayudo. 🔗**
