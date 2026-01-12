# ✅ DATABASE_URL Encontrada - Agregar al Servicio Web

## ✅ INFORMACIÓN DE LA BASE DE DATOS

**Base de datos encontrada:**
- Nombre: `whatsapp-reminders-db`
- Estado: **Disponible** ✅
- Región: Oregón (oeste de EE. UU.)
- Versión PostgreSQL: 18

## 🔑 URL PARA DATABASE_URL

**URL de la base de datos interna** (la que necesitas):

```
postgresql://whatsapp_reminders_y3rd_user:yu1JgAzSk0GroCD1oigigE134DhtjqsB@dpg-d5hafser433s73bl5kpg-a/whatsapp_reminders_y3rd
```

**⚠️ IMPORTANTE:**
- Usa la **"URL de la base de datos interna"** (NO la externa)
- Esta URL es para servicios dentro de Render
- Es más segura y eficiente

---

## 📋 PASOS PARA AGREGAR VARIABLES DE ENTORNO

### **PASO 1: Volver al Formulario del Servicio Web**

1. **Vuelve a la pestaña del servicio web** que estabas configurando
2. O ve a: Render Dashboard → Nuevo → Web Service

### **PASO 2: Cambiar Tipo de Instancia (PRIMERO)**

**Antes de agregar variables, cambia el tipo de instancia:**

1. **En la sección "Tipo de instancia"**
2. **Haz clic en "Motor de arranque"** o **"STARTER"** ($7/mes)
3. **Verifica que el círculo/radio button esté seleccionado** (NO "Gratis")

---

### **PASO 3: Agregar Variables de Entorno**

**Haz clic en "Agregar variable de entorno"** y agrega estas 10 variables (una por una):

#### **Variable 1: NODE_ENV**
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Secret**: NO

#### **Variable 2: PORT**
- **Key**: `PORT`
- **Value**: `10000`
- **Secret**: NO

#### **Variable 3: APP_TIMEZONE**
- **Key**: `APP_TIMEZONE`
- **Value**: `America/Bogota`
- **Secret**: NO

#### **Variable 4: DATABASE_URL** ⭐ IMPORTANTE
- **Key**: `DATABASE_URL`
- **Value**: 
  ```
  postgresql://whatsapp_reminders_y3rd_user:yu1JgAzSk0GroCD1oigigE134DhtjqsB@dpg-d5hafser433s73bl5kpg-a/whatsapp_reminders_y3rd
  ```
  (Copia y pega EXACTAMENTE esta URL)
- **Secret**: SÍ (MUY IMPORTANTE: marca como secreto 🔒)

#### **Variable 5: TWILIO_ACCOUNT_SID**
- **Key**: `TWILIO_ACCOUNT_SID`
- **Value**: (Tu Account SID de Twilio)
  - Obtener en: https://console.twilio.com/
  - Formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret**: NO

#### **Variable 6: TWILIO_AUTH_TOKEN**
- **Key**: `TWILIO_AUTH_TOKEN`
- **Value**: (Tu Auth Token de Twilio)
  - Obtener en: https://console.twilio.com/
  - Haz clic en "View" para verlo
- **Secret**: SÍ (marca como secreto 🔒)

#### **Variable 7: TWILIO_WHATSAPP_FROM**
- **Key**: `TWILIO_WHATSAPP_FROM`
- **Value**: `whatsapp:+14155238886`
- **Secret**: NO

#### **Variable 8: MY_WHATSAPP_NUMBER**
- **Key**: `MY_WHATSAPP_NUMBER`
- **Value**: `whatsapp:+57XXXXXXXXXX` (tu número personal)
  - Ejemplo: `whatsapp:+573001234567`
- **Secret**: NO

#### **Variable 9: PUBLIC_BASE_URL**
- **Key**: `PUBLIC_BASE_URL`
- **Value**: `https://whatsapp-reminders.onrender.com`
  - ⚠️ Este es un placeholder temporal
  - Lo actualizaremos después con la URL real
- **Secret**: NO

#### **Variable 10: TWILIO_WEBHOOK_PATH**
- **Key**: `TWILIO_WEBHOOK_PATH`
- **Value**: `/webhooks/twilio/whatsapp`
- **Secret**: NO

---

## ✅ VERIFICACIÓN FINAL

**Después de agregar todas las variables, verifica:**

- [ ] Tipo de instancia: `STARTER ($7/mes)` (NO Gratis)
- [ ] Repositorio: `josedjka-oss/whatsapp-reminders`
- [ ] Nombre: `whatsapp-reminders`
- [ ] Build Command: `npm install && npm run build && npx prisma migrate deploy`
- [ ] Start Command: `npm start`
- [ ] Ruta de salud: `/health`
- [ ] **10 variables de entorno agregadas**:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `10000`
  - [ ] `APP_TIMEZONE` = `America/Bogota`
  - [ ] `DATABASE_URL` = (URL completa que copiaste, marcada como SECRETO 🔒)
  - [ ] `TWILIO_ACCOUNT_SID` = (tu Account SID)
  - [ ] `TWILIO_AUTH_TOKEN` = (tu Auth Token, marcada como SECRETO 🔒)
  - [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`
  - [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX`
  - [ ] `PUBLIC_BASE_URL` = `https://whatsapp-reminders.onrender.com` (temporal)
  - [ ] `TWILIO_WEBHOOK_PATH` = `/webhooks/twilio/whatsapp`
- [ ] `DATABASE_URL` marcada como SECRETO 🔒
- [ ] `TWILIO_AUTH_TOKEN` marcada como SECRETO 🔒

---

## 🚀 CREAR EL SERVICIO WEB

**Una vez que todo esté verificado:**

1. **Desplázate hasta el final del formulario**
2. **Busca el botón "Implementar servicio web"** o **"Deploy"** o **"Create Web Service"**
3. **Haz clic en el botón**
4. **Render comenzará a desplegar** (3-5 minutos)

**Mientras despliega:**
- Verás: "Creating..." → "Building..." → "Deploying..." → "Live"
- Puedes ver los logs en tiempo real
- Espera a que termine

---

## 📋 RESUMEN RÁPIDO

**Orden de acciones:**

1. ✅ **Copiar DATABASE_URL** (ya la tienes arriba)
2. ✅ **Volver al formulario del servicio web**
3. ✅ **Cambiar tipo de instancia**: Gratis → STARTER ($7/mes)
4. ✅ **Agregar 10 variables de entorno** (incluyendo DATABASE_URL con la URL que copiaste)
5. ✅ **Verificar todo**
6. ✅ **Crear el servicio web**

---

## 🔑 DATABASE_URL PARA COPIAR

**Copia esta URL exactamente:**

```
postgresql://whatsapp_reminders_y3rd_user:yu1JgAzSk0GroCD1oigigE134DhtjqsB@dpg-d5hafser433s73bl5kpg-a/whatsapp_reminders_y3rd
```

**⚠️ IMPORTANTE:**
- Marca esta variable como **SECRETO** (icono de candado 🔒)
- Es una URL sensible que contiene credenciales

---

**¿Ya copiaste la DATABASE_URL? Ahora vuelve al formulario del servicio web, cambia el tipo de instancia a STARTER, agrega todas las variables de entorno y crea el servicio. Avísame cuando lo hagas o si necesitas ayuda con algún paso específico. 🚀**
