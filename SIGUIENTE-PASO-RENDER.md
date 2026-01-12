# 🚀 SIGUIENTE PASO: Desplegar en Render.com

## ✅ Estado Actual
- ✅ Repositorio GitHub completamente organizado
- ✅ Estructura de archivos correcta
- ✅ Listo para despliegue en Render.com

---

## 📋 PRÓXIMOS PASOS

### **PASO 1: Crear Base de Datos PostgreSQL en Render**

1. **Ve a**: https://dashboard.render.com
2. **Inicia sesión** (o crea cuenta si no tienes)
3. **Haz clic en "New +"** (arriba a la derecha)
4. **Selecciona**: **"PostgreSQL"**
5. **Completa el formulario**:
   - **Name**: `whatsapp-reminders-db`
   - **Database**: `whatsapp_reminders`
   - **User**: `whatsapp_reminders_user`
   - **Region**: `Oregon (US West)` o el más cercano a ti
   - **PostgreSQL Version**: `16` (la más reciente)
   - **Plan**: 
     - ⚠️ **FREE**: Se duerme después de 90 días de inactividad
     - ✅ **STARTER ($7/mes)**: Recomendado para producción 24/7
     - ✅ **STANDARD ($20/mes)**: Para mayor rendimiento
6. **Haz clic en "Create Database"**
7. **Espera a que se cree** (tarda 1-2 minutos)
8. **Guarda la información**:
   - **Internal Database URL** (la necesitarás después)
   - **External Database URL** (para conexión desde fuera de Render)

---

### **PASO 2: Crear Servicio Web en Render**

1. **En Render Dashboard**, haz clic en **"New +"**
2. **Selecciona**: **"Web Service"**
3. **Conecta tu repositorio**:
   - Si es la primera vez, conecta tu cuenta de GitHub
   - Autoriza a Render a acceder a tus repositorios
   - **Selecciona el repositorio**: `josedjka-oss/recordatorios-de-whatsapp`
4. **Completa el formulario**:
   - **Name**: `whatsapp-reminders`
   - **Region**: `Oregon (US West)` o el mismo que la base de datos
   - **Branch**: `main` (o `master` si es tu rama principal)
   - **Root Directory**: (déjalo vacío)
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npm run build && npx prisma migrate deploy
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**:
     - ⚠️ **FREE**: Se duerme después de 15 min de inactividad (no recomendado para producción 24/7)
     - ✅ **STARTER ($7/mes)**: Recomendado para producción 24/7, siempre activo
5. **Vincula la base de datos**:
   - Haz clic en **"Add Database"**
   - Selecciona la base de datos que creaste: `whatsapp-reminders-db`
   - Render automáticamente configurará `DATABASE_URL`
6. **Variables de Entorno** (NO hagas clic en "Create Web Service" todavía):
   - Haz clic en **"Advanced"** → **"Add Environment Variable"**
   - Agrega estas variables:

---

### **PASO 3: Configurar Variables de Entorno en Render**

Agrega estas variables de entorno en Render (una por una):

#### **Variables Obligatorias:**

1. **`NODE_ENV`**
   - Value: `production`

2. **`PORT`**
   - Value: `10000` (Render usa este puerto por defecto)

3. **`APP_TIMEZONE`**
   - Value: `America/Bogota`

4. **`DATABASE_URL`**
   - Value: (Render lo configura automáticamente cuando vinculas la DB)
   - Si no aparece, cópiala de la base de datos PostgreSQL que creaste
   - Formato: `postgresql://user:password@host:port/database?sslmode=require`

5. **`TWILIO_ACCOUNT_SID`**
   - Value: (Tu Account SID de Twilio)
   - Obtener en: https://console.twilio.com/
   - Formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

6. **`TWILIO_AUTH_TOKEN`**
   - Value: (Tu Auth Token de Twilio)
   - Obtener en: https://console.twilio.com/
   - ⚠️ **Importante**: Marca esta variable como **"Secret"** (icono de candado)

7. **`TWILIO_WHATSAPP_FROM`**
   - Value: `whatsapp:+14155238886` (Sandbox) o tu número Twilio
   - Si usas Sandbox: `whatsapp:+14155238886`
   - Si tienes número aprobado: `whatsapp:+1XXXXXXXXXX`

