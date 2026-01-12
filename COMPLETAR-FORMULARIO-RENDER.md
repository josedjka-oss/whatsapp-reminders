# 📝 COMPLETAR FORMULARIO DE RENDER - PASO A PASO

## 🎯 Estás viendo el formulario de Render para crear servicio web

### **PASO 1: Conectar Repositorio GitHub**

**En la sección "Proveedor de Git":**

1. **Haz clic en "Conectar"** o el botón para conectar GitHub
2. Si es la primera vez:
   - Render te pedirá autorizar GitHub
   - Autoriza a Render a acceder a tus repositorios
3. **Después de autorizar**, busca tu repositorio:
   - Busca: `josedjka-oss/recordatorios-de-whatsapp`
   - O escribe en el buscador: `recordatorios-de-whatsapp`
   - **Haz clic en tu repositorio** para seleccionarlo

**✅ Verifica que veas:**
- Repositorio: `josedjka-oss/recordatorios-de-whatsapp`
- Rama: `main` (o `master`)

---

### **PASO 2: Configurar Campos del Formulario**

**Completa estos campos EN ORDEN:**

#### **1. Nombre** (Name)
```
whatsapp-reminders
```
- Escribe: `whatsapp-reminders`
- Este será el nombre de tu servicio

#### **2. Rama** (Branch)
- Selecciona: **`main`** (o `master` si es tu rama principal)
- Ya debería estar seleccionado automáticamente después de conectar el repositorio

#### **3. Región** (Region)
- Selecciona: **`Oregón (oeste de EE. UU.)`** o **`Oregon (US West)`**
- ⚠️ **IMPORTANTE**: Usa la misma región que tu base de datos para mejor rendimiento

#### **4. Directorio raíz** (Root Directory)
- **DÉJALO VACÍO** (no escribas nada)
- Tu código está en la raíz del repositorio

#### **5. Idioma/Runtime** (Language/Runtime)
- Selecciona: **`Nodo`** o **`Node`**
- Render debería detectarlo automáticamente

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
- **NO selecciones "Gratis" ($0/mes)**
- ⚠️ **Selecciona: "Motor de arranque" o "STARTER" ($7/mes)**
  - Razón: El plan gratuito se duerme después de 15 min de inactividad
  - STARTER mantiene el servicio activo 24/7

---

### **PASO 3: Configurar Variables de Entorno**

**Desplázate hacia abajo hasta la sección "Variables de entorno"**

**Haz clic en "Agregar variable de entorno"** y agrega estas 10 variables (una por una):

#### **Variable 1:**
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Secret**: NO (déjalo desmarcado)

#### **Variable 2:**
- **Key**: `PORT`
- **Value**: `10000`
- **Secret**: NO

#### **Variable 3:**
- **Key**: `APP_TIMEZONE`
- **Value**: `America/Bogota`
- **Secret**: NO

#### **Variable 4:**
- **Key**: `DATABASE_URL`
- **Value**: (Esta puede aparecer automáticamente si vinculaste la DB)
  - Si NO aparece automáticamente:
    1. Ve a tu base de datos en Render
    2. Copia la "Internal Database URL"
    3. Pégalo aquí
- **Secret**: SÍ (márcalo como secreto 🔒)

#### **Variable 5:**
- **Key**: `TWILIO_ACCOUNT_SID`
- **Value**: (Tu Account SID de Twilio)
  - Obtener en: https://console.twilio.com/
  - Formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret**: NO

#### **Variable 6:**
- **Key**: `TWILIO_AUTH_TOKEN`
- **Value**: (Tu Auth Token de Twilio)
  - Obtener en: https://console.twilio.com/
  - Haz clic en "View" para verlo
- **Secret**: SÍ (MUY IMPORTANTE: márcalo como secreto 🔒)

#### **Variable 7:**
- **Key**: `TWILIO_WHATSAPP_FROM`
- **Value**: `whatsapp:+14155238886`
- **Secret**: NO

#### **Variable 8:**
- **Key**: `MY_WHATSAPP_NUMBER`
- **Value**: `whatsapp:+57XXXXXXXXXX` (tu número personal)
  - Reemplaza `+57XXXXXXXXXX` con tu número real
  - Ejemplo: `whatsapp:+573001234567`
- **Secret**: NO

#### **Variable 9:**
- **Key**: `PUBLIC_BASE_URL`
- **Value**: `https://whatsapp-reminders.onrender.com`
  - ⚠️ Este es un placeholder temporal
  - Lo actualizaremos después con la URL real que Render te dé
