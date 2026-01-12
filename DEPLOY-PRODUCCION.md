# 🚀 Guía de Despliegue a Producción

Esta guía te ayudará a desplegar la aplicación WhatsApp Reminders a producción usando Render.com o Railway.app para que funcione 24/7 sin intervención.

---

## 📋 Pre-requisitos

1. **Cuenta en Render.com** o **Railway.app** (ambas tienen planes gratuitos)
2. **Cuenta de Twilio** con WhatsApp habilitado
3. **Repositorio Git** (GitHub, GitLab, Bitbucket) - opcional pero recomendado

---

## 🎯 Opción 1: Desplegar en Render.com

### Paso 1: Crear cuenta en Render

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu repositorio de Git (opcional) o sube el código manualmente

### Paso 2: Crear Base de Datos PostgreSQL

1. En el dashboard de Render, haz clic en **"New +"** → **"PostgreSQL"**
2. Configura:
   - **Name:** `whatsapp-reminders-db`
   - **Plan:** Starter (gratis)
   - **Database:** `whatsapp_reminders`
   - **User:** `whatsapp_reminders_user`
3. Haz clic en **"Create Database"**
4. **¡IMPORTANTE!** Copia la **Internal Database URL** (la usarás más adelante)

### Paso 3: Desplegar el Servicio Web

1. En el dashboard, haz clic en **"New +"** → **"Web Service"**
2. Selecciona tu repositorio Git o conecta uno nuevo
3. Configura el servicio:
   - **Name:** `whatsapp-reminders`
   - **Environment:** `Node`
   - **Branch:** `main` (o la rama que uses)
   - **Root Directory:** (dejar vacío)
   - **Build Command:** `npm install && npm run build && npm run db:migrate`
   - **Start Command:** `npm start`
   - **Plan:** Starter (gratis, se "duerme" después de 15 min) o Paid (recomendado para 24/7)

### Paso 4: Configurar Variables de Entorno

En la sección **"Environment"** del servicio web, agrega:

```env
NODE_ENV=production
PORT=10000
APP_TIMEZONE=America/Bogota

# Base de datos (usa la Internal Database URL que copiaste)
DATABASE_URL=postgresql://usuario:password@host:5432/whatsapp_reminders

# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui

# Twilio WhatsApp Number
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Tu número de WhatsApp personal
MY_WHATSAPP_NUMBER=whatsapp:+57xxxxxxxxxx

# URL pública (Render la configura automáticamente)
PUBLIC_BASE_URL=https://whatsapp-reminders.onrender.com

# Ruta del webhook
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

**Nota:** Render automáticamente expone `RENDER_EXTERNAL_URL`, pero puedes usar `PUBLIC_BASE_URL` manualmente.

### Paso 5: Ejecutar Migraciones

Después del primer deploy, ejecuta las migraciones:

1. Ve a la sección **"Shell"** del servicio web
2. Ejecuta: `npm run db:migrate`

O agrega `&& npm run db:migrate` al **Build Command** (ya está incluido arriba).

### Paso 6: Obtener URL Pública

1. Después del deploy, Render te dará una URL como: `https://whatsapp-reminders.onrender.com`
2. Copia esta URL, la necesitarás para configurar Twilio

### Paso 7: Configurar Webhook en Twilio

1. Ve a [Twilio Console](https://console.twilio.com/) → **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
2. En **"A message comes in"**, pega:
   ```
   https://tu-url.onrender.com/webhooks/twilio/whatsapp
   ```
3. Método: **POST**
4. Guarda los cambios

### Paso 8: Verificar que Funciona

1. Visita: `https://tu-url.onrender.com/health`
2. Deberías ver:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": 123.45,
     "checks": {
       "database": "ok",
       "scheduler": "ok"
     }
   }
   ```

---

## 🎯 Opción 2: Desplegar en Railway.app

### Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app) y crea una cuenta con GitHub

### Paso 2: Crear Nuevo Proyecto

1. Haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"** (recomendado) o **"Empty Project"**

### Paso 3: Agregar Base de Datos PostgreSQL

1. En tu proyecto, haz clic en **"New +"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creará la base de datos automáticamente
3. Haz clic en la base de datos y copia la **DATABASE_URL** de la sección **"Variables"**

### Paso 4: Agregar Servicio Web

1. En tu proyecto, haz clic en **"New +"** → **"GitHub Repo"** (si conectaste Git) o **"Empty Service"**
2. Si es Empty Service, sube el código manualmente

### Paso 5: Configurar Variables de Entorno

En la sección **"Variables"** del servicio web, agrega:

```env
NODE_ENV=production
PORT=10000
APP_TIMEZONE=America/Bogota

# Base de datos (usa la DATABASE_URL de Railway)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui

# Twilio WhatsApp Number
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Tu número de WhatsApp personal
MY_WHATSAPP_NUMBER=whatsapp:+57xxxxxxxxxx

# URL pública (Railway la configura automáticamente)
PUBLIC_BASE_URL=https://tu-proyecto.railway.app

# Ruta del webhook
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

**Nota:** Railway expone automáticamente `RAILWAY_PUBLIC_DOMAIN`, pero puedes usar `PUBLIC_BASE_URL` manualmente.