8. **`MY_WHATSAPP_NUMBER`**
   - Value: Tu número personal en formato `whatsapp:+57XXXXXXXXXX`
   - Ejemplo: `whatsapp:+573001234567`

9. **`PUBLIC_BASE_URL`**
   - Value: (Lo configurarás DESPUÉS de crear el servicio)
   - Será algo como: `https://whatsapp-reminders-xxxx.onrender.com`
   - Por ahora déjalo vacío o pon un placeholder

10. **`TWILIO_WEBHOOK_PATH`**
    - Value: `/webhooks/twilio/whatsapp`

---

### **PASO 4: Crear el Servicio Web**

1. **Revisa que todas las variables estén configuradas** (excepto `PUBLIC_BASE_URL` que lo haremos después)
2. **Haz clic en "Create Web Service"**
3. **Render comenzará a desplegar tu aplicación**
4. **Espera a que termine el despliegue** (puede tardar 3-5 minutos)

---

### **PASO 5: Obtener URL Pública y Configurar PUBLIC_BASE_URL**

1. **Una vez desplegado**, Render te dará una URL pública:
   - Formato: `https://whatsapp-reminders-xxxx.onrender.com`
2. **Copia esta URL**
3. **Ve a tu servicio web en Render**
4. **Haz clic en "Environment"** (pestaña izquierda)
5. **Edita la variable `PUBLIC_BASE_URL`**:
   - Value: `https://whatsapp-reminders-xxxx.onrender.com` (tu URL real)
6. **Guarda los cambios**
7. **Render reiniciará automáticamente** con la nueva variable

---

### **PASO 6: Configurar Webhook de Twilio**

1. **Ve a**: https://console.twilio.com/
2. **Navega a**: **Messaging** → **Try it out** → **Send a WhatsApp message**
3. **Haz clic en "Configuration"** (o "Configuración")
4. **En "WHEN A MESSAGE COMES IN"**, pega:
   ```
   https://TU-URL-RENDER.onrender.com/webhooks/twilio/whatsapp
   ```
   (Reemplaza `TU-URL-RENDER` con tu URL real de Render)
5. **Método**: `HTTP POST`
6. **Guarda los cambios**

---

### **PASO 7: Verificar que Todo Funciona**

1. **Verifica el Health Check**:
   - Ve a: `https://TU-URL-RENDER.onrender.com/health`
   - Deberías ver: `{"status":"ok","timestamp":"...","checks":{...}}`

2. **Verifica los logs**:
   - En Render Dashboard → Tu servicio → "Logs"
   - Deberías ver: `[SERVER] 🚀 Servidor escuchando en puerto 10000`

3. **Prueba crear un recordatorio**:
   ```bash
   curl -X POST https://TU-URL-RENDER.onrender.com/api/reminders \
     -H "Content-Type: application/json" \
     -d '{
       "to": "whatsapp:+573001234567",
       "body": "Prueba de recordatorio",
       "scheduleType": "once",
       "sendAt": "2025-01-15T14:30:00",
       "timezone": "America/Bogota"
     }'
   ```

---

## ✅ CHECKLIST FINAL

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Servicio Web creado y desplegado
- [ ] Variables de entorno configuradas
- [ ] `PUBLIC_BASE_URL` configurada con la URL real
- [ ] Webhook de Twilio configurado
- [ ] Health check responde correctamente
- [ ] Logs muestran que el servidor está corriendo
- [ ] Scheduler iniciado (verificar logs)

---

## 🎉 ¡LISTO!

Tu aplicación debería estar funcionando 24/7 en Render.com. El scheduler se ejecutará automáticamente cada minuto y los webhooks de Twilio estarán recibiendo mensajes.

---

## 📚 Documentación de Referencia

- **Render Dashboard**: https://dashboard.render.com
- **Twilio Console**: https://console.twilio.com/
- **Guía completa de despliegue**: `DEPLOY-PRODUCCION.md`
- **Guía paso a paso de Render**: `PASO-A-PASO-RENDER.md`
