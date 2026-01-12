# ✅ REPOSITORIO CONECTADO - Completar Configuración en Render

## ✅ ESTADO ACTUAL
- ✅ Repositorio conectado: `josedjka-oss/whatsapp-reminders`
- ✅ Rama: `main` (o `master`)

## 📋 COMPLETAR FORMULARIO EN RENDER

### **PASO 1: Verificar Repositorio Conectado**

**Verifica que en Render veas:**
- ✅ Repositorio: `josedjka-oss/whatsapp-reminders`
- ✅ Rama: `main` (o `master`)
- ✅ URL: `https://github.com/josedjka-oss/whatsapp-reminders`

---

### **PASO 2: Completar Campos del Formulario**

**Completa estos campos EN ORDEN:**

#### **1. Nombre** (Name)
```
whatsapp-reminders
```
- Escribe: `whatsapp-reminders`

#### **2. Región** (Region)
- Selecciona: **`Oregón (oeste de EE. UU.)`** o **`Oregon (US West)`**
- ⚠️ **IMPORTANTE**: Usa la misma región que tu base de datos `whatsapp-reminders-db`

#### **3. Rama** (Branch)
- Debería estar automáticamente en: **`main`** (o `master`)
- Si no, selecciónala manualmente

#### **4. Directorio raíz** (Root Directory)
- **DÉJALO VACÍO** (no escribas nada)
- Tu código está en la raíz del repositorio

#### **5. Idioma/Runtime** (Language/Runtime)
- Debería estar automáticamente en: **`Nodo`** o **`Node`**
- Si no, selecciónalo manualmente

#### **6. Comando de construcción** (Build Command)
```
npm install && npm run build && npx prisma migrate deploy
```
- **Copia y pega EXACTAMENTE esto** (incluye los `&&`)
- No cambies nada

#### **7. Comando de inicio** (Start Command)
```
npm start
```
- **Copia y pega EXACTAMENTE esto**
- No cambies nada

#### **8. Tipo de instancia** (Instance Type)
- ⚠️ **NO selecciones "Gratis" ($0/mes)**
- ✅ **Selecciona: "Motor de arranque" o "STARTER" ($7/mes)**
  - Razón: El plan gratuito se duerme después de 15 min de inactividad
  - STARTER mantiene el servicio activo 24/7

---

### **PASO 3: Vincular Base de Datos**

**ANTES de configurar variables de entorno, vincula la base de datos:**

1. **Desplázate hacia abajo** en el formulario
2. **Busca la sección "Avanzado"** o **"Linked Resources"** o **"Add Database"**
3. **Haz clic en "Add Database"** o el botón para agregar base de datos
4. **Selecciona**: `whatsapp-reminders-db` (la base de datos que creaste en el PASO 1)
5. **Verifica que `DATABASE_URL` aparezca automáticamente** en las variables de entorno

**⚠️ Si no encuentras la opción de vincular la base de datos:**
- No te preocupes, puedes hacerlo después de crear el servicio
- Irás a Settings → Environment → Add Database

---

### **PASO 4: Configurar Variables de Entorno (10 Variables)**

**Desplázate hasta la sección "Variables de entorno"**

**Haz clic en "Agregar variable de entorno"** y agrega estas 10 variables (una por una):

#### **Variable 1: NODE_ENV**
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Secret**: NO (déjalo desmarcado)

#### **Variable 2: PORT**
- **Key**: `PORT`
- **Value**: `10000`
- **Secret**: NO

#### **Variable 3: APP_TIMEZONE**
- **Key**: `APP_TIMEZONE`
- **Value**: `America/Bogota`
- **Secret**: NO

#### **Variable 4: DATABASE_URL**
- **Key**: `DATABASE_URL`
- **Value**: 
  - Si ya apareció automáticamente al vincular la DB, **NO la cambies**
  - Si NO aparece, ve a tu base de datos en Render y copia la "Internal Database URL"
- **Secret**: SÍ (márcalo como secreto 🔒)

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
- **Secret**: SÍ (MUY IMPORTANTE: márcalo como secreto 🔒)

#### **Variable 7: TWILIO_WHATSAPP_FROM**
- **Key**: `TWILIO_WHATSAPP_FROM`
- **Value**: `whatsapp:+14155238886`
  - Este es el número de Sandbox de Twilio
  - Si tienes un número aprobado, usa ese
- **Secret**: NO