### Paso 6: Configurar Deploy Settings

En la sección **"Settings"** → **"Deploy"**:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Paso 7: Generar Dominio Público

1. En la sección **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"** para obtener una URL pública
3. Copia la URL (ej: `tu-proyecto.railway.app`)

### Paso 8: Ejecutar Migraciones

1. Abre la terminal de Railway (sección **"Deployments"** → **"View Logs"**)
2. Ejecuta: `railway run npm run db:migrate`

O agrega `&& npm run db:migrate` al **Build Command**.

### Paso 9: Configurar Webhook en Twilio

Igual que en Render, configura el webhook en Twilio Console con la URL de Railway.

---

## 🔧 Migración de Datos (Opcional)

Si tienes datos en SQLite local y quieres migrarlos a PostgreSQL:

### Opción A: Migración Manual

1. Exporta datos de SQLite:
   ```bash
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

2. Convierte el SQL a formato PostgreSQL (algunos cambios pueden ser necesarios)

3. Importa a PostgreSQL:
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

### Opción B: Script de Migración

Crea un script temporal que lea de SQLite y escriba a PostgreSQL usando Prisma.

---

## 📊 Monitoreo con UptimeRobot

### Paso 1: Crear cuenta en UptimeRobot

1. Ve a [uptimerobot.com](https://uptimerobot.com) y crea una cuenta gratuita

### Paso 2: Crear Monitor

1. Haz clic en **"Add New Monitor"**
2. Configura:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** WhatsApp Reminders API
   - **URL:** `https://tu-url.onrender.com/health` (o tu URL de Railway)
   - **Monitoring Interval:** 5 minutes (gratis)
   - **Alert Contacts:** Tu email
3. Haz clic en **"Create Monitor"**

### Paso 3: Configurar Alertas

1. En **"Alert Contacts"**, configura tu email
2. Recibirás alertas cuando el servicio no responda

---

## 🔍 Verificación Post-Deploy

### Checklist de Verificación

- [ ] El servicio está corriendo (ver logs en Render/Railway)
- [ ] `/health` endpoint responde correctamente
- [ ] La base de datos está conectada (`database: "ok"` en health check)
- [ ] El scheduler está activo (`scheduler: "ok"` en health check)
- [ ] El webhook de Twilio está configurado correctamente
- [ ] Puedes crear recordatorios vía API
- [ ] Los recordatorios se envían automáticamente
- [ ] Los mensajes entrantes se reciben y reenvían

### Comandos de Verificación

```bash
# Health check
curl https://tu-url.onrender.com/health

# Crear recordatorio de prueba
curl -X POST https://tu-url.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Prueba de producción",
    "scheduleType": "once",
    "sendAt": "2025-01-11T14:00:00",
    "timezone": "America/Bogota"
  }'

# Listar recordatorios
curl https://tu-url.onrender.com/api/reminders
```

---

## ⚠️ Consideraciones Importantes

### Render.com

- **Plan Gratuito:** El servicio se "duerme" después de 15 minutos de inactividad
  - La primera petición después de dormirse puede tardar 30-60 segundos
  - Para 24/7 real, necesitas el plan Paid ($7/mes)
- **Base de Datos:** El plan Starter es suficiente para desarrollo/personal

### Railway.app

- **Plan Gratiso:** Tiene límites de uso (típicamente suficiente para uso personal)
- **Base de Datos:** PostgreSQL incluido sin costo adicional
- **Ventaja:** No se "duerme" como Render gratuito

### Recomendación

- **Desarrollo/Pruebas:** Render gratuito o Railway gratuito
- **Producción 24/7:** Render Paid ($7/mes) o Railway con límites de uso

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que las migraciones se ejecutaron (`npm run db:migrate`)
- En Render, usa la **Internal Database URL**, no la externa

### Error: "Scheduler not running"

- Verifica los logs del servicio
- El scheduler se inicia automáticamente con el servidor
- Verifica que no haya errores en la inicialización

### Error: "Webhook not receiving messages"

- Verifica que la URL del webhook en Twilio sea correcta
- Verifica que el servicio esté accesible públicamente
- Revisa los logs del servicio para ver si llegan requests

### Error: "Mensajes no se envían"

- Verifica credenciales de Twilio
- Verifica que `TWILIO_WHATSAPP_FROM` sea correcto
- Verifica que el número destino esté verificado (en Sandbox)
- Revisa los logs para ver errores específicos

---

## 📝 Mantenimiento

### Actualizar la Aplicación

1. Haz cambios en tu código
2. Commit y push a Git (si usas Git)
3. Render/Railway detectará cambios y redeployará automáticamente

### Ver Logs

- **Render:** Sección **"Logs"** del servicio web
- **Railway:** Sección **"Deployments"** → **"View Logs"**

### Backup de Base de Datos

- **Render:** Los backups son automáticos, puedes restaurar desde el dashboard
- **Railway:** Configura backups manuales o usa un servicio externo

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y funcionando 24/7. El scheduler se ejecuta automáticamente cada minuto, y los webhooks de Twilio funcionan de forma permanente.

**URL de tu API:** `https://tu-url.onrender.com` (o Railway)

¡Disfruta de tu aplicación de recordatorios automáticos! 🚀
