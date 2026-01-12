# 🚀 Guía de Despliegue en Render.com

Esta guía te lleva paso a paso para desplegar tu aplicación WhatsApp Reminders en Render.com y que funcione 24/7.

---

## 📋 Pre-requisitos

1. **Cuenta en Render.com** (gratis o de pago)
   - Regístrate en [render.com](https://render.com)
   - Puedes usar plan gratuito para pruebas (se "duerme" después de 15 min)
   - Plan de pago ($7/mes) recomendado para producción 24/7

2. **Cuenta de Twilio** con WhatsApp habilitado
   - Ve a [console.twilio.com](https://console.twilio.com)
   - Obtén Account SID y Auth Token

3. **Repositorio Git** (opcional pero recomendado)
   - GitHub, GitLab o Bitbucket
   - O puedes subir el código manualmente

---

## 🗄️ Paso 1: Crear Base de Datos PostgreSQL

### 1.1. Ir al Dashboard de Render

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Inicia sesión con tu cuenta

### 1.2. Crear Nueva Base de Datos PostgreSQL

1. Haz clic en **"New +"** en la parte superior derecha
2. Selecciona **"PostgreSQL"**

### 1.3. Configurar Base de Datos

Configura los siguientes valores:

- **Name:** `whatsapp-reminders-db`
- **Database:** `whatsapp_reminders` (o déjalo por defecto)
- **User:** `whatsapp_reminders_user` (o déjalo por defecto)
- **Region:** `Oregon (US West)` (recomendado para mejor latencia)
- **PostgreSQL Version:** `16` (o la más reciente)
- **Plan:** 
  - **Starter (Free)** - Para pruebas (512MB RAM, 1GB disco)
  - **Standard** - Para producción ($7/mes, 2GB RAM, 10GB disco)

### 1.4. Crear Base de Datos

1. Haz clic en **"Create Database"**
2. **¡IMPORTANTE!** Espera a que se cree (toma ~1-2 minutos)
3. Una vez creada, haz clic en la base de datos
4. En la sección **"Connections"**, verás la **Internal Database URL**
5. **Copia esta URL** (la necesitarás más adelante, aunque Render la configura automáticamente)

**Ejemplo de URL interna:**
```
postgresql://whatsapp_reminders_user:password@dpg-xxxxx-a/whatsapp_reminders
```

---

## 🌐 Paso 2: Crear Servicio Web (Backend)

### 2.1. Nuevo Servicio Web

1. En el dashboard, haz clic en **"New +"**
2. Selecciona **"Web Service"**

### 2.2. Conectar Repositorio Git (Recomendado)

**Opción A: Desde Git (Recomendado)**

1. Si tu código está en GitHub/GitLab/Bitbucket:
   - Haz clic en **"Connect account"** si es la primera vez
   - Autoriza Render a acceder a tu repositorio
   - Selecciona tu repositorio `whatsapp-reminders`

2. Render detectará automáticamente que es un proyecto Node.js

**Opción B: Subir Código Manualmente**

1. Selecciona **"Public Git repository"**
2. Ingresa la URL de tu repositorio Git público
3. Render clonará el código automáticamente

### 2.3. Configurar Servicio

**Nombre del Servicio:**
- **Name:** `whatsapp-reminders` (o el que prefieras)

**Configuración del Build:**

- **Environment:** `Node`
- **Region:** `Oregon (US West)` (misma región que la base de datos)
- **Branch:** `main` (o la rama que uses)
- **Root Directory:** (dejar vacío, a menos que el proyecto esté en un subdirectorio)
- **Runtime:** `Node 20`
- **Build Command:**
  ```bash
  npm install && npm run build && npx prisma migrate deploy
  ```
- **Start Command:**
  ```bash
  npm start
  ```

**Plan:**
- **Free** - Para pruebas (se duerme después de 15 min de inactividad)
- **Starter ($7/mes)** - Recomendado para producción 24/7 (512MB RAM)
- **Standard ($25/mes)** - Para mayor rendimiento (2GB RAM)

**Health Check:**
- **Health Check Path:** `/health`
- Render verificará automáticamente este endpoint cada 5 minutos

---

## ⚙️ Paso 3: Configurar Variables de Entorno

En la sección **"Environment"** del servicio web, agrega las siguientes variables:

### 3.1. Variables del Servidor

```env
NODE_ENV=production
PORT=10000
APP_TIMEZONE=America/Bogota
```

**Nota:** Render automáticamente asigna el puerto 10000, pero lo configuramos explícitamente.

### 3.2. Base de Datos

```env
DATABASE_URL=
```

**IMPORTANTE:** Para conectar automáticamente con la base de datos de Render:

1. En la sección **"Environment"**, haz clic en **"Link Database"**
2. Selecciona la base de datos que creaste: `whatsapp-reminders-db`
3. Render configurará automáticamente `DATABASE_URL` con la URL interna correcta

**O manualmente:**
- Copia la **Internal Database URL** de la base de datos (sección "Connections")
- Pégala en `DATABASE_URL`

### 3.3. Variables de Twilio

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Obtener credenciales de Twilio:**
1. Ve a [console.twilio.com](https://console.twilio.com)
2. Ve a **Account** → **Account Info**
3. Copia **Account SID** → pega en `TWILIO_ACCOUNT_SID`
4. Copia **Auth Token** → pega en `TWILIO_AUTH_TOKEN` (¡marca como secreto!)
5. Para `TWILIO_WHATSAPP_FROM`:
   - Si usas Sandbox: `whatsapp:+14155238886`
   - Si tienes número verificado: `whatsapp:+1XXXXXXXXXX`

### 3.4. Tu Número de WhatsApp

```env
MY_WHATSAPP_NUMBER=whatsapp:+57XXXXXXXXXX
```

- Formato: `whatsapp:+57` + tu número sin espacios
- Este número recibirá los reenvíos de mensajes entrantes

### 3.5. URL del Webhook (Automático en Render)

```env
PUBLIC_BASE_URL=
```

**IMPORTANTE:** NO necesitas configurar esto manualmente si usas Render.

Render automáticamente expone `RENDER_EXTERNAL_URL` que la aplicación usa. La URL será algo como:
```
https://whatsapp-reminders.onrender.com
```

**O si quieres configurarlo manualmente:**
- Después del deploy, Render te dará una URL como: `https://whatsapp-reminders-xxxx.onrender.com`
- Cópiala y pégala en `PUBLIC_BASE_URL` (pero no es necesario, Render lo hace automáticamente)

### 3.6. Ruta del Webhook

```env
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

---

## 🚀 Paso 4: Desplegar

### 4.1. Crear el Servicio

1. Una vez configuradas todas las variables de entorno
2. Haz clic en **"Create Web Service"**
3. Render comenzará a construir y desplegar tu aplicación

### 4.2. Verificar el Deploy

Render mostrará los logs en tiempo real:

```
Cloning repository...
Installing dependencies...
Running build command...
Building...
Deploying...
```

**Tiempo estimado:** 3-5 minutos para el primer deploy

### 4.3. Verificar que Funciona

Una vez desplegado:

1. Render te mostrará la URL del servicio (ej: `https://whatsapp-reminders-xxxx.onrender.com`)
2. Haz clic en la URL o visita: `https://tu-url.onrender.com/health`
3. Deberías ver:
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
- Verifica que la base de datos esté vinculada correctamente
- Verifica que las migraciones se ejecutaron (deberían ejecutarse automáticamente en el build)

---

## 📊 Paso 5: Ejecutar Migraciones (Si es Necesario)

Si las migraciones no se ejecutaron automáticamente durante el build:

### 5.1. Usando Render Shell

1. En el dashboard de tu servicio web, ve a la sección **"Shell"**
2. Render abrirá una terminal web
3. Ejecuta:
   ```bash
   npx prisma migrate deploy
   ```
4. Deberías ver:
   ```
   Applying migration `20250110_initial`
   ✅ Migration applied successfully
   ```

### 5.2. Verificar Schema

Para verificar que las tablas se crearon:

1. En la terminal de Render Shell, ejecuta:
   ```bash
   npx prisma db pull
   ```
2. Esto verificará la conexión a la base de datos

---

## 🔗 Paso 6: Configurar Webhook de Twilio

### 6.1. Obtener URL Pública de Render

1. En el dashboard de Render, ve a tu servicio web
2. Copia la URL pública (ej: `https://whatsapp-reminders-xxxx.onrender.com`)
3. La URL completa del webhook será:
   ```
   https://whatsapp-reminders-xxxx.onrender.com/webhooks/twilio/whatsapp
   ```

### 6.2. Configurar Webhook en Twilio

1. Ve a [console.twilio.com](https://console.twilio.com)
2. Ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Haz clic en **"Configuration"** o **"Settings"**
4. En la sección **"WHEN A MESSAGE COMES IN"**, pega:
   ```
   https://whatsapp-reminders-xxxx.onrender.com/webhooks/twilio/whatsapp
   ```
5. Método: Selecciona **"HTTP POST"**
6. Haz clic en **"Save"**

### 6.3. Verificar Webhook

1. Envía un mensaje de prueba al número de Twilio (ej: `+1 415 523 8886` si usas Sandbox)
2. Revisa los logs de Render:
   - Ve a tu servicio web en Render
   - Sección **"Logs"**
   - Deberías ver: `[WEBHOOK] Mensaje recibido de whatsapp:+...`

---

## ✅ Paso 7: Verificar que Todo Funciona

### 7.1. Health Check

```bash
curl https://tu-url.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T...",
  "uptime": 123.45,
  "checks": {
    "database": "ok",
    "scheduler": "ok"
  }
}
```

### 7.2. Crear Recordatorio de Prueba

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

**Respuesta esperada:**
```json
{
  "id": "uuid-here",
  "to": "whatsapp:+573001234567",
  "body": "Prueba desde Render",
  "scheduleType": "once",
  "sendAt": "2025-01-11T14:00:00.000Z",
  "isActive": true,
  ...
}
```

### 7.3. Verificar Scheduler

1. Revisa los logs de Render (sección "Logs")
2. Cada minuto deberías ver:
   ```
   [SCHEDULER] 2025-01-10T... - Verificando recordatorios activos...
   [SCHEDULER] Encontrados X recordatorios activos
   [SCHEDULER] Verificación completada en XXms
   ```

### 7.4. Verificar Envío de Mensaje

1. Espera a la hora programada (o programa uno para dentro de 5 minutos)
2. Revisa los logs de Render
3. Deberías ver:
   ```
   [SCHEDULER] ⏰ Recordatorio xxx debe enviarse ahora
   [SCHEDULER] ✅ Recordatorio xxx enviado exitosamente
   ```

---

## 📊 Paso 8: Monitoreo con UptimeRobot (Opcional pero Recomendado)

### 8.1. Crear Cuenta en UptimeRobot

1. Ve a [uptimerobot.com](https://uptimerobot.com)
2. Crea una cuenta gratuita (hasta 50 monitores gratis)

### 8.2. Crear Monitor

1. Haz clic en **"Add New Monitor"**
2. Configura:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** WhatsApp Reminders API (Render)
   - **URL:** `https://tu-url.onrender.com/health`
   - **Monitoring Interval:** 5 minutes (gratis)
   - **Alert Contacts:** Tu email
3. Haz clic en **"Create Monitor"**

### 8.3. Configurar Alertas

1. Ve a **"Alert Contacts"**
2. Agrega tu email
3. Recibirás alertas cuando el servicio no responda

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

**Causa:** La base de datos no está vinculada correctamente o `DATABASE_URL` es incorrecta.

**Solución:**
1. Ve a tu servicio web en Render
2. En la sección **"Environment"**, verifica que `DATABASE_URL` esté configurada
3. Si no está, haz clic en **"Link Database"** y selecciona tu base de datos
4. Reinicia el servicio (Render → Settings → Manual Deploy → Clear build cache & deploy)

### Error: "Prisma migrate failed"

**Causa:** Las migraciones no se ejecutaron o hay un problema con el schema.

**Solución:**
1. Verifica que `prisma migrate deploy` esté en el **Build Command**
2. Revisa los logs del build para ver el error específico
3. Si es necesario, ejecuta manualmente en Render Shell:
   ```bash
   npx prisma migrate deploy
   ```

### Error: "Scheduler not running"

**Causa:** El scheduler debería iniciar automáticamente con el servidor.

**Solución:**
1. Revisa los logs de Render
2. Deberías ver: `[SCHEDULER] Iniciando scheduler de recordatorios...`
3. Si no aparece, verifica que el servidor inició correctamente
4. Verifica que no haya errores en `src/services/scheduler.ts`

### Error: "Webhook not receiving messages"

**Causa:** La URL del webhook en Twilio es incorrecta o el servicio no es accesible.

**Solución:**
1. Verifica que la URL en Twilio sea exactamente: `https://tu-url.onrender.com/webhooks/twilio/whatsapp`
2. Verifica que el servicio esté corriendo (health check debe responder)
3. Envía un mensaje de prueba y revisa los logs de Render
4. Verifica que `RENDER_EXTERNAL_URL` esté disponible (Render la expone automáticamente)

### Plan Gratuito se "Duerme"

**Causa:** El plan gratuito de Render pone el servicio en "sleep" después de 15 minutos de inactividad.

**Solución:**
1. La primera petición después de dormirse puede tardar 30-60 segundos
2. Para producción 24/7, actualiza al plan **Starter ($7/mes)**
3. Puedes configurar un "ping" automático cada 10 minutos usando UptimeRobot

---

## 💰 Costos en Render

### Plan Gratuito (Free)

- ✅ Web Service gratis
- ✅ Base de datos PostgreSQL gratis (512MB RAM, 1GB disco)
- ⚠️ Servicio se "duerme" después de 15 min de inactividad
- ⚠️ Primera petición después de dormirse: ~30-60 segundos de delay

### Plan de Pago (Recomendado para 24/7)

**Starter ($7/mes):**
- ✅ Web Service siempre activo (512MB RAM)
- ✅ Base de datos PostgreSQL incluida (512MB RAM, 1GB disco)
- ✅ SSL automático
- ✅ Monitoreo básico
- ✅ Logs persistentes

**Total estimado:** ~$7/mes para producción 24/7

---

## 📝 Checklist Final

Antes de considerar el despliegue completo:

- [ ] Base de datos PostgreSQL creada y vinculada
- [ ] Todas las variables de entorno configuradas
- [ ] Servicio web desplegado y saludable (`/health` responde)
- [ ] Migraciones ejecutadas correctamente
- [ ] Webhook de Twilio configurado
- [ ] Recordatorio de prueba creado exitosamente
- [ ] Scheduler ejecutándose (ver logs)
- [ ] Mensaje de prueba enviado y recibido
- [ ] Webhook recibe mensajes entrantes
- [ ] Monitoreo configurado (opcional pero recomendado)

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en Render y funcionando 24/7. El scheduler se ejecuta automáticamente cada minuto, y los webhooks de Twilio funcionan de forma permanente.

**URL de tu API:** `https://tu-url.onrender.com`

**Health Check:** `https://tu-url.onrender.com/health`

**Documentación API:** `https://tu-url.onrender.com/`

---

## 📚 Recursos Adicionales

- [Render Documentation](https://render.com/docs)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Health Checks](https://render.com/docs/healthchecks)

---

## 🔄 Actualizar la Aplicación

Para actualizar la aplicación después de hacer cambios:

1. Haz commit y push a tu repositorio Git
2. Render detectará automáticamente los cambios
3. Render iniciará un nuevo build automáticamente
4. Una vez completado, el nuevo deploy estará activo

O manualmente:

1. En Render, ve a tu servicio web
2. Haz clic en **"Manual Deploy"**
3. Selecciona **"Deploy latest commit"** o **"Clear build cache & deploy"**

---

¡Disfruta de tu aplicación de recordatorios automáticos funcionando 24/7! 🚀
