# 📱 Cómo Agregar un Número de WhatsApp Business en Meta

## ⚠️ Situación Actual

Tu cuenta de WhatsApp Business Manager **"ultralents"** no tiene números de teléfono agregados. Por eso el número anterior estaba bloqueado.

---

## 🎯 Opción 1: Verificar si Hay Números en Otras Cuentas

Antes de agregar un nuevo número, verifica si hay números en otras cuentas o portfolios:

### Paso 1: Revisar Todas las Cuentas

1. En WhatsApp Business Manager, ve a: **"Cuentas"** o **"Accounts"**
2. Verás una lista de todas las cuentas
3. Haz clic en **cada cuenta** y revisa:
   - ¿Tiene números de teléfono?
   - ¿Hay algún número verificado?

### Paso 2: Revisar Otros Portfolios

1. En Meta Business Suite, haz clic en el nombre del portfolio (arriba izquierda)
2. Verás un menú con todos los portfolios
3. Para cada portfolio:
   - Selecciónalo
   - Ve a: **Configuración** → **WhatsApp Business**
   - Revisa si hay números conectados

---

## ➕ Opción 2: Agregar un Nuevo Número de WhatsApp Business

Si no encuentras ningún número en otras cuentas, necesitas agregar uno nuevo.

### Requisitos Previos

Antes de agregar un número, necesitas:

1. ✅ **Un número de teléfono** (puede ser el +576017294750 o cualquier otro)
2. ✅ **El negocio verificado** (ya lo tienes: DISTRIBUIDORA ULTRALENTS SAS)
3. ✅ **Acceso de administrador** al portfolio

---

## 📋 Proceso para Agregar un Número

### Paso 1: Acceder a WhatsApp Business Manager

1. Ve a: **https://business.facebook.com/whatsapp**
2. Asegúrate de estar en el portfolio: **ultralents**

### Paso 2: Seleccionar la Cuenta

1. Ve a: **"Cuentas"** o **"Accounts"**
2. Selecciona la cuenta: **ultralents** (ID: 1281121247401247)
3. O crea una nueva cuenta si es necesario

### Paso 3: Agregar Número

1. Dentro de la cuenta, busca: **"Números de teléfono"** o **"Phone Numbers"**
2. Haz clic en: **"Agregar número"** o **"Add Phone Number"**
3. Sigue el proceso de verificación

---

## 🔄 Opción 3: Usar Twilio para Registrar el Número

Si ya tienes un número en Twilio, puedes conectarlo con Meta:

### Paso 1: Verificar Número en Twilio

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Verifica qué números tienes registrados
3. Anota el número que quieras usar

### Paso 2: Conectar con Meta

1. En Twilio Console, busca: **"WhatsApp Business"** o **"Messaging"** → **"Settings"**
2. Busca la opción para conectar con Meta Business Suite
3. Sigue el proceso de conexión

---

## 🆕 Opción 4: Solicitar un Nuevo Número en Twilio

Si no tienes un número adecuado, puedes solicitar uno nuevo en Twilio:

### Paso 1: Solicitar Número en Twilio

1. Ve a: **https://console.twilio.com/us1/develop/phone-numbers/manage/search**
2. Busca números disponibles para WhatsApp Business
3. Selecciona un número y comprarlo

### Paso 2: Verificar el Número

1. Una vez comprado, ve a: **WhatsApp Senders**
2. Verifica el número
3. Conéctalo con Meta Business Suite

---

## ⚠️ Importante: Verificación en Meta

Después de agregar el número, necesitas:

1. **Verificar el número** en Meta Business Suite
2. **Aprobar templates** para ese número
3. **Conectar con Twilio** (si usas Twilio)

---

## 🔍 Verificar Estado Actual

Mientras tanto, puedes verificar qué números están configurados actualmente:

```bash
# Ver todos los números configurados
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders

# Verificar un número específico (ej: +576017294750)
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/576017294750
```

---

## 📊 Situaciones Posibles

### Escenario 1: El Número Está en Otra Cuenta
- Busca en todas las cuentas de WhatsApp Business Manager
- Puede estar en otro portfolio

### Escenario 2: Necesitas Agregar un Nuevo Número
- Usa el teléfono del negocio: +576017294750
- O solicita uno nuevo en Twilio

### Escenario 3: El Número Está en Twilio pero No en Meta
- Necesitas conectarlo desde Twilio Console
- O agregarlo manualmente en Meta

---

## 🚨 Problema Actual

**El número anterior (+573043577875) estaba bloqueado porque:**
- No estaba correctamente conectado con Meta
- O no estaba verificado en WhatsApp Business Manager
- O había un problema de configuración

**Solución:**
- Agregar un número nuevo y verificado
- O encontrar el número correcto en otra cuenta

---

## ✅ Checklist

- [ ] Revisé todas las cuentas en WhatsApp Business Manager
- [ ] Revisé todos los portfolios en Meta Business Suite
- [ ] No encontré números en ninguna cuenta
- [ ] Decidí qué número usar (¿+576017294750 u otro?)
- [ ] Agregué el número en WhatsApp Business Manager
- [ ] Verifiqué el número en Meta
- [ ] Conecté el número con Twilio (si aplica)
- [ ] Aprobé templates para el número
- [ ] Actualicé `TWILIO_WHATSAPP_FROM` en Render

---

## 🎯 Próximos Pasos Recomendados

1. **Revisa todas las cuentas** en WhatsApp Business Manager
2. **Si no encuentras ningún número:**
   - Decide qué número usar (¿+576017294750?)
   - Agrégalo en WhatsApp Business Manager
   - Verifícalo en Meta
3. **Conecta con Twilio** si es necesario
4. **Actualiza la configuración** en Render

---

## 📞 Si Necesitas Ayuda

Comparte:
- ¿Qué números ves en otras cuentas?
- ¿Tienes acceso a agregar números?
- ¿Qué número quieres usar? (+576017294750 u otro?)

Con esa información te guío en el proceso específico.
