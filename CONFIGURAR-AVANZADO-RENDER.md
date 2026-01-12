# ⚙️ CONFIGURAR SECCIÓN AVANZADO EN RENDER

## 📋 Estás en la Sección "Avanzado"

Veo que estás en la sección avanzada del formulario. Necesitas configurar algunos campos aquí antes de crear el servicio.

---

## 🔧 CONFIGURACIONES EN SECCIÓN AVANZADO

### **1. Ruta de Verificación de Salud (Health Check Path)**

**Campo que veo:**
- Actualmente muestra: `/salud` (probablemente traducción automática)

**Debe ser:**
```
/health
```

**Acción:**
1. **Haz clic en el campo "Ruta de verificación de salud"** o "Health check path"
2. **Si dice `/salud`, cámbialo a**: `/health`
3. **O si está vacío, escribe**: `/health`

**⚠️ IMPORTANTE:** 
- Tu aplicación tiene un endpoint `/health` (no `/salud`)
- Esto permite que Render verifique que tu aplicación esté funcionando
- Render enviará peticiones periódicas a esta ruta

---

### **2. Comando de Pre-despliegue (Pre-deploy Command)**

**Campo que veo:**
- Actualmente está vacío

**Puedes dejarlo vacío** porque:
- Ya estás usando `npx prisma migrate deploy` en el Build Command
- No necesitas un comando adicional de pre-despliegue

**O si prefieres separar las migraciones:**
```
npx prisma migrate deploy
```

**⚠️ RECOMENDACIÓN:** Déjalo vacío por ahora. Ya está incluido en el Build Command.

---

### **3. Implementación Automática**

**Campo que veo:**
- Está activado ("Activador de implementación automática" → "En confirmación")

**Esto está BIEN:**
- ✅ Déjalo activado
- Esto significa que Render desplegará automáticamente cuando hagas push a GitHub

---

### **4. Archivos Secretos**

**No necesitas configurar esto:**
- Estás usando variables de entorno para los secretos
- Esto es suficiente para tu aplicación

---

### **5. Disco**

**No necesitas configurar esto:**
- Tu aplicación no necesita almacenamiento persistente de archivos
- La base de datos PostgreSQL ya maneja el almacenamiento

---

## 🎯 BUSCAR: VINCULAR BASE DE DATOS

**En la sección Avanzado, busca:**

1. **Scroll hacia abajo** o **busca una sección llamada:**
   - "Linked Resources" o "Recursos Vinculados"
   - "Add Database" o "Agregar Base de Datos"
   - "Database" o "Base de Datos"

2. **Si encuentras "Add Database" o similar:**
   - Haz clic en "Add Database"
   - Selecciona: `whatsapp-reminders-db`
   - Esto configurará automáticamente `DATABASE_URL`

3. **Si NO encuentras la opción de vincular base de datos:**
   - No es crítico, puedes hacerlo después de crear el servicio
   - Ve a Settings → Environment → Add Database después

---

## ✅ RESUMEN DE CONFIGURACIÓN EN AVANZADO

**Configura en esta sección:**

- [ ] **Ruta de verificación de salud**: `/health` (NO `/salud`)
- [ ] **Comando de pre-despliegue**: (déjalo vacío, ya está en Build Command)
- [ ] **Implementación automática**: ✅ Activado (está bien)
- [ ] **Vincular base de datos**: (buscar "Add Database" si está disponible)

**NO necesitas configurar:**
- ❌ Archivos secretos (usas variables de entorno)
- ❌ Disco (no es necesario)

---

## 🚀 SIGUIENTE PASO: Variables de Entorno

**Después de configurar la sección Avanzado:**

1. **Vuelve a la sección principal del formulario** (scroll hacia arriba)
2. **Busca la sección "Variables de entorno"** o "Environment Variables"
3. **Agrega las 10 variables de entorno** (si aún no las agregaste)
4. **Verifica que todo esté correcto**
5. **Crea el servicio web**

---

## 📋 CHECKLIST ANTES DE CREAR SERVICIO

**Antes de hacer clic en "Implementar servicio web", verifica:**

### **En la sección principal:**
- [ ] Repositorio: `josedjka-oss/whatsapp-reminders`
- [ ] Nombre: `whatsapp-reminders`
- [ ] Rama: `main`
- [ ] Región: `Oregón (oeste de EE. UU.)`
- [ ] Build Command: `npm install && npm run build && npx prisma migrate deploy`
- [ ] Start Command: `npm start`
- [ ] Tipo de instancia: `STARTER ($7/mes)` (NO Gratis)

### **En la sección Avanzado:**
- [ ] Ruta de verificación de salud: `/health`
- [ ] Comando de pre-despliegue: (vacío o `npx prisma migrate deploy`)
- [ ] Base de datos vinculada: `whatsapp-reminders-db` (si es posible)

### **Variables de entorno (10 variables):**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `APP_TIMEZONE` = `America/Bogota`
- [ ] `DATABASE_URL` = (automático o manual, marcado como SECRETO 🔒)
- [ ] `TWILIO_ACCOUNT_SID` = (tu Account SID)
- [ ] `TWILIO_AUTH_TOKEN` = (tu Auth Token, marcado como SECRETO 🔒)
- [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`
- [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX`
- [ ] `PUBLIC_BASE_URL` = `https://whatsapp-reminders.onrender.com` (temporal)
- [ ] `TWILIO_WEBHOOK_PATH` = `/webhooks/twilio/whatsapp`

---

## 🆘 ¿PROBLEMAS?

### **No encuentro "Add Database" en Avanzado**

**Solución:**
- No es crítico, puedes vincularlo después de crear el servicio
- Ve a Settings → Environment → Add Database después de crear
- O configura `DATABASE_URL` manualmente copiando la URL de la base de datos

### **La ruta de salud está en español (/salud)**

**Solución:**
- Cámbiala a `/health` (en inglés)
- Tu aplicación tiene el endpoint en `/health`, no `/salud`

### **No veo la sección de Variables de Entorno**

**Solución:**
- Vuelve a la sección principal del formulario (scroll hacia arriba)
- Busca "Variables de entorno" o "Environment Variables"
- O busca "Agregar variable de entorno"

---

## 🎯 SIGUIENTE ACCIÓN

**Después de configurar la sección Avanzado:**

1. ✅ Verifica que la ruta de salud sea `/health`
2. ✅ Busca y vincula la base de datos (si es posible)
3. ✅ Vuelve a la sección principal del formulario
4. ✅ Agrega las 10 variables de entorno (si aún no las agregaste)
5. ✅ Verifica que todo esté correcto
6. ✅ Haz clic en "Implementar servicio web"

---

**¿Ya configuraste la ruta de salud como `/health` y buscaste vincular la base de datos? Avísame cuando termines y seguimos con las variables de entorno y crear el servicio. 🚀**
