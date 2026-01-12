# 🚀 PASO 3: Configurar Variables de Entorno en Render

## ✅ PASOS COMPLETADOS
- ✅ PASO 1: Base de datos PostgreSQL creada
- ✅ PASO 2: Servicio Web configurado (pero NO creado todavía)

## 📋 PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### **3.1. Acceder a Variables de Entorno**

**En el formulario del servicio web que estás configurando:**

1. **Busca la sección "Environment Variables"** o **"Env Vars"**
   - Puede estar en "Advanced" o directamente visible en el formulario
   - O puede estar en una pestaña/sección separada

2. **Si no ves la sección**, busca el botón **"Add Environment Variable"** o **"Advanced"**
   - Haz clic en "Advanced" si está disponible
   - Luego busca "Environment Variables"

3. **Verás una lista de variables** (puede estar vacía o tener `DATABASE_URL` si ya vinculaste la DB)

### **3.2. Obtener Credenciales de Twilio (Si no las tienes)**

**Antes de agregar las variables, necesitas estas credenciales de Twilio:**

1. **Ve a**: https://console.twilio.com/
2. **Inicia sesión** en tu cuenta de Twilio
3. **En el Dashboard principal**, verás:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: (haz clic en "View" o el icono del ojo para verlo)
   
4. **Copia ambas credenciales** y tenlas listas para usarlas

**Si no tienes cuenta de Twilio:**
1. Ve a: https://www.twilio.com/try-twilio
2. Crea una cuenta gratuita (con crédito inicial de $15.50)
3. Una vez creada, verás tus credenciales en el Dashboard

### **3.3. Agregar Variables de Entorno (Una por Una)**

**Haz clic en "Add Environment Variable"** y agrega cada variable:

---

#### **Variable 1: NODE_ENV**

- **Key**: `NODE_ENV`
- **Value**: `production`
- **Secret**: NO (déjalo desmarcado)
- Haz clic en **"Add"** o **"Save"**

---

#### **Variable 2: PORT**

- **Key**: `PORT`
- **Value**: `10000`
- **Secret**: NO
- **Nota**: Render usa el puerto 10000 automáticamente
- Haz clic en **"Add"** o **"Save"**

---

#### **Variable 3: APP_TIMEZONE**

- **Key**: `APP_TIMEZONE`
- **Value**: `America/Bogota`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

---

#### **Variable 4: DATABASE_URL**

**⚠️ IMPORTANTE: Esta variable puede estar ya configurada automáticamente**

- **Key**: `DATABASE_URL`
- **Value**: 
  - Si ya apareció automáticamente cuando vinculaste la DB, **NO la cambies**
  - Si no aparece, ve a tu base de datos en Render y copia la "Internal Database URL"
  - Formato: `postgresql://user:password@host:port/database?sslmode=require`
- **Secret**: SÍ (márcalo como secreto con el icono de candado 🔒)
- Haz clic en **"Add"** o **"Save"**

---

#### **Variable 5: TWILIO_ACCOUNT_SID**

- **Key**: `TWILIO_ACCOUNT_SID`
- **Value**: Tu Account SID de Twilio
  - Formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Ejemplo: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Obtener en: https://console.twilio.com/ (Dashboard principal)
- **Secret**: NO (pero es sensible, ten cuidado de no compartirla)
- Haz clic en **"Add"** o **"Save"**

---

#### **Variable 6: TWILIO_AUTH_TOKEN**

- **Key**: `TWILIO_AUTH_TOKEN`
- **Value**: Tu Auth Token de Twilio
  - Obtener en: https://console.twilio.com/ (Dashboard principal)
  - Haz clic en "View" o el icono del ojo 👁️ para verlo
- **Secret**: SÍ (MUY IMPORTANTE: marca esta variable como secreto con el icono de candado 🔒)
- Haz clic en **"Add"** o **"Save"**

**⚠️ IMPORTANTE: El Auth Token es muy sensible. Asegúrate de marcarlo como "Secret".**

---

#### **Variable 7: TWILIO_WHATSAPP_FROM**

- **Key**: `TWILIO_WHATSAPP_FROM`
- **Value**: 
  - Si usas **Sandbox de Twilio**: `whatsapp:+14155238886`
  - Si tienes **número aprobado de Twilio**: `whatsapp:+1XXXXXXXXXX` (tu número real)
  
  **Para comenzar, usa el Sandbox:**
  ```
  whatsapp:+14155238886
  ```
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

**Para activar Twilio WhatsApp Sandbox:**
1. Ve a Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Verás el número de sandbox y el código de unión
3. Envía un mensaje de WhatsApp al número: `+1 415 523 8886`
4. Envía el código de unión que te mostró Twilio (ejemplo: `join secret-word`)

---

#### **Variable 8: MY_WHATSAPP_NUMBER**

- **Key**: `MY_WHATSAPP_NUMBER`
- **Value**: Tu número personal en formato `whatsapp:+57XXXXXXXXXX`
  - Ejemplo: `whatsapp:+573001234567`
  - Reemplaza `+57XXXXXXXXXX` con tu número real (incluye código de país)
  - **Formato correcto**: `whatsapp:+[código de país][número sin espacios ni guiones]`
  
  **Ejemplos:**
  - Colombia: `whatsapp:+573001234567`
  - México: `whatsapp:+5215512345678`
  - España: `whatsapp:+34612345678`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

