# ✅ Paso 4: Crear Servicio Web (Backend) en Render

Ahora vamos a crear el servicio web que ejecutará tu aplicación Node.js.

---

## 🎯 Objetivo

Crear un servicio web que:
- Ejecute tu aplicación Node.js 20
- Se conecte a la base de datos PostgreSQL que acabamos de crear
- Ejecute el scheduler automáticamente
- Funcione 24/7

---

## 📋 Paso 4.1: Ir a Crear Servicio Web

### 4.1.1. Desde el Dashboard

1. Haz clic en el **logo de Render** (arriba a la izquierda) para ir al Dashboard
2. O ve a: `https://dashboard.render.com`
3. Haz clic en **"New +"** (esquina superior derecha)
4. Selecciona **"Web Service"**

**O si estás en el dashboard de la base de datos:**

1. Haz clic en el **logo de Render** (arriba a la izquierda)
2. Esto te lleva al Dashboard principal
3. Haz clic en **"New +"** → **"Web Service"**

---

## 📋 Paso 4.2: Conectar Repositorio Git

### Opción A: Si Tienes Repositorio en GitHub/GitLab/Bitbucket (Recomendado)

1. Si es la primera vez, Render puede pedirte autorización:
   - Haz clic en **"Connect account"** o **"Connect GitHub"** (o GitLab/Bitbucket)
   - Autoriza a Render a acceder a tus repositorios
   - Selecciona los repositorios que quieres compartir (o todos)

2. Una vez autorizado, verás una lista de tus repositorios
3. **Busca y selecciona** tu repositorio que contiene el código de `whatsapp-reminders`
   - Si no has subido el código aún, puedes hacerlo después
   - O puedes usar la **Opción B** (Manual Deploy)

4. Render detectará automáticamente que es un proyecto Node.js

### Opción B: Si NO Tienes Repositorio Git (Manual Deploy)

1. Selecciona **"Public Git repository"**
2. O selecciona **"Manual Deploy"** (subir código después)
3. Si eliges Manual Deploy, Render te permitirá subir archivos más tarde

**Nota:** Para esta guía asumiremos que tienes un repositorio Git. Si no, podemos configurarlo después.

---

## 📋 Paso 4.3: Configurar el Servicio

### 4.3.1. Información Básica

Llena estos campos:

- **Name:** `whatsapp-reminders` (o el nombre que prefieras)
- **Region:** `Oregon (US West)` (misma región que la base de datos)
- **Branch:** `main` (o `master` si usas esa rama)

### 4.3.2. Configuración de Build y Runtime

- **Environment:** `Node` (Render lo detecta automáticamente)
- **Root Directory:** (dejar vacío, a menos que el proyecto esté en un subdirectorio)
- **Runtime:** `Node 20` (o la versión más reciente disponible)

### 4.3.3. Build Command (MUY IMPORTANTE)

**Copia y pega esto exactamente:**

```bash
npm install && npm run build && npx prisma migrate deploy
```

Este comando:
1. Instala todas las dependencias
2. Compila TypeScript a JavaScript
3. Ejecuta las migraciones de Prisma para crear las tablas

### 4.3.4. Start Command

**Copia y pega esto:**

```bash
npm start
```

Este comando ejecuta el servidor Node.js compilado.

### 4.3.5. Plan

Para producción 24/7, selecciona:

**Starter ($7 / month)**
- ✅ Nunca se duerme
- ✅ Siempre activo
- ✅ 512 MB RAM
- ✅ 0.5 CPU

**O si quieres empezar gratis:**
- **Free** - Se duerme después de 15 min (no recomendado para producción 24/7)

**Recomendado:** Starter ($7/mes) para que funcione 24/7 sin interrupciones.

### 4.3.6. Health Check

- **Health Check Path:** `/health`
- Render verificará automáticamente este endpoint cada 5 minutos para asegurar que el servicio está funcionando

---

## 📋 Paso 4.4: Vincular la Base de Datos (CRÍTICO)

### 4.4.1. Buscar Opción "Link Database"

En la sección **"Environment"** o **"Advanced"** del formulario, busca:

- **"Link Database"** o **"Add Database"**
- O una sección que diga **"Databases"**

### 4.4.2. Vincular la Base de Datos

1. Haz clic en **"Link Database"** o **"Add Database"**
2. Selecciona la base de datos que creamos: **`whatsapp-reminders-db`**
3. Render configurará automáticamente la variable `DATABASE_URL` con la URL interna correcta
4. ✅ Esto es CRÍTICO - sin esto, el servicio no podrá conectarse a la base de datos

