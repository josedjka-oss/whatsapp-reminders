# 🚀 Guía Paso a Paso: Desplegar en Render.com

Esta guía te lleva paso a paso para desplegar tu aplicación en Render. Sigue cada paso en orden.

---

## ✅ Paso 1: Preparar el Proyecto Localmente

### 1.1. Verificar que el código esté listo

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd C:\Users\user\Desktop\WHATS
```

Verifica que tengas estos archivos:
- ✅ `render.yaml`
- ✅ `package.json`
- ✅ `prisma/schema.prisma` (con PostgreSQL)
- ✅ `src/server.ts`

### 1.2. Preparar repositorio Git (Recomendado)

Si aún no tienes un repositorio Git:

```powershell
# Inicializar Git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para deploy en Render"
```

**IMPORTANTE:** Si ya tienes un repositorio en GitHub/GitLab/Bitbucket, haz push:

```powershell
git push origin main
```

**O si es la primera vez:**
1. Crea un repositorio en GitHub (ve a github.com y crea uno nuevo)
2. Conecta tu repositorio local:
   ```powershell
   git remote add origin https://github.com/TU-USUARIO/whatsapp-reminders.git
   git branch -M main
   git push -u origin main
   ```

---

## ✅ Paso 2: Crear Cuenta en Render.com

### 2.1. Registrarse

1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started for Free"** o **"Sign Up"**
3. Puedes registrarte con:
   - **GitHub** (recomendado, más fácil)
   - **Email** (crea cuenta nueva)
   - **Google**

### 2.2. Verificar Email (si usaste email)

1. Revisa tu correo
2. Haz clic en el enlace de verificación
3. Completa tu perfil básico

### 2.3. Elegir Plan

- **Free Plan** - Para pruebas (gratis, pero se duerme después de 15 min)
- **Starter ($7/mes)** - Recomendado para producción 24/7

**Por ahora elige Free Plan, puedes actualizar después.**

---

## ✅ Paso 3: Crear Base de Datos PostgreSQL

### 3.1. Ir al Dashboard

1. Una vez en Render, verás el **Dashboard**
2. En la esquina superior derecha, haz clic en **"New +"**

### 3.2. Crear PostgreSQL

1. En el menú desplegable, selecciona **"PostgreSQL"**

### 3.3. Configurar Base de Datos

Llena el formulario:

- **Name:** `whatsapp-reminders-db`
- **Database:** `whatsapp_reminders` (o déjalo por defecto)
- **User:** `whatsapp_reminders_user` (o déjalo por defecto)
- **Region:** `Oregon (US West)` (recomendado para mejor latencia)
- **PostgreSQL Version:** `16` (o la más reciente disponible)
- **Plan:** 
  - Selecciona **"Free"** para pruebas
  - O **"Starter"** ($7/mes) para producción

### 3.4. Crear Base de Datos

1. Haz clic en **"Create Database"**
2. **Espera 1-2 minutos** mientras Render crea la base de datos
3. Verás una pantalla de progreso
4. Cuando termine, verás el dashboard de la base de datos

### 3.5. Copiar URL Interna (Opcional)

1. En el dashboard de la base de datos
2. Ve a la pestaña **"Connections"**
3. Verás **"Internal Database URL"** (algo como: `postgresql://user:pass@host/dbname`)
4. **No necesitas copiarla ahora** - Render la configurará automáticamente cuando vinculemos el servicio web

**¡Excelente! Ya tienes la base de datos creada.** ✅

---

## ✅ Paso 4: Crear Servicio Web (Backend)

### 4.1. Nuevo Servicio Web

1. En el Dashboard de Render, haz clic en **"New +"** nuevamente
2. Esta vez selecciona **"Web Service"**

### 4.2. Conectar Repositorio Git

**Si tu código está en GitHub/GitLab/Bitbucket:**

1. Si es la primera vez, Render te pedirá autorizar acceso:
   - Haz clic en **"Connect account"** o **"Authorize Render"**
   - Autoriza a Render a acceder a tus repositorios
   - Selecciona los repositorios que quieres dar acceso (o todos)

