# 📱 Configurar Nuevo Número de WhatsApp Business

## ✅ Situación

- ⚠️ El número `+573043577875` está bloqueado en verificación (3 semanas)
- ✅ Tienes otro número de WhatsApp Business disponible
- 🎯 Necesitas configurarlo ahora

---

## 🔍 Paso 1: Obtener Información del Nuevo Número

**Necesito que me compartas:**

1. **¿Cuál es el número?** (formato: +57XXXXXXXXXX)
2. **¿Está ya registrado en Twilio?**
   - Si SÍ: ¿Cuál es su estado? (Online, Pending, etc.)
   - Si NO: Necesitamos registrarlo primero
3. **¿Está ya agregado en Meta WhatsApp Business Manager?**
   - Si SÍ: ¿En qué cuenta/portfolio?
   - Si NO: Lo agregaremos

---

## 📋 Paso 2: Verificar en Twilio Console

### Si el Número Ya Está en Twilio:

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el nuevo número
3. Verifica:
   - ✅ Estado: Debe ser "Online" o "Verified"
   - ✅ Business display name
   - ✅ Quality rating
   - ✅ Throughput

### Si el Número NO Está en Twilio:

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Haz clic en: **"Create new sender"**
3. Sigue el proceso para registrar el número
4. Verifícalo para WhatsApp Business

---

## 📱 Paso 3: Agregar en Meta WhatsApp Business Manager

### Si el Número NO Está en Meta:

1. Ve a: **https://business.facebook.com/whatsapp**
2. **Asegúrate de estar en el portfolio correcto:**
   - Selecciona: **"ultralents"** (el verificado)
   - NO el que está "En revisión"

3. Selecciona la cuenta: **"ultralents"**
4. Ve a: **"Números de teléfono"** o **"Phone Numbers"**
5. Haz clic en: **"Agregar número"** o **"Add Phone Number"**
6. Ingresa el nuevo número
7. Completa la verificación (SMS, Email, o Automática desde Twilio)

### Si el Número Ya Está en Meta:

1. Verifica que esté en el portfolio correcto "ultralents"
2. Si está en otro portfolio, transfiérelo o úsalo desde ahí

---

## 🔧 Paso 4: Verificar Templates

1. En Twilio Console, ve a: **Messaging** → **Content Templates**
2. Verifica que el template `HX1d443af43266b056998367e82a4441bd` esté:
   - ✅ Aprobado
   - ✅ Asociado al nuevo número
3. Si no está asociado, apruebalo para el nuevo número

---

## ⚙️ Paso 5: Actualizar Configuración en Render

1. Ve a: **Render Dashboard** → Tu servicio → **Environment**
2. Busca: `TWILIO_WHATSAPP_FROM`
3. Actualiza a: `whatsapp:+57XXXXXXXXXX` (el nuevo número)
4. Guarda los cambios
5. Render reiniciará automáticamente

---

## 🧪 Paso 6: Probar el Nuevo Número

### Verificar Estado:

```bash
# Reemplaza XXXXXXXX con el nuevo número (sin el +57)
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/57XXXXXXXXXX
```

### Crear Recordatorio de Prueba:

1. Ve a: **https://whatsapp-reminders.vercel.app/chat**
2. Escribe: "Recuérdame en 5 minutos probar el nuevo número"
3. Verifica que llegue al WhatsApp

---

## 📋 Checklist

- [ ] Obtuve la información del nuevo número
- [ ] Verifiqué el estado en Twilio Console
- [ ] Si no estaba en Twilio, lo registré
- [ ] Agregué el número en Meta WhatsApp Business Manager
- [ ] Verifiqué que los templates estén aprobados
- [ ] Actualicé `TWILIO_WHATSAPP_FROM` en Render
- [ ] Probé enviando un mensaje

---

## 🎯 Resumen

**Proceso:**
1. **Comparte** el nuevo número
2. **Verificamos** su estado en Twilio
3. **Lo agregamos** en Meta (si no está)
4. **Actualizamos** la configuración en Render
5. **Probamos** que funcione

**¿Cuál es el nuevo número de WhatsApp Business que quieres usar?** Compártelo y te guío paso a paso para configurarlo.
