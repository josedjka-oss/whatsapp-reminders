# ⚠️ IMPORTANTE: Configurar Variables de Entorno en Render

## 🔴 ERROR ACTUAL

```
Error: Se requieren credenciales de Twilio en las variables de entorno
```

**Este error indica que las variables de entorno de Twilio NO están configuradas en Render.**

---

## ✅ SOLUCIÓN: Configurar Variables de Entorno en Render

### **PASO 1: Ir a Settings del Servicio Web**

1. **Ve a Render Dashboard** → Tu servicio web `whatsapp-reminders`
2. **Haz clic en "Environment"** (Variables de Entorno) en la pestaña izquierda
3. **O ve a "Settings"** → Sección "Environment Variables"

### **PASO 2: Agregar Variables de Entorno REQUERIDAS**

**Debes configurar estas 5 variables de entorno:**

#### **1. TWILIO_ACCOUNT_SID**
- **Tipo:** String
- **Valor:** Tu Account SID de Twilio (comienza con `AC...`)
- **Ejemplo:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (reemplaza con tu Account SID real)
- **¿Dónde obtenerla?** → Twilio Console → Account Info → Account SID

#### **2. TWILIO_AUTH_TOKEN** ⚠️ SECRETO
- **Tipo:** Secret (marcar como secreto)
- **Valor:** Tu Auth Token de Twilio
- **Ejemplo:** `tu_auth_token_aqui_1234567890abcdef`
- **¿Dónde obtenerlo?** → Twilio Console → Account Info → Auth Token
- **⚠️ IMPORTANTE:** Marca esta variable como **SECRET** en Render

#### **3. TWILIO_WHATSAPP_FROM**
- **Tipo:** String
- **Valor:** Tu número de WhatsApp de Twilio en formato `whatsapp:+...`
- **Ejemplo (Sandbox):** `whatsapp:+14155238886`
- **Ejemplo (Número propio):** `whatsapp:+1234567890`
- **¿Dónde obtenerlo?** → Twilio Console → Messaging → Try it out → Send a WhatsApp message

#### **4. MY_WHATSAPP_NUMBER**
- **Tipo:** String
- **Valor:** Tu número de WhatsApp personal en formato `whatsapp:+...`
- **Ejemplo:** `whatsapp:+571234567890` (para Colombia)
- **Formato:** `whatsapp:+[código_país][número]` (sin espacios ni guiones)

#### **5. PUBLIC_BASE_URL** (opcional pero recomendado)
- **Tipo:** String
- **Valor:** La URL pública de tu servicio en Render
- **Ejemplo:** `https://whatsapp-reminders.onrender.com`
- **Auto-generado:** Render puede inyectar esto automáticamente si usas `RENDER_EXTERNAL_URL`

---

## 📋 VARIABLES ADICIONALES (Ya configuradas)

**Estas variables ya deberían estar configuradas:**

- ✅ `DATABASE_URL` (ya configurada desde PostgreSQL)
- ✅ `PORT` (ya configurada: `10000` o `3000`)
- ✅ `NODE_ENV` (ya configurada: `production`)
- ✅ `APP_TIMEZONE` (ya configurada: `America/Bogota`)
- ✅ `TWILIO_WEBHOOK_PATH` (ya configurada: `/webhooks/twilio/whatsapp`)

---

## 🔧 CÓMO AGREGAR VARIABLES EN RENDER

### **Opción 1: Desde Environment Variables Section**

1. **Ve a "Environment"** en la pestaña izquierda
2. **Haz clic en "Add Environment Variable"**
3. **Ingresa:**
   - **Key:** `TWILIO_ACCOUNT_SID`
   - **Value:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (reemplaza con tu Account SID real)
4. **Repite para cada variable**

### **Opción 2: Desde Settings**

1. **Ve a "Settings"** en la pestaña izquierda
2. **Busca "Environment Variables"**
3. **Agrega cada variable una por una**

### **Opción 3: Editar render.yaml** (si usas blueprint)

```yaml
envVars:
  - key: TWILIO_ACCOUNT_SID
    sync: false  # Se debe configurar manualmente
  - key: TWILIO_AUTH_TOKEN
    sync: false  # Se debe configurar manualmente (marcar como Secret)
  - key: TWILIO_WHATSAPP_FROM
    sync: false  # Se debe configurar manualmente
  - key: MY_WHATSAPP_NUMBER
    sync: false  # Se debe configurar manualmente
```

**Luego configura los valores manualmente en Render Dashboard.**

---

## ✅ VERIFICACIÓN

**Después de agregar las variables:**

1. ✅ **Haz clic en "Save Changes"** o guarda la configuración
2. ✅ **Render reiniciará automáticamente** el servicio
3. ✅ **O haz clic en "Manual Deploy"** para forzar un nuevo despliegue
4. ✅ **Espera 2-3 minutos** mientras Render despliega
5. ✅ **Verifica los logs** que no haya errores de credenciales

---

## 🔍 VERIFICAR QUE LAS VARIABLES ESTÁN CONFIGURADAS

**Para verificar en Render:**

1. **Ve a "Environment"** o **"Settings"** → **"Environment Variables"**
2. **Debes ver estas 5 variables listadas:**
   - ✅ `TWILIO_ACCOUNT_SID` (debe tener valor)
   - ✅ `TWILIO_AUTH_TOKEN` (debe estar marcado como Secret)
   - ✅ `TWILIO_WHATSAPP_FROM` (debe tener valor)
   - ✅ `MY_WHATSAPP_NUMBER` (debe tener valor)
   - ✅ `PUBLIC_BASE_URL` (opcional)

---

## 🆘 TROUBLESHOOTING

### **Error: "Variable not found"**

**Solución:**
- Verifica que escribiste el nombre EXACTO de la variable (mayúsculas/minúsculas)
- Verifica que guardaste los cambios
- Verifica que el servicio se reinició después de agregar las variables

### **Error: "Invalid Twilio credentials"**

**Solución:**
- Verifica que el `TWILIO_ACCOUNT_SID` comienza con `AC`
- Verifica que el `TWILIO_AUTH_TOKEN` es correcto (copia/pega desde Twilio Console)
- Verifica que el `TWILIO_WHATSAPP_FROM` está en formato `whatsapp:+...`
- Verifica que el `MY_WHATSAPP_NUMBER` está en formato `whatsapp:+[código][número]`

### **Error: "Number not verified in Twilio Sandbox"**

**Solución:**
- Si usas Twilio Sandbox, primero envía un mensaje a Twilio para unir tu número
- O configura un número de WhatsApp aprobado en Twilio

---

## 📝 NOTAS IMPORTANTES

1. **⚠️ NUNCA expongas `TWILIO_AUTH_TOKEN` en logs o código**
2. **✅ Marca `TWILIO_AUTH_TOKEN` como SECRET en Render**
3. **✅ Usa formato `whatsapp:+...` para todos los números**
4. **✅ Código de país es obligatorio (ej: +57 para Colombia, +1 para USA)**
5. **✅ Sin espacios ni guiones en los números**

---

**¿Ya configuraste las variables de entorno en Render? Avísame cuando lo hagas y verificamos que el servicio inicie correctamente. 🚀**