2. Una vez autorizado, verás una lista de tus repositorios
3. **Busca y selecciona** tu repositorio `whatsapp-reminders` (o el nombre que le pusiste)

4. Render detectará automáticamente que es un proyecto Node.js

**Si NO tienes repositorio Git todavía:**

1. Selecciona **"Public Git repository"**
2. Ingresa la URL de tu repositorio público (ej: `https://github.com/usuario/repo.git`)
3. O haz clic en **"Manual Deploy"** para subir el código más tarde

### 4.3. Configurar el Servicio

Llena el formulario con estos valores:

#### Información Básica

- **Name:** `whatsapp-reminders` (o el nombre que prefieras)
- **Region:** `Oregon (US West)` (misma región que la base de datos)
- **Branch:** `main` (o `master` si usas esa rama)

#### Configuración de Build

- **Environment:** `Node` (Render lo detecta automáticamente)
- **Runtime:** `Node 20` (o la versión más reciente disponible)
- **Root Directory:** (dejar vacío, a menos que el proyecto esté en un subdirectorio)
- **Build Command:** 
  ```
  npm install && npm run build && npx prisma migrate deploy
  ```
- **Start Command:**
  ```
  npm start
  ```

#### Plan

- **Plan:** 
  - **Free** - Para pruebas (se duerme después de 15 min)
  - **Starter ($7/mes)** - Recomendado para producción 24/7

**Por ahora selecciona Free, puedes actualizar después.**

#### Health Check

- **Health Check Path:** `/health`
- Render verificará automáticamente este endpoint cada 5 minutos

### 4.4. Configurar Variables de Entorno

**¡IMPORTANTE!** Antes de crear el servicio, vamos a configurar las variables de entorno.

Haz clic en **"Advanced"** o desplázate hacia abajo hasta ver **"Environment Variables"**.

Agrega estas variables **UNA POR UNA** haciendo clic en **"Add Environment Variable"**:

#### 1. Variables del Servidor

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `APP_TIMEZONE` | `America/Bogota` |

#### 2. Base de Datos (Automático - IMPORTANTE)

**NO agregues `DATABASE_URL` manualmente todavía.**

En su lugar, más abajo verás una sección **"Link Database"** o **"Add Database"**:

1. Haz clic en **"Link Database"** o **"Add Database"**
2. Selecciona la base de datos que creaste: `whatsapp-reminders-db`
3. Render configurará automáticamente `DATABASE_URL` con la URL interna correcta
4. ✅ Esto es CRÍTICO - Render necesita la URL interna para conectarse a la base de datos

#### 3. Variables de Twilio

Necesitas obtener tus credenciales de Twilio primero:

**Obtener credenciales de Twilio:**

