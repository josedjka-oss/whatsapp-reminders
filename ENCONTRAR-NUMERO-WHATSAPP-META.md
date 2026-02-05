# 📱 Cómo Encontrar el Número de WhatsApp Business Verificado

## ⚠️ Importante
El **teléfono del negocio** (+576017294750) puede ser **diferente** al **número de WhatsApp Business** verificado.

Necesitas encontrar el número específico de WhatsApp Business, no solo el teléfono del negocio.

---

## 🎯 Paso 1: Acceder a WhatsApp Business Manager

### Opción A: Desde Meta Business Suite

1. Ve a: **https://business.facebook.com/**
2. Asegúrate de estar en el portfolio: **ultralents**
3. En el menú lateral izquierdo, busca: **"WhatsApp"** o **"WhatsApp Business"**
4. Haz clic en **"WhatsApp Business Manager"** o **"Administrador de WhatsApp Business"**

### Opción B: Acceso Directo

1. Ve a: **https://business.facebook.com/whatsapp**
2. O: **https://business.facebook.com/settings/whatsapp-business**

---

## 🔍 Paso 2: Ver Cuentas de WhatsApp Business

1. En WhatsApp Business Manager, busca la sección: **"Cuentas"** o **"Accounts"**
2. Verás una lista de todas las cuentas de WhatsApp Business asociadas
3. Haz clic en la cuenta que quieras verificar

---

## 📱 Paso 3: Ver Números de Teléfono

1. Dentro de la cuenta, busca: **"Números de teléfono"** o **"Phone Numbers"**
2. Verás una lista de todos los números asociados
3. Para cada número, verás:
   - **Número completo**: +57XXXXXXXXXX
   - **Estado**: ✅ Verificado / ⚠️ Pendiente / ❌ No verificado
   - **Fecha de verificación**
   - **Templates aprobados**

---

## 🔎 Paso 4: Identificar el Número Verificado

Busca el número que tenga:
- ✅ **Estado**: "Verificado" o "Verified"
- 📅 **Fecha reciente**: Preferiblemente después del 4 feb 2026
- 📝 **Templates aprobados**: Al menos un template aprobado

**Anota este número:** `+57XXXXXXXXXX`

---

## 📋 Paso 5: Verificar en Configuración de WhatsApp Business

### Método Alternativo

1. Ve a: **https://business.facebook.com/settings/whatsapp-business**
2. Busca la sección: **"Números de WhatsApp Business"**
3. Verás todos los números conectados
4. Revisa el estado de cada uno

---

## 🔧 Paso 6: Verificar en Twilio Console

Una vez que identifiques el número, verifica en Twilio:

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el número que identificaste (ej: +576017294750 o el que encuentres)
3. Verifica que:
   - ✅ Esté listado
   - ✅ Estado sea "Verified" o "Active"
   - ❌ NO esté "Locked" o "Blocked"

---

## 🧪 Paso 7: Usar el Endpoint para Verificar

Puedes usar el endpoint que creamos para verificar el estado:

```bash
# Si el número es +576017294750
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/576017294750

# O ver todos los números
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
```

---

## 📊 Información que Tienes Actualmente

Basado en lo que compartiste:

- **Portfolio**: ultralents
- **ID Portfolio**: 1245193047190166
- **Negocio**: DISTRIBUIDORA ULTRALENTS SAS
- **Estado Negocio**: ✅ Verificado (4 feb 2026)
- **Teléfono Negocio**: +576017294750 ⚠️ (Este puede NO ser el de WhatsApp)

---

## ⚠️ Posibles Escenarios

### Escenario 1: El número del negocio ES el de WhatsApp
- Si +576017294750 está verificado como WhatsApp Business
- Entonces ese es el número a usar

### Escenario 2: Hay otro número de WhatsApp
- Puede haber otro número específico para WhatsApp Business
- Necesitas encontrarlo en WhatsApp Business Manager

### Escenario 3: El número está en otra cuenta
- Puede estar en otro portfolio o cuenta de Meta
- Revisa todos los portfolios que tengas acceso

---

## 🔍 Dónde Buscar Específicamente

### Ubicación 1: WhatsApp Business Manager → Cuentas
```
https://business.facebook.com/whatsapp
→ Cuentas → [Selecciona cuenta] → Números de teléfono
```

### Ubicación 2: Configuración → WhatsApp Business
```
https://business.facebook.com/settings/whatsapp-business
→ Números de WhatsApp Business
```

### Ubicación 3: Configuración → Verificación del negocio
```
https://business.facebook.com/settings
→ Verificación del negocio → [Selecciona negocio] → Números asociados
```

---

## ✅ Checklist

Usa esta lista para verificar:

- [ ] Accedí a WhatsApp Business Manager
- [ ] Revisé todas las cuentas de WhatsApp Business
- [ ] Revisé todos los números de teléfono
- [ ] Identifiqué el número con estado "Verificado" ✅
- [ ] Anoté el número completo: +57XXXXXXXXXX
- [ ] Verifiqué que el número esté en Twilio Console
- [ ] Verifiqué el estado del número usando el endpoint

---

## 🚨 Si No Encuentras el Número

Si no ves ningún número de WhatsApp Business:

1. **Verifica que tengas permisos:**
   - Asegúrate de ser administrador del portfolio
   - Verifica que tengas acceso a WhatsApp Business Manager

2. **Revisa otros portfolios:**
   - Puede estar en otro portfolio
   - Revisa todos los portfolios a los que tengas acceso

3. **Contacta soporte de Meta:**
   - Si el negocio está verificado pero no ves números
   - Puede necesitar configuración adicional

---

## 📞 Próximos Pasos

Una vez que identifiques el número:

1. **Comparte el número** que encontraste
2. **Verificaremos** si está en Twilio
3. **Actualizaremos** la configuración si es necesario
4. **Probaremos** enviando un mensaje

---

## 🎯 Resumen

**Lo que necesitas encontrar:**
- El número de **WhatsApp Business** verificado
- NO solo el teléfono del negocio
- Debe estar en **WhatsApp Business Manager** → **Cuentas** → **Números**

**Dónde buscar:**
1. https://business.facebook.com/whatsapp
2. https://business.facebook.com/settings/whatsapp-business

**Qué buscar:**
- Número con estado "Verificado" ✅
- Fecha de verificación reciente
- Templates aprobados
