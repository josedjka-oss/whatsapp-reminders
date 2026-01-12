# 🚀 GUÍA PASO A PASO COMPLETA: Desplegar en Render.com

## ✅ ANTES DE EMPEZAR

**Verifica que tengas:**
- [x] Cuenta de Render.com (crear si no tienes: https://dashboard.render.com)
- [x] Cuenta de Twilio (crear si no tienes: https://console.twilio.com/)
- [x] Credenciales de Twilio (Account SID y Auth Token)
- [x] Repositorio GitHub listo: `josedjka-oss/recordatorios-de-whatsapp`

---

## 📋 PASO 1: CREAR BASE DE DATOS POSTGRESQL EN RENDER

### 1.1. Ir a Render Dashboard

1. **Abre tu navegador** y ve a: **https://dashboard.render.com**
2. **Inicia sesión** (o crea cuenta si no tienes)
3. Si es la primera vez, Render te pedirá verificar tu email

### 1.2. Crear Base de Datos PostgreSQL

1. **Haz clic en el botón "New +"** (arriba a la derecha, verde o azul)
2. **Selecciona**: **"PostgreSQL"** (de la lista de opciones)

### 1.3. Llenar Formulario de Base de Datos

**Completa estos campos:**

- **Name**: 
  ```
  whatsapp-reminders-db
  ```
  (Este es el nombre del servicio, puede ser cualquier nombre)

- **Database**: 
  ```
  whatsapp_reminders
  ```
  (Nombre de la base de datos dentro de PostgreSQL)

- **User**: 
  ```
  whatsapp_reminders_user
  ```
  (Usuario de la base de datos)

- **Region**: 
  - Selecciona: **"Oregon (US West)"** o la región más cercana a ti
  - Recomendado: **"Oregon"** para mejor disponibilidad

- **PostgreSQL Version**: 
  - Selecciona: **"16"** (la más reciente disponible)

- **Plan**: 
  - ⚠️ **FREE**: Se duerme después de 90 días de inactividad (NO recomendado)
  - ✅ **STARTER ($7/mes)**: Recomendado para producción 24/7
  - ✅ **STANDARD ($20/mes)**: Para mayor rendimiento
  
  **Para producción 24/7, elige STARTER ($7/mes)**

### 1.4. Crear Base de Datos

1. **Revisa que todos los campos estén correctos**
2. **Haz clic en el botón "Create Database"** (verde, abajo a la derecha)
3. **Espera 1-2 minutos** mientras Render crea la base de datos
4. Verás un indicador de progreso: "Creating..." → "Live"

### 1.5. Guardar Información de la Base de Datos

Una vez creada, Render te mostrará:

- **Internal Database URL**: (Para conexión desde otros servicios de Render)
- **External Database URL**: (Para conexión desde fuera de Render)

**⚠️ IMPORTANTE**: 
- **NO necesitas copiar estas URLs manualmente** si vinculas la base de datos al servicio web
- Render las configurará automáticamente
- Pero **guarda estas URLs** por si necesitas conectarte manualmente

---

## 📋 PASO 2: CREAR SERVICIO WEB EN RENDER

### 2.1. Iniciar Creación de Servicio Web

1. **En Render Dashboard**, haz clic en **"New +"** (arriba a la derecha)
2. **Selecciona**: **"Web Service"** (de la lista de opciones)

### 2.2. Conectar Repositorio GitHub

1. **Si es la primera vez**, Render te pedirá conectar tu cuenta de GitHub:
   - Haz clic en **"Connect GitHub"** o **"Connect Repository"**
   - Se abrirá una ventana para autorizar a Render
   - **Autoriza a Render** a acceder a tus repositorios
   - Puedes dar acceso a todos los repositorios o solo a repositorios específicos

2. **Una vez conectado**, busca y **selecciona tu repositorio**:
   - Busca: `josedjka-oss/recordatorios-de-whatsapp`
   - O escribe: `recordatorios-de-whatsapp` en el buscador
   - **Haz clic en el repositorio** para seleccionarlo

3. **Verifica que esté seleccionado** correctamente

### 2.3. Configurar Servicio Web

**Completa estos campos:**

- **Name**: 
  ```
  whatsapp-reminders
  ```
  (Este será el nombre de tu servicio web)

- **Region**: 
  - Selecciona: **"Oregon (US West)"** (el mismo que la base de datos)
  - Esto asegura que el servicio y la DB estén en la misma región

- **Branch**: 
  - Selecciona: **"main"** (o "master" si es tu rama principal)
  - Verifica que la rama sea la correcta

- **Root Directory**: 
  - **Déjalo vacío** (o escribe `/` si es necesario)
  - Tu código está en la raíz del repositorio

- **Runtime**: 
  - Selecciona: **"Node"**
  - Render detectará automáticamente que es un proyecto Node.js

- **Build Command**: 
  ```
  npm install && npm run build && npx prisma migrate deploy
  ```
  (Copia y pega exactamente esto)

- **Start Command**: 
  ```
  npm start
  ```
  (Copia y pega exactamente esto)

- **Plan**: 
  - ⚠️ **FREE**: Se duerme después de 15 min de inactividad (NO recomendado para producción 24/7)
  - ✅ **STARTER ($7/mes)**: Recomendado para producción 24/7, siempre activo
  
  **Para producción 24/7, elige STARTER ($7/mes)**

### 2.4. Vincular Base de Datos

1. **Desplázate hacia abajo** en el formulario
2. **Busca la sección "Add Database"** o "Database"
3. **Haz clic en "Add Database"** o selecciona de la lista
4. **Selecciona la base de datos** que creaste: `whatsapp-reminders-db`
5. **Render automáticamente configurará la variable `DATABASE_URL`** para ti
6. Verás que `DATABASE_URL` aparece en la lista de variables de entorno

---

## 📋 PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### 3.1. Acceder a Variables de Entorno

1. **En el mismo formulario del servicio web**, busca la sección **"Environment Variables"**
2. O haz clic en **"Advanced"** → **"Add Environment Variable"**
3. Verás una lista de variables (puede estar vacía o tener `DATABASE_URL` si ya vinculaste la DB)

### 3.2. Agregar Variables (Una por Una)

**Haz clic en "Add Environment Variable"** y agrega cada una:

#### **Variable 1: NODE_ENV**

- **Key**: `NODE_ENV`
- **Value**: `production`
- **Secret**: NO (déjalo desmarcado)
- Haz clic en **"Add"** o **"Save"**

#### **Variable 2: PORT**

- **Key**: `PORT`
- **Value**: `10000`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

#### **Variable 3: APP_TIMEZONE**

- **Key**: `APP_TIMEZONE`
- **Value**: `America/Bogota`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

#### **Variable 4: DATABASE_URL**

- **Key**: `DATABASE_URL`
- **Value**: (Render ya lo configuró automáticamente cuando vinculaste la DB)
- Si no aparece, cópiala de la base de datos PostgreSQL:
  - Ve a tu base de datos en Render
  - Copia la "Internal Database URL"
  - Pégalo aquí
- **Secret**: SÍ (márcalo como secreto con el icono de candado)
- Haz clic en **"Add"** o **"Save"**

#### **Variable 5: TWILIO_ACCOUNT_SID**

- **Key**: `TWILIO_ACCOUNT_SID`
- **Value**: (Tu Account SID de Twilio)
  - Obtener en: https://console.twilio.com/
  - Formato: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret**: NO (pero es sensible, así que ten cuidado)
- Haz clic en **"Add"** o **"Save"**

#### **Variable 6: TWILIO_AUTH_TOKEN**

- **Key**: `TWILIO_AUTH_TOKEN`
- **Value**: (Tu Auth Token de Twilio)
  - Obtener en: https://console.twilio.com/
  - ⚠️ **Importante**: Marca esta variable como **"Secret"** (icono de candado 🔒)
- Haz clic en **"Add"** o **"Save"**

#### **Variable 7: TWILIO_WHATSAPP_FROM**

- **Key**: `TWILIO_WHATSAPP_FROM`
- **Value**: 
  - Si usas **Sandbox**: `whatsapp:+14155238886`
  - Si tienes número aprobado: `whatsapp:+1XXXXXXXXXX`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

#### **Variable 8: MY_WHATSAPP_NUMBER**

- **Key**: `MY_WHATSAPP_NUMBER`
- **Value**: Tu número personal en formato `whatsapp:+57XXXXXXXXXX`
  - Ejemplo: `whatsapp:+573001234567`
  - Reemplaza `+57XXXXXXXXXX` con tu número real (con código de país)
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

#### **Variable 9: PUBLIC_BASE_URL**

- **Key**: `PUBLIC_BASE_URL`
- **Value**: `https://whatsapp-reminders.onrender.com` (placeholder temporal)
  - ⚠️ **IMPORTANTE**: Después de crear el servicio, Render te dará una URL real
  - Por ahora pon un placeholder, lo actualizaremos en el PASO 5
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

#### **Variable 10: TWILIO_WEBHOOK_PATH**

- **Key**: `TWILIO_WEBHOOK_PATH`
- **Value**: `/webhooks/twilio/whatsapp`
- **Secret**: NO
- Haz clic en **"Add"** o **"Save"**

### 3.3. Verificar Variables

**Verifica que todas las variables estén agregadas:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `APP_TIMEZONE` = `America/Bogota`
- [ ] `DATABASE_URL` = (configurado automáticamente)
- [ ] `TWILIO_ACCOUNT_SID` = (tu Account SID)
- [ ] `TWILIO_AUTH_TOKEN` = (tu Auth Token, marcado como secreto 🔒)
- [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886` (o tu número)
- [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+57XXXXXXXXXX` (tu número)
- [ ] `PUBLIC_BASE_URL` = (placeholder por ahora)
- [ ] `TWILIO_WEBHOOK_PATH` = `/webhooks/twilio/whatsapp`

---

## 📋 PASO 4: CREAR EL SERVICIO WEB

1. **Revisa que todas las variables estén configuradas** (excepto `PUBLIC_BASE_URL` que usará un placeholder por ahora)
2. **Revisa que el repositorio esté conectado** correctamente
3. **Revisa que la base de datos esté vinculada**
4. **Haz clic en el botón "Create Web Service"** (verde, abajo a la derecha)

### 4.1. Render Comenzará a Desplegar

Render mostrará:
- **"Creating..."** → Render está preparando el servicio
- **"Building..."** → Render está ejecutando el Build Command
- **"Deploying..."** → Render está desplegando tu aplicación

**Esto puede tardar 3-5 minutos.** 

Mientras tanto, puedes ver los logs en tiempo real haciendo clic en "Logs" (pestaña izquierda).

### 4.2. Esperar a que Termine el Despliegue

**Verifica en los logs que:**
- ✅ `npm install` se ejecutó correctamente
- ✅ `npm run build` se ejecutó correctamente
- ✅ `npx prisma migrate deploy` se ejecutó correctamente
- ✅ `npm start` inició el servidor

**Si hay errores:**
- Revisa los logs para ver qué falló
- Corrige el problema y Render volverá a desplegar automáticamente

---

## 📋 PASO 5: OBTENER URL PÚBLICA Y ACTUALIZAR PUBLIC_BASE_URL

### 5.1. Obtener URL Pública

1. **Una vez desplegado**, Render te mostrará tu servicio web
2. **Arriba de la página**, verás una sección con información del servicio
3. **Busca "URL"** o "Your service is live at:"
4. **Copia la URL pública**:
   - Formato: `https://whatsapp-reminders-xxxx.onrender.com`
   - Ejemplo: `https://whatsapp-reminders-abc123.onrender.com`

### 5.2. Actualizar Variable PUBLIC_BASE_URL

1. **En la página de tu servicio web**, haz clic en **"Environment"** (pestaña izquierda)
2. **Busca la variable `PUBLIC_BASE_URL`** en la lista
3. **Haz clic en el icono de editar** (lápiz ✏️) junto a `PUBLIC_BASE_URL`
4. **Reemplaza el valor placeholder** con tu URL real:
   - Value: `https://whatsapp-reminders-xxxx.onrender.com` (tu URL real)
5. **Haz clic en "Save Changes"** o "Update"
6. **Render reiniciará automáticamente** tu servicio con la nueva variable
7. **Espera 1-2 minutos** mientras Render reinicia

---

## 📋 PASO 6: CONFIGURAR WEBHOOK DE TWILIO

### 6.1. Ir a Twilio Console

1. **Abre tu navegador** y ve a: **https://console.twilio.com/**
2. **Inicia sesión** en tu cuenta de Twilio

### 6.2. Navegar a Configuración de WhatsApp

1. **En el menú izquierdo**, haz clic en **"Messaging"** o **"Mensajería"**
2. **Haz clic en "Try it out"** o **"Pruébalo"**
3. **Haz clic en "Send a WhatsApp message"** o **"Envía un mensaje de WhatsApp"**
4. **Haz clic en "Configuration"** o **"Configuración"** (arriba o en una pestaña)

### 6.3. Configurar Webhook

1. **Busca la sección "WHEN A MESSAGE COMES IN"** o **"CUANDO LLEGA UN MENSAJE"**
2. **En el campo de URL**, pega tu webhook URL:
   ```
   https://TU-URL-RENDER.onrender.com/webhooks/twilio/whatsapp
   ```
   **Reemplaza `TU-URL-RENDER` con tu URL real de Render**
   
   Ejemplo:
   ```
   https://whatsapp-reminders-abc123.onrender.com/webhooks/twilio/whatsapp
   ```

3. **En el campo "HTTP Method"** o **"Método HTTP"**, selecciona: **"POST"**

4. **Haz clic en "Save"** o **"Guardar"** (botón verde o azul)

### 6.4. Verificar Configuración

**Verifica que:**
- ✅ La URL del webhook sea correcta (sin espacios, con https://)
- ✅ El método sea POST
- ✅ Los cambios se hayan guardado

---

## 📋 PASO 7: VERIFICAR QUE TODO FUNCIONA

### 7.1. Verificar Health Check

1. **Abre tu navegador** y ve a: `https://TU-URL-RENDER.onrender.com/health`
2. **Deberías ver una respuesta JSON**:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-10T...",
     "timezone": "America/Bogota",
     "checks": {
       "database": "ok",
       "scheduler": "ok"
     }
   }
   ```
3. **Si ves esto**, ¡tu aplicación está funcionando! ✅

### 7.2. Verificar Logs en Render

1. **En Render Dashboard**, ve a tu servicio web
2. **Haz clic en "Logs"** (pestaña izquierda)
3. **Deberías ver**:
   ```
   [INIT] Iniciando aplicación...
   [INIT] ✅ Variables de entorno críticas verificadas.
   [INIT] ✅ Conectado a la base de datos
   [SCHEDULER] Iniciando scheduler de recordatorios...
   [SCHEDULER] ✅ Scheduler iniciado correctamente.
   [SERVER] 🚀 Servidor escuchando en puerto 10000
   ```
4. **Si ves estos mensajes**, todo está funcionando correctamente ✅

### 7.3. Probar Crear un Recordatorio

**Opción A: Usar curl (PowerShell)**

Abre PowerShell y ejecuta (reemplaza `TU-URL-RENDER` y `+57XXXXXXXXXX`):

```powershell
curl -X POST https://TU-URL-RENDER.onrender.com/api/reminders `
  -H "Content-Type: application/json" `
  -d '{
    "to": "whatsapp:+57XXXXXXXXXX",
    "body": "Prueba de recordatorio desde Render",
    "scheduleType": "once",
    "sendAt": "2025-01-15T14:30:00",
    "timezone": "America/Bogota"
  }'
```

**Opción B: Usar Postman o herramienta similar**

1. **Método**: POST
2. **URL**: `https://TU-URL-RENDER.onrender.com/api/reminders`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body** (raw JSON):
   ```json
   {
     "to": "whatsapp:+57XXXXXXXXXX",
     "body": "Prueba de recordatorio desde Render",
     "scheduleType": "once",
     "sendAt": "2025-01-15T14:30:00",
     "timezone": "America/Bogota"
   }
   ```
5. **Haz clic en "Send"**

**Verifica que:**
- ✅ La respuesta sea `200 OK` o `201 Created`
- ✅ Recibas un JSON con el recordatorio creado

### 7.4. Verificar que el Scheduler Está Funcionando

1. **Ve a los logs en Render**
2. **Espera 1-2 minutos**
3. **Deberías ver mensajes cada minuto**:
   ```
   [SCHEDULER] [2025-01-10T...] Verificando recordatorios...
   [SCHEDULER] Encontrados X recordatorios activos.
   [SCHEDULER] Verificación completada. Enviados: 0, Errores: 0
   ```
4. **Si ves estos mensajes**, el scheduler está funcionando ✅

---

## ✅ CHECKLIST FINAL

**Verifica que todo esté completo:**

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Servicio Web creado y desplegado
- [ ] Todas las variables de entorno configuradas
- [ ] `PUBLIC_BASE_URL` configurada con la URL real (no placeholder)
- [ ] Webhook de Twilio configurado correctamente
- [ ] Health check responde correctamente (`/health`)
- [ ] Logs muestran que el servidor está corriendo
- [ ] Scheduler iniciado (ver mensajes cada minuto en logs)
- [ ] Prueba de crear recordatorio funciona

---

## 🎉 ¡LISTO!

**Tu aplicación está desplegada y funcionando 24/7 en Render.com.**

**Características activas:**
- ✅ Scheduler ejecutándose cada minuto
- ✅ Webhooks de Twilio recibiendo mensajes
- ✅ Base de datos PostgreSQL funcionando
- ✅ Reinicio automático si falla
- ✅ Logs centralizados en Render

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Build failed"

**Soluciones:**
1. Revisa los logs para ver el error específico
2. Verifica que el Build Command sea correcto: `npm install && npm run build && npx prisma migrate deploy`
3. Verifica que `package.json` tenga el script `build`
4. Verifica que `tsconfig.json` esté correcto

### Error: "Database connection failed"

**Soluciones:**
1. Verifica que la base de datos esté vinculada al servicio web
2. Verifica que `DATABASE_URL` esté configurada correctamente
3. Verifica que la base de datos esté en la misma región que el servicio web

### Error: "Port already in use" o "EADDRINUSE"

**Soluciones:**
1. Verifica que `PORT=10000` esté configurado
2. Render usa el puerto 10000 automáticamente, no necesitas cambiarlo

### Webhook de Twilio no recibe mensajes

**Soluciones:**
1. Verifica que `PUBLIC_BASE_URL` sea correcta (sin espacios, con https://)
2. Verifica que el webhook en Twilio sea: `https://TU-URL-RENDER.onrender.com/webhooks/twilio/whatsapp`
3. Verifica que el método sea POST
4. Revisa los logs en Render para ver si llegan requests al webhook

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Render Dashboard**: https://dashboard.render.com
- **Twilio Console**: https://console.twilio.com/
- **Documentación de Render**: https://render.com/docs
- **Documentación de Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp

---

**¡Felicidades! Tu aplicación está lista para producción. 🚀**
