# 🔒 Configurar TWILIO_AUTH_TOKEN en Render

## ✅ TU AUTH TOKEN RECIBIDO

**Token configurado:** `20bc1efaed4966c3f221f48fd885aa69lo`

⚠️ **IMPORTANTE:** Este token es SENSIBLE. No lo compartas públicamente.

---

## 📋 PASOS PARA CONFIGURAR EN RENDER

### **PASO 1: Ir a Environment Variables**

1. **Ve a Render Dashboard:** https://dashboard.render.com/
2. **Haz clic en tu servicio:** `whatsapp-reminders`
3. **Pestaña izquierda** → **"Environment"** (Variables de Entorno)

---

### **PASO 2: Agregar TWILIO_AUTH_TOKEN**

1. **Haz clic en "Add Environment Variable"** o **"Add Variable"**

2. **Completa el formulario:**
   - **Key:** `TWILIO_AUTH_TOKEN`
   - **Value:** `20bc1efaed4966c3f221f48fd885aa69lo`
   - **☑️ Marca la casilla "Secret"** (MUY IMPORTANTE)

3. **Haz clic en "Save"** o **"Add"**

---

### **PASO 3: Verificar que está Configurado**

**Después de guardar, deberías ver:**

```
TWILIO_AUTH_TOKEN = ●●●●●●●●
```

**El valor debe aparecer como puntos (●●●●●●●●) porque está marcado como SECRET.**

---

## ✅ TODAS LAS VARIABLES QUE DEBES TENER

**Verifica que tengas estas 4 variables configuradas:**

| Variable | Valor | Secret |
|----------|-------|--------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | ❌ |
| `TWILIO_AUTH_TOKEN` | `20bc1efaed4966c3f221f48fd885aa69lo` | ✅ **SÍ** |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | ❌ |
| `MY_WHATSAPP_NUMBER` | `whatsapp:+57xxxxxxxxxx` | ❌ |

---

## 🔒 IMPORTANTE: Seguridad

**⚠️ NUNCA:**
- ❌ Compartas tu Auth Token públicamente
- ❌ Lo subas a GitHub o repositorios públicos
- ❌ Lo incluyas en logs o mensajes públicos
- ❌ Lo compartas con personas no autorizadas

**✅ SÍ puedes:**
- ✅ Guardarlo en Render como SECRET (seguro)
- ✅ Usarlo en variables de entorno locales (`.env` que está en `.gitignore`)
- ✅ Configurarlo en servicios de hosting seguros

---

## ✅ VERIFICAR QUE FUNCIONA

**Después de configurar todas las variables:**

1. **Render reiniciará automáticamente** el servicio
2. **O haz clic en "Manual Deploy"** / **"Redeploy"** para forzar reinicio
3. **Ve a los Logs de Render**
4. **Deberías ver:**
   ```
   [INIT] ✅ Conectado a la base de datos
   [INIT] ✅ Scheduler iniciado
   [INIT] ✅ Servidor escuchando en puerto 10000
   ```
   (NO deberías ver: "Variables de entorno faltantes: TWILIO_AUTH_TOKEN")

---

## 📝 SIGUIENTE PASO

**Después de configurar todas las variables:**

1. ✅ **Unir tu número al Sandbox** (si no lo has hecho)
2. ✅ **Configurar el webhook** en Twilio Console
3. ✅ **Probar enviando un mensaje**

---

**¿Ya configuraste el Auth Token en Render como SECRET? Avísame cuando lo hagas y verificamos que todo funcione. 🔒**
