# ✅ Configurar Variables de Twilio en Render

## 📋 TU INFORMACIÓN DE TWILIO

**Account SID:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Tipo de Cuenta:** Trial (Prueba) - ✅ Perfecto para usar Sandbox

**Balance:** $10.79 USD (crédito de prueba)

---

## ✅ VARIABLES A CONFIGURAR EN RENDER

Ve a **Render Dashboard** → Tu servicio `whatsapp-reminders` → **Environment**

### **Variable 1: TWILIO_ACCOUNT_SID**

- **Key:** `TWILIO_ACCOUNT_SID`
- **Value:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret:** ❌ No (puede ser pública)

---

### **Variable 2: TWILIO_AUTH_TOKEN** ⚠️ IMPORTANTE

**Para obtener tu Auth Token:**

1. **Ve a:** https://console.twilio.com/
2. **Haz clic en tu Account SID** (arriba a la derecha, donde dice `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. **Busca "Auth Token"** o **"Token de autenticación"**
4. **Haz clic en el ícono de ojo** 👁️ para mostrar/ocultar
5. **Copia el token completo**

**En Render:**
- **Key:** `TWILIO_AUTH_TOKEN`
- **Value:** `[pega el token que copiaste]`
- **Secret:** ✅ **SÍ (MARCAR COMO SECRET)** 🔒

---

### **Variable 3: TWILIO_WHATSAPP_FROM** ⭐ SANDBOX

- **Key:** `TWILIO_WHATSAPP_FROM`
- **Value:** `whatsapp:+14155238886`
- **Secret:** ❌ No
- **Nota:** Este es el número del Sandbox (gratis, no requiere cuenta de pago)

---

### **Variable 4: MY_WHATSAPP_NUMBER**

- **Key:** `MY_WHATSAPP_NUMBER`
- **Value:** `whatsapp:+57xxxxxxxxxx`
  - Reemplaza `+57xxxxxxxxxx` con tu número real
  - Formato: `whatsapp:+[código de país][número sin espacios ni guiones]`
  - Ejemplo Colombia: `whatsapp:+573001234567`
- **Secret:** ❌ No

---

## 📋 RESUMEN DE VARIABLES

| Variable | Valor | Secret |
|----------|-------|--------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | ❌ |
| `TWILIO_AUTH_TOKEN` | `[tu token aquí]` | ✅ **SÍ** |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | ❌ |
| `MY_WHATSAPP_NUMBER` | `whatsapp:+57xxxxxxxxxx` | ❌ |

---

## 🔧 PASOS PARA CONFIGURAR EN RENDER

### **PASO 1: Ir a Environment Variables**

1. **Render Dashboard** → https://dashboard.render.com/
2. **Haz clic en tu servicio:** `whatsapp-reminders`
3. **Pestaña izquierda** → **"Environment"** (Variables de Entorno)

### **PASO 2: Agregar cada Variable**

**Para cada variable:**

1. **Haz clic en "Add Environment Variable"**
2. **Ingresa Key y Value**
3. **Para `TWILIO_AUTH_TOKEN`:** Marca ☑️ **"Secret"**
4. **Haz clic en "Save"** o **"Add"**

### **PASO 3: Verificar**

**Después de agregar todas las variables, deberías ver:**

```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = ●●●●●●●●  (marcado como Secret)
TWILIO_WHATSAPP_FROM = whatsapp:+14155238886
MY_WHATSAPP_NUMBER = whatsapp:+57xxxxxxxxxx
```

### **PASO 4: Reiniciar Servicio**

**Después de agregar las variables:**

1. **Render reiniciará automáticamente** el servicio
2. **O haz clic en "Manual Deploy"** / **"Redeploy"** para forzar reinicio
3. **Espera 2-3 minutos** mientras Render despliega

---

## ✅ VERIFICAR QUE FUNCIONA

**Después de configurar las variables:**

1. **Ve a Render Logs**
2. **Busca en los logs:**
   ```
   [INIT] ✅ Conectado a la base de datos
   [INIT] ✅ Scheduler iniciado
   [INIT] ✅ Servidor escuchando en puerto 10000
   ```
   (NO deberías ver: "Variables de entorno faltantes: TWILIO_AUTH_TOKEN")

3. **Prueba crear un recordatorio** usando la API

---

## 🔒 IMPORTANTE: OBTENER AUTH TOKEN

**Si no sabes dónde encontrar tu Auth Token:**

1. **Ve a:** https://console.twilio.com/
2. **Arriba a la derecha**, verás tu Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **Haz clic en él**
4. **Verás un modal con información de tu cuenta:**
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `●●●●●●●●` (haz clic en el ícono 👁️ para mostrarlo)
5. **Copia el Auth Token completo**
6. **Pégalo en Render** (y marca como SECRET)

---

## 🎯 SIGUIENTE PASO: Unir Número al Sandbox

**Después de configurar las variables:**

1. **Ve a:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. **Busca el código de unión** (join code), ejemplo: `join happy-dog-123`
3. **Abre WhatsApp** en tu teléfono
4. **Envía mensaje a:** `+1 415 523 8886`
5. **Envía:** `join happy-dog-123` (tu código real)
6. **Recibirás confirmación**

---

## 📝 NOTA SOBRE LA CUENTA

**Tu cuenta es "Trial" (Prueba):**
- ✅ **Perfecto para usar WhatsApp Sandbox** (gratis)
- ✅ Tienes $10.79 de crédito (si actualizas a cuenta de pago)
- ✅ NO necesitas actualizar para usar el Sandbox
- ⚠️ El Sandbox es gratis y no consume créditos

**Solo actualiza a cuenta de pago si:**
- Quieres un número de WhatsApp propio (no Sandbox)
- Necesitas enviar a muchos números diferentes
- Estás construyendo algo comercial

**Para recordatorios personales: El Sandbox es suficiente. ✅**

---

**¿Ya obtuviste tu Auth Token y configuraste las variables en Render? Avísame cuando lo hagas y verificamos que todo funcione. 🚀**
