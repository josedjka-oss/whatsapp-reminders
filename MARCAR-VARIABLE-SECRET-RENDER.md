# 🔒 Cómo Marcar una Variable como SECRET en Render

## 📋 PASO A PASO

### **PASO 1: Ir a Environment Variables**

1. **Ve a Render Dashboard** → https://dashboard.render.com/
2. **Haz clic en tu servicio web** `whatsapp-reminders`
3. **En la pestaña izquierda**, haz clic en **"Environment"** (Variables de Entorno)
   - O ve a **"Settings"** → Busca la sección **"Environment Variables"**

---

### **PASO 2: Agregar o Editar Variable**

**Si la variable NO existe todavía:**

1. **Haz clic en "Add Environment Variable"** o **"Add Variable"**
2. **Ingresa:**
   - **Key:** `TWILIO_AUTH_TOKEN`
   - **Value:** `tu_auth_token_aqui` (tu token real de Twilio)
3. **Marca la casilla** que dice **"Secret"** o **"Mark as Secret"** ☑️
   - Esta casilla está justo debajo o al lado del campo "Value"
4. **Haz clic en "Save"** o **"Add"**

**Si la variable YA existe:**

1. **Busca `TWILIO_AUTH_TOKEN`** en la lista de variables
2. **Haz clic en el ícono de lápiz** (✏️) o en **"Edit"**
3. **Marca la casilla "Secret"** ☑️ (si no está marcada)
4. **Haz clic en "Save"** o **"Update"**

---

## 🎯 CASILLA "SECRET"

**La casilla "Secret" generalmente:**
- ☑️ Está ubicada **debajo del campo "Value"**
- ☑️ Tiene texto como: **"Secret"**, **"Mark as Secret"**, o **"Encrypt"**
- ☑️ Una vez marcada, el valor se mostrará como **"●●●●●●●●"** en lugar del texto real

---

## 🔍 IMAGEN VISUAL (Ubicación Típica)

```
┌─────────────────────────────────────┐
│ Add Environment Variable            │
├─────────────────────────────────────┤
│ Key:                                │
│ [TWILIO_AUTH_TOKEN        ]         │
│                                     │
│ Value:                              │
│ [tu_auth_token_aqui       ]         │
│                                     │
│ ☑️ Secret  ← AQUÍ (marca esto)     │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

---

## ✅ VARIABLES QUE DEBEN SER SECRETAS

**Marca estas variables como SECRET:**

1. ✅ **`TWILIO_AUTH_TOKEN`** ← **OBLIGATORIO**
2. ✅ **`DATABASE_URL`** (si ya la tienes configurada)
3. ❌ `TWILIO_ACCOUNT_SID` (no es crítico, pero puedes marcarla)
4. ❌ `TWILIO_WHATSAPP_FROM` (no es secreto)
5. ❌ `MY_WHATSAPP_NUMBER` (no es secreto)
6. ❌ `APP_TIMEZONE` (no es secreto)

---

## 🔒 QUÉ HACE "SECRET"

**Cuando marcas una variable como SECRET:**

- ✅ **El valor se encripta** en la base de datos de Render
- ✅ **No aparece en los logs** de forma legible
- ✅ **Solo se muestra como `●●●●●●●●`** en la interfaz
- ✅ **Más seguro** si alguien accede a tu cuenta de Render

---

## 🆘 SI NO VES LA OPCIÓN "SECRET"

**Si no encuentras la casilla "Secret":**

1. **Verifica que estés en la sección correcta:**
   - Debe ser "Environment Variables" o "Environment"
   - NO "Build Environment Variables" (esa es diferente)

2. **Busca un ícono de candado** (🔒) al lado del campo Value

3. **Render puede tener diferentes interfaces:**
   - Algunas versiones muestran "Secret" como toggle/switch
   - Otras lo muestran como checkbox
   - En algunas, está en "Advanced Options"

4. **Alternativa:** Si no encuentras la opción:
   - Haz clic en "Advanced" o "Show Advanced Options"
   - Busca "Encrypt" o "Secure"

---

## 📝 PASO A PASO COMPLETO (Ejemplo Real)

### **1. Ir a Render Dashboard**
```
https://dashboard.render.com/
→ Haz clic en "whatsapp-reminders"
```

### **2. Ir a Environment Variables**
```
Pestaña izquierda → "Environment"
O
Pestaña izquierda → "Settings" → Busca "Environment Variables"
```

### **3. Agregar Variable Secreta**
```
1. Haz clic en "Add Environment Variable"
2. Key: TWILIO_AUTH_TOKEN
3. Value: tu_token_real_aqui_1234567890
4. Marca ☑️ "Secret" (debajo del campo Value)
5. Haz clic en "Save" o "Add"
```

### **4. Verificar**
```
Después de guardar, deberías ver:
TWILIO_AUTH_TOKEN = ●●●●●●●●

(NO deberías ver el valor real)
```

---

## ✅ VERIFICACIÓN

**Después de marcar como SECRET, verifica:**

1. ✅ **La variable aparece en la lista** con valor `●●●●●●●●`
2. ✅ **Al hacer clic en "Edit"**, puedes ver el valor real (pero está encriptado)
3. ✅ **En los logs de Render**, NO aparece el valor real del token
4. ✅ **El servicio funciona correctamente** (puede leer el valor)

---

**¿Ya encontraste la opción "Secret" en Render? Si tienes problemas para encontrarla, avísame y te guío con más detalle según tu versión de Render. 🔒**