1. Ve a [console.twilio.com](https://console.twilio.com)
2. Si no tienes cuenta, créala (gratis)
3. Una vez dentro, ve a **Account** → **Account Info** (en el sidebar izquierdo)
4. Verás:
   - **Account SID** (algo como: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (haz clic en el ojo para verlo)

**Agregar variables:**

| Key | Value | Nota |
|-----|-------|------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Copia tu Account SID de Twilio |
| `TWILIO_AUTH_TOKEN` | `tu_auth_token_aqui` | Copia tu Auth Token (⚠️ **marca como Secret**) |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | Para Sandbox. Si tienes número verificado, usa ese |

**⚠️ IMPORTANTE:** Al agregar `TWILIO_AUTH_TOKEN`, activa el toggle **"Secret"** o **"Sensitive"** para que no se muestre en los logs.

#### 4. Tu Número de WhatsApp Personal

| Key | Value |
|-----|-------|
| `MY_WHATSAPP_NUMBER` | `whatsapp:+57XXXXXXXXXX` |

**Formato:** `whatsapp:+57` + tu número sin espacios.

**Ejemplo:** Si tu número es `3001234567`, sería: `whatsapp:+573001234567`

#### 5. Variables del Webhook (Automáticas)

**NO necesitas configurar estas manualmente:**

- `RENDER_EXTERNAL_URL` - Render la configura automáticamente
- `PUBLIC_BASE_URL` - Opcional, se usa `RENDER_EXTERNAL_URL` automáticamente

Solo agrega esta:

| Key | Value |
|-----|-------|
| `TWILIO_WEBHOOK_PATH` | `/webhooks/twilio/whatsapp` |

### 4.5. Revisar Configuración

Antes de crear el servicio, verifica que tengas:

- ✅ Build Command: `npm install && npm run build && npx prisma migrate deploy`
- ✅ Start Command: `npm start`
- ✅ Health Check Path: `/health`
- ✅ Base de datos vinculada (Link Database)
- ✅ Todas las variables de entorno agregadas
- ✅ Twilio Auth Token marcado como Secret

### 4.6. Crear el Servicio

1. Una vez que todo esté configurado, haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. Verás una pantalla de progreso con los logs en tiempo real

---

## ✅ Paso 5: Monitorear el Deploy

### 5.1. Ver Logs del Build

Render mostrará los logs en tiempo real:

```
Cloning repository...
Installing dependencies...
Running build command: npm install && npm run build && npx prisma migrate deploy
> Installing packages...
> Building TypeScript...
> Generating Prisma Client...
> Running migrations...
✅ Migration applied successfully
> Starting server...
🚀 Servidor escuchando en puerto 10000
```

**Tiempo estimado:** 3-5 minutos para el primer deploy.

### 5.2. Verificar que el Deploy fue Exitoso

Busca en los logs:

- ✅ `✅ Conectado a la base de datos`
- ✅ `[SCHEDULER] ✅ Scheduler iniciado correctamente`
- ✅ `[INIT] ✅ Servidor escuchando en puerto 10000`
- ✅ `✅ Migration applied successfully` (si las migraciones se ejecutaron)

### 5.3. Si Hay Errores

**Error común: "Database connection failed"**
- Verifica que la base de datos esté vinculada (Link Database)
- Verifica que la base de datos esté en la misma región que el servicio

**Error común: "Prisma migrate failed"**
- Verifica que el Build Command incluya: `&& npx prisma migrate deploy`
- Revisa los logs para ver el error específico de Prisma

**Error común: "Port already in use"**
- Asegúrate de que `PORT=10000` esté configurada
- Render usa el puerto 10000 automáticamente

### 5.4. Obtener URL del Servicio

Una vez que el deploy termine exitosamente:

1. Render te mostrará la URL del servicio
2. Será algo como: `https://whatsapp-reminders-xxxx.onrender.com`
3. **¡Copia esta URL!** La necesitarás para configurar Twilio

---

## ✅ Paso 6: Verificar que Funciona

### 6.1. Health Check

1. Visita la URL que Render te dio: `https://tu-url.onrender.com/health`
2. Deberías ver:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-10T...",
     "uptime": 123.45,
     "timezone": "America/Bogota",
     "checks": {
       "database": "ok",
       "scheduler": "ok"
     }
   }
   ```

**Si ves `database: "error"`:**
- Ve a Render → Tu servicio → Environment
- Verifica que la base de datos esté vinculada
- Si no está vinculada, haz clic en "Link Database" y selecciona tu base de datos

### 6.2. Verificar API

1. Visita: `https://tu-url.onrender.com/`
2. Deberías ver información de la API:
   ```json
   {
     "message": "WhatsApp Reminders API",
     "version": "1.0.0",
     "endpoints": {
       "reminders": "/api/reminders",
       "messages": "/api/messages",
       "webhooks": "/webhooks/twilio/whatsapp",
       "health": "/health"
     }
   }
   ```

### 6.3. Verificar Scheduler en Logs

1. En Render, ve a tu servicio web
2. Haz clic en la pestaña **"Logs"**
3. Deberías ver cada minuto:
   ```
   [SCHEDULER] 2025-01-10T... - Verificando recordatorios activos...
   [SCHEDULER] Encontrados X recordatorios activos
   [SCHEDULER] Verificación completada en XXms
   ```

Si ves estos logs, ¡el scheduler está funcionando! ✅

---

## ✅ Paso 7: Ejecutar Migraciones (Si es Necesario)

Si en los logs del build NO ves `✅ Migration applied successfully`:

### 7.1. Usar Render Shell

1. En el dashboard de tu servicio web, ve a la pestaña **"Shell"**
2. Render abrirá una terminal web en tu navegador
3. Ejecuta:
   ```bash
   npx prisma migrate deploy
   ```
4. Deberías ver:
   ```
   Applying migration `20250110_initial`
   ✅ Migration applied successfully
   ```

### 7.2. Verificar Schema

Para verificar que las tablas se crearon:

1. En Render Shell, ejecuta:
   ```bash
   npx prisma db pull
   ```
2. Esto verificará la conexión a la base de datos

---

## ✅ Paso 8: Configurar Webhook de Twilio

### 8.1. Obtener URL Pública

1. En Render, ve a tu servicio web
2. Copia la URL pública (ej: `https://whatsapp-reminders-xxxx.onrender.com`)
3. La URL completa del webhook será:
   ```
   https://whatsapp-reminders-xxxx.onrender.com/webhooks/twilio/whatsapp
   ```

### 8.2. Configurar en Twilio Console

1. Ve a [console.twilio.com](https://console.twilio.com)
2. Inicia sesión si no lo has hecho

### 8.3. Activar WhatsApp Sandbox (Si no lo has hecho)

1. En Twilio Console, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Si es la primera vez, verás un **código de unión** (join code)
3. En tu WhatsApp, envía un mensaje a: `+1 415 523 8886`
4. Envía el código: `join <palabra-secreta>` (el código que te mostró Twilio)
5. Recibirás confirmación: "Your WhatsApp number is now registered with Twilio"

### 8.4. Configurar Webhook

1. En Twilio Console, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Haz clic en **"Configuration"** o **"Settings"** (según la versión de la consola)
3. En la sección **"WHEN A MESSAGE COMES IN"** o **"A message comes in"**, pega:
   ```
   https://tu-url.onrender.com/webhooks/twilio/whatsapp
   ```
4. Método: Selecciona **"HTTP POST"** (debería estar por defecto)
5. Haz clic en **"Save"** o **"Update"**

### 8.5. Verificar Webhook

1. Envía un mensaje de prueba al número de Twilio:
   - Si usas Sandbox: `+1 415 523 8886`
   - Envía cualquier mensaje (ej: "Hola")
2. Revisa los logs de Render:
   - Ve a tu servicio web en Render
   - Pestaña **"Logs"**
   - Deberías ver:
     ```
     [WEBHOOK] Mensaje recibido de whatsapp:+...
     [WEBHOOK] ✅ Mensaje guardado en DB
     [WEBHOOK] ✅ Mensaje reenviado a WhatsApp personal
     ```

Si ves estos logs, ¡el webhook está funcionando! ✅

---

## ✅ Paso 9: Crear Recordatorio de Prueba

### 9.1. Crear Recordatorio Único

Usa PowerShell o curl:

```powershell
# Reemplaza TU-URL con tu URL de Render
$url = "https://tu-url.onrender.com/api/reminders"

# Calcula fecha en 5 minutos
$fecha5Minutos = (Get-Date).AddMinutes(5).ToString("yyyy-MM-ddTHH:mm:ss")

# JSON del recordatorio
$json = @{
    to = "whatsapp:+573001234567"
    body = "Prueba desde Render - Este mensaje se envió automáticamente"
    scheduleType = "once"
    sendAt = $fecha5Minutos
    timezone = "America/Bogota"
} | ConvertTo-Json

# Crear recordatorio
Invoke-RestMethod -Uri $url -Method POST -Body $json -ContentType "application/json"
```

**O usando curl:**

```bash
curl -X POST https://tu-url.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Prueba desde Render",
    "scheduleType": "once",
    "sendAt": "2025-01-11T14:00:00",
    "timezone": "America/Bogota"
  }'
```

### 9.2. Verificar que se Creó

```powershell
# Listar recordatorios
Invoke-RestMethod -Uri "https://tu-url.onrender.com/api/reminders" -Method GET
```

O visita en tu navegador:
```
https://tu-url.onrender.com/api/reminders
```

### 9.3. Esperar y Verificar Envío

1. Espera a la hora programada (o programa uno para dentro de 5 minutos)
2. Revisa los logs de Render
3. Deberías ver:
   ```
   [SCHEDULER] ⏰ Recordatorio xxx debe enviarse ahora
   [SCHEDULER] ✅ Recordatorio xxx enviado exitosamente
   ```
4. Revisa tu WhatsApp - deberías recibir el mensaje

---

## ✅ Paso 10: Configurar Monitoreo (Opcional pero Recomendado)

### 10.1. Crear Cuenta en UptimeRobot

1. Ve a [uptimerobot.com](https://uptimerobot.com)
2. Haz clic en **"Sign Up"** o **"Get Started Free"**
3. Crea una cuenta gratuita (hasta 50 monitores gratis)

### 10.2. Crear Monitor

1. Una vez dentro, haz clic en **"Add New Monitor"**
2. Configura:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `WhatsApp Reminders API (Render)`
   - **URL:** `https://tu-url.onrender.com/health`
   - **Monitoring Interval:** `5 minutes` (gratis)
   - **Alert Contacts:** Agrega tu email
3. Haz clic en **"Create Monitor"**

### 10.3. Configurar Alertas

1. Ve a **"Alert Contacts"** en el menú
2. Agrega tu email
3. Recibirás alertas cuando el servicio no responda por más de 5 minutos

---

## ✅ Paso 11: Actualizar a Plan de Pago (Si Quieres 24/7 Real)

### 11.1. Cambiar a Plan Starter

1. En Render, ve a tu servicio web
2. Ve a la pestaña **"Settings"**
3. Busca **"Plan"** o **"Pricing"**
4. Haz clic en **"Change Plan"**
5. Selecciona **"Starter"** ($7/mes)
6. Confirma el cambio

**Esto garantiza que:**
- ✅ El servicio nunca se "duerme"
- ✅ Siempre está activo 24/7
- ✅ Respuesta instantánea a todas las peticiones

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Servicio web creado y desplegado exitosamente
- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos vinculada al servicio web
- [ ] Health check responde correctamente (`/health`)
- [ ] Scheduler ejecutándose (ver logs cada minuto)
- [ ] Migraciones ejecutadas (si fue necesario)
- [ ] Webhook de Twilio configurado
- [ ] Webhook recibe mensajes (ver logs)
- [ ] Recordatorio de prueba creado exitosamente
- [ ] Recordatorio de prueba enviado y recibido
- [ ] Monitoreo configurado (opcional)

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en Render y funcionando 24/7.

**URL de tu API:** `https://tu-url.onrender.com`

**Health Check:** `https://tu-url.onrender.com/health`

**Documentación API:** `https://tu-url.onrender.com/`

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

1. Haz commit y push a tu repositorio Git:
   ```powershell
   git add .
   git commit -m "Actualización"
   git push
   ```

2. Render detectará automáticamente los cambios
3. Render iniciará un nuevo build automáticamente
4. Una vez completado, el nuevo deploy estará activo

---

## 🐛 Problemas Comunes

### El servicio se "duerme" (Plan Gratuito)

**Solución:** Actualiza al plan Starter ($7/mes) o usa UptimeRobot para hacer ping cada 10 minutos.

### No recibe mensajes en el webhook

**Solución:**
1. Verifica que la URL en Twilio sea exactamente correcta
2. Verifica que el servicio esté corriendo (health check)
3. Revisa los logs de Render para ver si llegan requests

### Error de base de datos

**Solución:**
1. Verifica que la base de datos esté vinculada (Link Database)
2. Verifica que estén en la misma región
3. Verifica que las migraciones se ejecutaron

---

¡Disfruta de tu aplicación funcionando 24/7 en Render! 🚀