---

#### **Variable 9: PUBLIC_BASE_URL**

- **Key**: `PUBLIC_BASE_URL`
- **Value**: `https://whatsapp-reminders.onrender.com` (placeholder temporal)
  - ⚠️ **IMPORTANTE**: Esta URL cambiará después de crear el servicio
  - Render te dará una URL real como: `https://whatsapp-reminders-xxxx.onrender.com`
  - Por ahora pon un placeholder, lo actualizaremos en el PASO 5
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

**Nota**: Actualizaremos esta variable en el PASO 5 con la URL real que Render te dé.

---

#### **Variable 10: TWILIO_WEBHOOK_PATH**

- **Key**: `TWILIO_WEBHOOK_PATH`
- **Value**: `/webhooks/twilio/whatsapp`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

---

### **3.4. Verificar que Todas las Variables Estén Agregadas**

**Después de agregar todas las variables, verifica esta lista:**

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `APP_TIMEZONE` = `America/Bogota`
- [ ] `DATABASE_URL` = (configurado automáticamente o manualmente, marcado como secreto 🔒)
- [ ] `TWILIO_ACCOUNT_SID` = (tu Account SID)
- [ ] `TWILIO_AUTH_TOKEN` = (tu Auth Token, marcado como secreto 🔒)
- [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886` (o tu número)
- [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX` (tu número personal)
- [ ] `PUBLIC_BASE_URL` = `https://whatsapp-reminders.onrender.com` (placeholder por ahora)
- [ ] `TWILIO_WEBHOOK_PATH` = `/webhooks/twilio/whatsapp`

**Total: 10 variables**

---

### **3.5. Resumen de Variables con Valores de Ejemplo**

| Key | Value Ejemplo | Secret |
|-----|---------------|--------|
| `NODE_ENV` | `production` | ❌ |
| `PORT` | `10000` | ❌ |
| `APP_TIMEZONE` | `America/Bogota` | ❌ |
| `DATABASE_URL` | `postgresql://user:pass@host:port/db?sslmode=require` | ✅ |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | ❌ |
| `TWILIO_AUTH_TOKEN` | `tu_auth_token_aqui` | ✅ |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | ❌ |
| `MY_WHATSAPP_NUMBER` | `whatsapp:+573001234567` | ❌ |
| `PUBLIC_BASE_URL` | `https://whatsapp-reminders.onrender.com` (temporal) | ❌ |
| `TWILIO_WEBHOOK_PATH` | `/webhooks/twilio/whatsapp` | ❌ |

---

## ✅ VERIFICACIÓN DEL PASO 3

**Antes de continuar al PASO 4, verifica:**

- [ ] Todas las 10 variables están agregadas
- [ ] `DATABASE_URL` está marcada como secreto (🔒)
- [ ] `TWILIO_AUTH_TOKEN` está marcada como secreto (🔒)
- [ ] `TWILIO_ACCOUNT_SID` tiene tu Account SID real
- [ ] `TWILIO_AUTH_TOKEN` tiene tu Auth Token real
- [ ] `MY_WHATSAPP_NUMBER` tiene tu número personal en formato correcto
- [ ] `PUBLIC_BASE_URL` tiene un placeholder (lo actualizaremos después)

---

## 🎯 SIGUIENTE PASO

**Una vez que todas las variables estén configuradas:**

✅ **Ahora SÍ puedes hacer clic en "Create Web Service"**

**PASO 4: Crear el Servicio Web**

Render comenzará a desplegar tu aplicación automáticamente.

---

## 🆘 ¿PROBLEMAS?

### **No encuentro la sección "Environment Variables"**

**Solución:**
- Busca "Advanced" o "Env Vars" en el formulario
- Algunas veces está en una pestaña separada
- Si no aparece, puedes agregar las variables después de crear el servicio (menos conveniente)

### **No tengo credenciales de Twilio**

**Solución:**
1. Ve a: https://www.twilio.com/try-twilio
2. Crea una cuenta gratuita (con crédito inicial)
3. Una vez creada, verás tus credenciales en el Dashboard principal
4. Account SID y Auth Token estarán visibles

### **No sé cuál es mi número de WhatsApp**

**Solución:**
- Formato: `whatsapp:+[código de país][número completo]`
- Ejemplo para Colombia: `whatsapp:+573001234567`
- Ejemplo para México: `whatsapp:+5215512345678`
- Incluye el código de país (Colombia: +57, México: +52, etc.)

### **No puedo ver el Auth Token de Twilio**

**Solución:**
- En Twilio Console, haz clic en el icono del ojo 👁️ junto a "Auth Token"
- O haz clic en "View" para verlo
- Si lo olvidaste, puedes regenerarlo en Settings → API Keys & Tokens

---

**¿Ya configuraste todas las 10 variables de entorno? Avísame cuando termines y continuamos con el PASO 4: Crear el Servicio Web. 🚀**
