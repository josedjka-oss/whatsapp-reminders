# 🔍 Verificar Credenciales Twilio en Render

## ❌ Problema Actual

El webhook recibe mensajes correctamente, pero falla al reenviarlos con error:
```
Error: Authenticate (código 20003)
```

Esto significa que las **credenciales de Twilio no están configuradas correctamente** en Render.

---

## ✅ Solución: Verificar Variables de Entorno en Render

### **Paso 1: Ir a Render Dashboard**

1. Ve a: https://dashboard.render.com
2. Inicia sesión
3. Haz clic en tu servicio: **`whatsapp-reminders`**

### **Paso 2: Ir a Environment Variables**

1. En el menú lateral, haz clic en **"Environment"**
2. Verás todas las variables de entorno configuradas

### **Paso 3: Verificar Variables Requeridas**

Debes tener **EXACTAMENTE** estas 4 variables:

#### **1. TWILIO_ACCOUNT_SID**
- **Valor esperado:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Tipo:** Normal (no secret)
- **Verificar:**
  - ✅ Existe la variable
  - ✅ El valor es exactamente: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - ✅ No tiene espacios al inicio o final
  - ✅ No tiene comillas

#### **2. TWILIO_AUTH_TOKEN**
- **Valor esperado:** `20bc1efaed4966c3f221f48fd885aa69lo`
- **Tipo:** **SECRET** (debe estar marcado como secret)
- **Verificar:**
  - ✅ Existe la variable
  - ✅ Está marcada como **SECRET** (debe tener un candado 🔒)
  - ✅ El valor es exactamente: `20bc1efaed4966c3f221f48fd885aa69lo`
  - ✅ No tiene espacios al inicio o final
  - ✅ No tiene comillas

#### **3. TWILIO_WHATSAPP_FROM**
- **Valor esperado:** `whatsapp:+14155238886`
- **Tipo:** Normal (no secret)
- **Verificar:**
  - ✅ Existe la variable
  - ✅ El valor es exactamente: `whatsapp:+14155238886`
  - ✅ Incluye el prefijo `whatsapp:`
  - ✅ No tiene espacios al inicio o final

#### **4. MY_WHATSAPP_NUMBER**
- **Valor esperado:** `whatsapp:+573024002656` (tu número)
- **Tipo:** Normal (no secret)
- **Verificar:**
  - ✅ Existe la variable
  - ✅ El valor es exactamente: `whatsapp:+573024002656`
  - ✅ Incluye el prefijo `whatsapp:`
  - ✅ No tiene espacios al inicio o final

---

## 🔧 Cómo Corregir Variables

### **Si falta una variable:**

1. Haz clic en **"Add Environment Variable"**
2. Ingresa el **Key** (nombre de la variable)
3. Ingresa el **Value** (valor exacto, sin espacios)
4. Si es `TWILIO_AUTH_TOKEN`, marca **"Secret"**
5. Haz clic en **"Save Changes"**

### **Si una variable tiene el valor incorrecto:**

1. Haz clic en el **lápiz ✏️** junto a la variable
2. Corrige el valor (sin espacios, sin comillas)
3. Haz clic en **"Save Changes"**

### **Si `TWILIO_AUTH_TOKEN` no está marcado como SECRET:**

1. Haz clic en el **lápiz ✏️** junto a `TWILIO_AUTH_TOKEN`
2. Marca la casilla **"Secret"** 🔒
3. Haz clic en **"Save Changes"**

---

## 🚀 Después de Corregir

1. **Render redesplegará automáticamente** cuando guardes los cambios
2. **Espera 2-3 minutos** a que termine el despliegue
3. **Envía otro mensaje de prueba** desde WhatsApp
4. **Verifica los logs** - deberías ver:
   ```
   [TWILIO] Verificando credenciales...
   [TWILIO] TWILIO_ACCOUNT_SID: AC80a86a3e...
   [TWILIO] TWILIO_AUTH_TOKEN: 20bc1efaed...
   [TWILIO] Enviando mensaje...
   [TWILIO] Mensaje enviado exitosamente. SID: SM...
   ```

---

## 📋 Checklist de Verificación

- [ ] `TWILIO_ACCOUNT_SID` existe y tiene el valor correcto
- [ ] `TWILIO_AUTH_TOKEN` existe, tiene el valor correcto y está marcado como SECRET
- [ ] `TWILIO_WHATSAPP_FROM` existe y tiene el valor correcto (con prefijo `whatsapp:`)
- [ ] `MY_WHATSAPP_NUMBER` existe y tiene el valor correcto (con prefijo `whatsapp:`)
- [ ] Ninguna variable tiene espacios al inicio o final
- [ ] Ninguna variable tiene comillas
- [ ] Render redesplegó después de los cambios

---

## 🆘 Si Sigue Fallando

Después de corregir las variables y redesplegar, si aún ves el error `20003`:

1. **Verifica los logs de Render** después del redespliegue
2. **Busca las líneas que empiezan con `[TWILIO]`**
3. **Comparte esos logs** para diagnosticar el problema

---

**¿Ya verificaste y corregiste las variables de entorno en Render? Avísame cuando termine el redespliegue y probamos de nuevo. 🚀**
