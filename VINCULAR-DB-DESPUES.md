# 🔗 Vincular Base de Datos DESPUÉS de Crear el Servicio

## ✅ RESPUESTA

**No necesitas vincular la base de datos en el formulario inicial.**

Render permite vincular la base de datos **después** de crear el servicio. Por ahora, configuraremos `DATABASE_URL` manualmente en las variables de entorno.

---

## 📋 PASOS ACTUALES (ANTES DE CREAR EL SERVICIO)

### **PASO 1: Cambiar Tipo de Instancia**

**En la sección "Tipo de instancia":**

1. **Actualmente seleccionado**: "Gratis" ($0/mes)
2. **Haz clic en**: **"Motor de arranque"** o **"STARTER"** ($7/mes)
3. **Verifica que diga**: $7/mes, 512 MB RAM, 0.5 CPU

**⚠️ IMPORTANTE:** NO uses el plan Gratis (se duerme después de 15 min de inactividad)

---

### **PASO 2: Obtener DATABASE_URL de la Base de Datos**

**Antes de agregar variables de entorno, necesitas la URL de la base de datos:**

1. **Ve a tu base de datos en Render**:
   - En Render Dashboard, busca: `whatsapp-reminders-db`
   - Haz clic en la base de datos

2. **Copia la "Internal Database URL"**:
   - Deberías ver algo como:
     ```
     postgresql://usuario:password@host:port/database?sslmode=require
     ```
   - **Copia esta URL completa**
   - ⚠️ Esta URL es sensible, no la compartas

3. **Tenla lista para pegarla en las variables de entorno**

---

### **PASO 3: Agregar Variables de Entorno**

**Haz clic en "Agregar variable de entorno"** y agrega estas 10 variables:

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
- **Value**: Pega la "Internal Database URL" que copiaste de la base de datos
  - Formato: `postgresql://usuario:password@host:port/database?sslmode=require`
  - Ejemplo: `postgresql://whatsapp_reminders_user:xxxxx@dpg-xxxxx-a/whatsapp_reminders?sslmode=require`
- **Secret**: SÍ (márcalo como secreto 🔒 - MUY IMPORTANTE)

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
- **Secret**: SÍ (márcalo como secreto 🔒 - MUY IMPORTANTE)

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

### **PASO 4: Verificar Todo Antes de Crear**

**Antes de hacer clic en "Implementar servicio web", verifica:**

- [ ] **Repositorio**: `josedjka-oss/whatsapp-reminders`
- [ ] **Nombre**: `whatsapp-reminders`
- [ ] **Rama**: `main`
- [ ] **Región**: `Oregón (oeste de EE. UU.)`
- [ ] **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
- [ ] **Start Command**: `npm start`
- [ ] **Tipo de instancia**: `STARTER ($7/mes)` ⚠️ (NO Gratis)
- [ ] **Ruta de salud**: `/health` ✅ (ya está configurado)
- [ ] **10 variables de entorno configuradas** (incluyendo `DATABASE_URL` con la URL real)
- [ ] `DATABASE_URL` marcada como SECRETO 🔒
- [ ] `TWILIO_AUTH_TOKEN` marcada como SECRETO 🔒

---

### **PASO 5: Crear el Servicio Web**

**Una vez que todo esté verificado:**

1. **Desplázate hasta el final del formulario**
2. **Busca el botón "Implementar servicio web"** o **"Deploy"**
3. **Haz clic en el botón**
4. **Render comenzará a desplegar** (3-5 minutos)

---

## 🔗 Vincular Base de Datos DESPUÉS (Opcional)

**Después de crear el servicio, puedes vincular la base de datos oficialmente:**

1. **Ve a tu servicio web en Render Dashboard**
2. **Haz clic en tu servicio**: `whatsapp-reminders`
3. **Ve a la pestaña "Settings"** o **"Configuración"** (izquierda)
4. **Busca "Linked Resources"** o **"Recursos Vinculados"**
5. **Haz clic en "Link Resource"** o **"Vincular Recurso"**
6. **Selecciona**: `whatsapp-reminders-db` (PostgreSQL)
7. **Render actualizará automáticamente** `DATABASE_URL` si hay diferencias

**⚠️ NOTA:** Si ya configuraste `DATABASE_URL` manualmente, vincular la DB no es estrictamente necesario, pero es bueno hacerlo para mantener todo sincronizado.

---

## ✅ RESUMEN

**Orden de pasos:**

1. ✅ **Cambiar tipo de instancia**: Gratis → STARTER ($7/mes)
2. ✅ **Obtener DATABASE_URL** de la base de datos en Render
3. ✅ **Agregar 10 variables de entorno** (incluyendo `DATABASE_URL` manualmente)
4. ✅ **Verificar todo**
5. ✅ **Crear el servicio web**
6. ✅ **Vincular base de datos después** (opcional, en Settings)

---

## 🆘 ¿PROBLEMAS?

### **No sé cómo obtener la Internal Database URL**

**Solución:**
1. Ve a Render Dashboard
2. Haz clic en tu base de datos: `whatsapp-reminders-db`
3. Verás una sección con "Connection String" o "Internal Database URL"
4. Haz clic en "Show" o el icono del ojo para verla
5. Cópiala completa

### **El tipo de instancia sigue en Gratis**

**Solución:**
- Haz clic específicamente en el círculo/radio button de "Motor de arranque" o "STARTER"
- Verifica que el círculo esté seleccionado (no solo el texto)

### **No tengo las credenciales de Twilio**

**Solución:**
- Ve a: https://console.twilio.com/
- Crea una cuenta gratuita si no tienes
- Account SID y Auth Token están en el Dashboard principal

---

**¿Ya cambiaste el tipo de instancia a STARTER y obtuviste la DATABASE_URL? Avísame y seguimos agregando las variables de entorno. 🚀**