- **Secret**: NO

#### **Variable 10:**
- **Key**: `TWILIO_WEBHOOK_PATH`
- **Value**: `/webhooks/twilio/whatsapp`
- **Secret**: NO

---

### **PASO 4: Vincular Base de Datos**

**IMPORTANTE: Antes de crear el servicio, vincula la base de datos**

1. **Busca la sección "Avanzado"** (puede estar en una pestaña o sección separada)
2. **O busca "Add Database"** o **"Vincular Base de Datos"**
3. **Haz clic en "Add Database"** o el botón para agregar base de datos
4. **Selecciona**: `whatsapp-reminders-db` (la base de datos que creaste en el PASO 1)
5. **Verifica que `DATABASE_URL` aparezca automáticamente** en las variables de entorno

**⚠️ Si no encuentras la opción de vincular la base de datos:**
- No te preocupes, puedes hacerlo después de crear el servicio
- Irás a Settings → Environment → Add Database

---

### **PASO 5: Verificar Todo Antes de Crear**

**Antes de hacer clic en "Implementar servicio web", verifica:**

- [ ] Repositorio: `josedjka-oss/recordatorios-de-whatsapp`
- [ ] Nombre: `whatsapp-reminders`
- [ ] Rama: `main`
- [ ] Región: `Oregón (oeste de EE. UU.)`
- [ ] Directorio raíz: (vacío)
- [ ] Idioma: `Nodo` o `Node`
- [ ] Build Command: `npm install && npm run build && npx prisma migrate deploy`
- [ ] Start Command: `npm start`
- [ ] Tipo de instancia: `STARTER ($7/mes)` (NO Gratis)
- [ ] 10 variables de entorno configuradas:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `10000`
  - [ ] `APP_TIMEZONE` = `America/Bogota`
  - [ ] `DATABASE_URL` = (configurado, marcado como secreto 🔒)
  - [ ] `TWILIO_ACCOUNT_SID` = (tu Account SID)
  - [ ] `TWILIO_AUTH_TOKEN` = (tu Auth Token, marcado como secreto 🔒)
  - [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`
  - [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX`
  - [ ] `PUBLIC_BASE_URL` = `https://whatsapp-reminders.onrender.com` (temporal)
  - [ ] `TWILIO_WEBHOOK_PATH` = `/webhooks/twilio/whatsapp`
- [ ] Base de datos vinculada: `whatsapp-reminders-db` (si es posible)

---

### **PASO 6: Crear el Servicio Web**

**Una vez que todo esté verificado:**

1. **Desplázate hasta el final del formulario**
2. **Busca el botón "Implementar servicio web"** o **"Create Web Service"** o **"Deploy"**
3. **Haz clic en el botón**
4. **Render comenzará a desplegar tu aplicación**
   - Verás un indicador de progreso
   - Esto puede tardar 3-5 minutos

---

## ⚠️ IMPORTANTE: Orden de Pasos

**Orden correcto:**
1. ✅ Conectar repositorio GitHub
2. ✅ Llenar campos del formulario (nombre, rama, región, comandos, etc.)
3. ✅ Configurar las 10 variables de entorno
4. ✅ Vincular base de datos (si es posible antes de crear)
5. ✅ Verificar todo
6. ✅ Crear el servicio web

---

## 🆘 ¿PROBLEMAS?

### **No veo la opción de conectar GitHub**

**Solución:**
- Haz clic en "Conectar" o "Connect" en la sección "Proveedor de Git"
- Si no aparece, puede que ya tengas GitHub conectado
- Busca tu repositorio en la lista

### **No puedo vincular la base de datos antes de crear**

**Solución:**
- No es crítico, puedes hacerlo después de crear el servicio
- Ve a Settings → Environment → Add Database
- O configura `DATABASE_URL` manualmente copiando la URL de la base de datos

### **No tengo las credenciales de Twilio**

**Solución:**
- Ve a: https://console.twilio.com/
- Crea una cuenta gratuita si no tienes
- Obtén Account SID y Auth Token del Dashboard principal

---

## ✅ SIGUIENTE PASO

**Una vez que hagas clic en "Implementar servicio web":**
- Render comenzará a desplegar automáticamente
- Verás los logs en tiempo real
- Espera 3-5 minutos
- Avísame cuando termine el despliegue y seguimos con el PASO 4/5

---

**¿Tienes todo listo? Avísame cuando hagas clic en "Implementar servicio web" o si necesitas ayuda con algún campo específico. 🚀**
