# 🔍 Verificar Número de WhatsApp Business Antes de Agregarlo

## ⚠️ Diferencia Importante

**Hay DOS tipos de WhatsApp Business:**

1. ❌ **WhatsApp Business Personal (App Móvil)**
   - Se usa desde la app en el teléfono
   - NO funciona con Twilio API
   - NO se puede usar para enviar mensajes programados por API

2. ✅ **WhatsApp Business API (Twilio/Meta)**
   - Se usa a través de Twilio API
   - SÍ funciona con tu sistema
   - SÍ se puede usar para enviar mensajes programados

**Si el número está en WhatsApp Business personal (app móvil), NO puedes usarlo directamente con Twilio.**

---

## 🔍 Paso 1: Verificar Dónde Está el Número

### Preguntas Clave:

1. **¿El número está en la app "WhatsApp Business" en tu teléfono?**
   - Si SÍ: Está en WhatsApp Business personal (NO sirve para API)
   - Si NO: Puede estar en WhatsApp Business API

2. **¿Puedes enviar mensajes desde la app del teléfono con ese número?**
   - Si SÍ: Está en WhatsApp Business personal
   - Si NO: Puede estar en WhatsApp Business API

3. **¿El número está registrado en Twilio Console?**
   - Ve a: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
   - Busca el número
   - Si está ahí: Puede funcionar con API

4. **¿El número está en Meta WhatsApp Business Manager?**
   - Ve a: https://business.facebook.com/whatsapp
   - Busca el número en las cuentas
   - Si está ahí: Puede funcionar con API

---

## ✅ Paso 2: Verificar en Twilio Console

### Si el Número Ya Está en Twilio:

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el nuevo número
3. Verifica:
   - ✅ **Estado**: Debe ser "Online" o "Verified"
   - ✅ **Business display name**: Nombre del negocio
   - ✅ **Quality rating**: Debe tener un rating (no "Unavailable")
   - ✅ **Throughput**: Límite de mensajes

**Si está en Twilio con estado "Online":**
- ✅ **SÍ puedes usarlo** con tu sistema
- ✅ Solo necesitas agregarlo en Meta (si no está)
- ✅ Actualizar la configuración en Render

---

## 📱 Paso 3: Verificar en Meta WhatsApp Business Manager

### Si el Número Ya Está en Meta:

1. Ve a: **https://business.facebook.com/whatsapp**
2. Revisa todas las cuentas
3. Busca el nuevo número
4. Verifica:
   - ✅ En qué cuenta está
   - ✅ Estado del número (Verificado, Pendiente, etc.)
   - ✅ Si está en el portfolio correcto "ultralents"

**Si está en Meta:**
- ✅ Puede funcionar con API
- ⚠️ Verifica que esté en el portfolio correcto
- ⚠️ Verifica que esté verificado

---

## ⚠️ Paso 4: Si el Número Está en WhatsApp Business Personal (App Móvil)

### Problema:

Si el número está en la app "WhatsApp Business" en tu teléfono:
- ❌ NO funciona directamente con Twilio API
- ❌ NO puedes enviar mensajes programados desde la API
- ❌ Necesitas migrarlo a WhatsApp Business API

### Soluciones:

#### Opción 1: Migrar a WhatsApp Business API

1. **Desconecta el número de la app móvil:**
   - Elimina WhatsApp Business del teléfono
   - O elimina la cuenta de WhatsApp Business

2. **Regístralo en Twilio:**
   - Ve a Twilio Console
   - Registra el número para WhatsApp Business API
   - Verifícalo

3. **Agrégalo en Meta WhatsApp Business Manager:**
   - Conéctalo con Meta
   - Verifícalo

**⚠️ Advertencia:** Esto eliminará todos los chats y mensajes de la app móvil.

#### Opción 2: Usar Otro Número

1. **Mantén el número en la app móvil** (para uso personal)
2. **Solicita un nuevo número en Twilio** para la API
3. **Usa el nuevo número** para mensajes programados

---

## ✅ Paso 5: Checklist Antes de Agregar

Antes de intentar agregar el número, verifica:

- [ ] ¿El número está en Twilio Console?
  - Si SÍ: ¿Cuál es su estado? (Online, Pending, etc.)
  - Si NO: Necesitas registrarlo primero

- [ ] ¿El número está en Meta WhatsApp Business Manager?
  - Si SÍ: ¿En qué cuenta/portfolio?
  - Si NO: Necesitas agregarlo

- [ ] ¿El número está en WhatsApp Business personal (app móvil)?
  - Si SÍ: NO puedes usarlo con API (necesitas migrarlo o usar otro)
  - Si NO: Puede funcionar con API

- [ ] ¿El número tiene templates aprobados en Twilio?
  - Si SÍ: Puedes usarlo
  - Si NO: Necesitas aprobar templates

---

## 🎯 Resumen

**Para que el número funcione con tu sistema:**

1. ✅ Debe estar registrado en **Twilio Console** (estado "Online")
2. ✅ Debe estar agregado en **Meta WhatsApp Business Manager**
3. ✅ Debe estar en el portfolio correcto "ultralents" (verificado)
4. ✅ Debe tener **templates aprobados** en Twilio
5. ❌ NO debe estar solo en WhatsApp Business personal (app móvil)

---

## 📋 Información que Necesito

**Comparte esta información:**

1. **¿Cuál es el número?** (formato: +57XXXXXXXXXX)
2. **¿Está en Twilio Console?**
   - Si SÍ: ¿Cuál es su estado?
   - Si NO: Necesitamos registrarlo
3. **¿Está en Meta WhatsApp Business Manager?**
   - Si SÍ: ¿En qué cuenta?
   - Si NO: Lo agregamos
4. **¿Está en WhatsApp Business personal (app móvil)?**
   - Si SÍ: Necesitamos migrarlo o usar otro número
   - Si NO: Puede funcionar

Con esa información te digo exactamente qué hacer para configurarlo.