#### **Variable 8: MY_WHATSAPP_NUMBER**
- **Key**: `MY_WHATSAPP_NUMBER`
- **Value**: `whatsapp:+57XXXXXXXXXX` (tu número personal)
  - Reemplaza `+57XXXXXXXXXX` con tu número real
  - Ejemplo: `whatsapp:+573001234567`
- **Secret**: NO

#### **Variable 9: PUBLIC_BASE_URL**
- **Key**: `PUBLIC_BASE_URL`
- **Value**: `https://whatsapp-reminders.onrender.com`
  - ⚠️ Este es un placeholder temporal
  - Lo actualizaremos después con la URL real que Render te dé
- **Secret**: NO

#### **Variable 10: TWILIO_WEBHOOK_PATH**
- **Key**: `TWILIO_WEBHOOK_PATH`
- **Value**: `/webhooks/twilio/whatsapp`
- **Secret**: NO

---

### **PASO 5: Verificar Todo Antes de Crear**

**Antes de hacer clic en "Implementar servicio web", verifica:**

- [ ] Repositorio: `josedjka-oss/whatsapp-reminders`
- [ ] Nombre: `whatsapp-reminders`
- [ ] Rama: `main` (o `master`)
- [ ] Región: `Oregón (oeste de EE. UU.)` (misma que la DB)
- [ ] Directorio raíz: (vacío)
- [ ] Idioma: `Nodo` o `Node`
- [ ] Build Command: `npm install && npm run build && npx prisma migrate deploy`
- [ ] Start Command: `npm start`
- [ ] Tipo de instancia: `STARTER ($7/mes)` (NO Gratis)
- [ ] Base de datos vinculada: `whatsapp-reminders-db` (si es posible)
- [ ] 10 variables de entorno configuradas (todas las listadas arriba)
- [ ] `DATABASE_URL` marcada como secreto 🔒
- [ ] `TWILIO_AUTH_TOKEN` marcada como secreto 🔒

---

### **PASO 6: Crear el Servicio Web**

**Una vez que todo esté verificado:**

1. **Desplázate hasta el final del formulario**
2. **Busca el botón "Implementar servicio web"** o **"Create Web Service"** o **"Deploy"**
3. **Haz clic en el botón**
4. **Render comenzará a desplegar tu aplicación**
   - Verás un indicador de progreso: "Creating..." → "Building..." → "Deploying..."
   - Esto puede tardar **3-5 minutos**

---

## ⏱️ MIENTRAS RENDER DESPLIEGA

**Mientras Render despliega, puedes:**

1. **Ver los logs en tiempo real** (si Render los muestra)
2. **Verificar que no haya errores**
3. **Esperar a que termine el despliegue**

**Verás mensajes como:**
- ✅ "Creating..."
- ✅ "Building..." (ejecutando Build Command)
- ✅ "Deploying..." (desplegando la aplicación)
- ✅ "Live" (cuando termine)

---

## ✅ DESPUÉS DEL DESPLIEGUE

**Una vez que Render termine de desplegar:**

1. ✅ Render te dará una URL pública: `https://whatsapp-reminders-xxxx.onrender.com`
2. ✅ Actualizaremos `PUBLIC_BASE_URL` con la URL real
3. ✅ Configuraremos el webhook de Twilio
4. ✅ Verificaremos que todo funcione correctamente

---

## 🆘 ¿PROBLEMAS?

### **Error en Build Command**

**Solución:**
- Verifica que el Build Command sea exactamente: `npm install && npm run build && npx prisma migrate deploy`
- Revisa los logs para ver qué falló específicamente

### **Error en Start Command**

**Solución:**
- Verifica que el Start Command sea: `npm start`
- Verifica que `package.json` tenga el script `start`

### **Error de migración de Prisma**

**Solución:**
- Verifica que `DATABASE_URL` esté configurada correctamente
- Verifica que la base de datos esté vinculada
- Revisa los logs para ver el error específico

### **Faltan variables de entorno**

**Solución:**
- Verifica que hayas agregado todas las 10 variables
- Puedes agregar variables después de crear el servicio en Settings → Environment

---

## 🎯 SIGUIENTE PASO

**Una vez que hagas clic en "Implementar servicio web":**

- Render comenzará a desplegar automáticamente
- Espera 3-5 minutos
- Avísame cuando termine el despliegue (estado "Live")
- Continuaremos con:
  - Actualizar `PUBLIC_BASE_URL` con la URL real
  - Configurar webhook de Twilio
  - Verificar que todo funcione

---

**¿Ya completaste todos los campos? Avísame cuando hagas clic en "Implementar servicio web" y te guío con los siguientes pasos. 🚀**