**IMPORTANTE:** Render usará la **Internal Database URL** automáticamente, que es lo que necesitamos.

---

## 📋 Paso 4.5: Configurar Variables de Entorno

En la sección **"Environment Variables"** o **"Environment"**, agrega estas variables **UNA POR UNA**:

### Variables del Servidor

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `APP_TIMEZONE` | `America/Bogota` |

### Base de Datos (Automático - Ya Configurado)

✅ `DATABASE_URL` - **Ya está configurada automáticamente** cuando vincularas la base de datos en el paso anterior.

**Si NO se configuró automáticamente:**
1. Ve a tu base de datos en Render
2. Pestaña **"Connections"**
3. Copia la **"Internal Database URL"**
4. Pégalo en `DATABASE_URL`

### Variables de Twilio

Necesitas obtener tus credenciales de Twilio primero:

1. Ve a [console.twilio.com](https://console.twilio.com)
2. Inicia sesión
3. Ve a **Account** → **Account Info**
4. Copia **Account SID** y **Auth Token**

Agrega estas variables:

| Key | Value | Nota |
|-----|-------|------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Tu Account SID de Twilio |
| `TWILIO_AUTH_TOKEN` | `tu_auth_token_aqui` | ⚠️ **MARCAR COMO SECRET** |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | Para Sandbox. O tu número verificado |

**⚠️ IMPORTANTE:** Al agregar `TWILIO_AUTH_TOKEN`, activa el toggle **"Secret"** o **"Sensitive"** para que no se muestre en los logs.

### Tu Número de WhatsApp Personal

| Key | Value |
|-----|-------|
| `MY_WHATSAPP_NUMBER` | `whatsapp:+57XXXXXXXXXX` |

**Formato:** `whatsapp:+57` + tu número sin espacios

**Ejemplo:** Si tu número es `3001234567`, sería: `whatsapp:+573001234567`

### Variables del Webhook (Automáticas)

**NO necesitas configurar estas manualmente:**

- `RENDER_EXTERNAL_URL` - Render la configura automáticamente
- `PUBLIC_BASE_URL` - Opcional, se usa `RENDER_EXTERNAL_URL` automáticamente

Solo agrega esta:

| Key | Value |
|-----|-------|
| `TWILIO_WEBHOOK_PATH` | `/webhooks/twilio/whatsapp` |

---

## 📋 Paso 4.6: Revisar Configuración Antes de Crear

Antes de hacer clic en "Create Web Service", verifica:

- ✅ Name: `whatsapp-reminders`
- ✅ Build Command: `npm install && npm run build && npx prisma migrate deploy`
- ✅ Start Command: `npm start`
- ✅ Health Check Path: `/health`
- ✅ Plan: Starter ($7/mes) o Free (si pruebas primero)
- ✅ Base de datos vinculada (Link Database hecho)
- ✅ Todas las variables de entorno agregadas
- ✅ `TWILIO_AUTH_TOKEN` marcado como Secret

---

## 📋 Paso 4.7: Crear el Servicio

1. Una vez que todo esté configurado
2. Haz clic en **"Create Web Service"** o **"Crear Servicio Web"**
3. Render comenzará a construir y desplegar tu aplicación
4. Verás los logs en tiempo real

---

## ⏱️ Tiempo Estimado

- **Primer build:** 3-5 minutos
- Render necesita:
  - Clonar el repositorio
  - Instalar dependencias (`npm install`)
  - Compilar TypeScript (`npm run build`)
  - Generar Prisma Client
  - Ejecutar migraciones (`npx prisma migrate deploy`)
  - Iniciar el servidor

---

## ✅ Qué Deberías Ver Durante el Build

En los logs verás:

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

---

## 🎯 Siguiente Paso

Una vez que el servicio esté desplegado:

**➡️ Vamos al Paso 5: Verificar que Funciona**

En el Paso 5 verificarás:
- Health check responde
- Base de datos conectada
- Scheduler ejecutándose
- Todo funcionando correctamente

---

## 🐛 Si Hay Errores en el Build

**Error común: "Database connection failed"**
- Verifica que la base de datos esté vinculada (Link Database)
- Verifica que la base de datos esté en "Available" (no "Creating")

**Error común: "Prisma migrate failed"**
- Verifica que `npx prisma migrate deploy` esté en el Build Command
- Revisa los logs para ver el error específico

**Error común: "Port already in use"**
- Asegúrate de que `PORT=10000` esté configurada
- Render usa el puerto 10000 automáticamente

---

¡Sigue estos pasos y cuando termines de crear el servicio, avísame! 🚀
