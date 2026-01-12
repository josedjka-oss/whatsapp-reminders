# 🔐 Variables de Entorno para Render.com

Este documento lista todas las variables de entorno necesarias para desplegar en Render.com.

---

## 📋 Variables Requeridas

### Servidor

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | `10000` | Puerto del servidor (Render usa 10000 automáticamente) |
| `APP_TIMEZONE` | `America/Bogota` | Zona horaria para el scheduler |

### Base de Datos (Automático en Render)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | **Se configura automáticamente** al vincular la base de datos en Render. Si lo haces manualmente, usa la **Internal Database URL** de la base de datos. |

**Configurar automáticamente:**
1. En el servicio web, sección **"Environment"**
2. Haz clic en **"Link Database"**
3. Selecciona `whatsapp-reminders-db`
4. Render configurará `DATABASE_URL` automáticamente

### Twilio

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Account SID de Twilio (obtener en [console.twilio.com](https://console.twilio.com)) |
| `TWILIO_AUTH_TOKEN` | `tu_auth_token_aqui` | Auth Token de Twilio (⚠️ **MARCAR COMO SECRETO** en Render) |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | Número de Twilio (Sandbox: `+14155238886`, Producción: tu número verificado) |

**Obtener credenciales:**
1. Ve a [console.twilio.com](https://console.twilio.com)
2. **Account** → **Account Info**
3. Copia **Account SID** → `TWILIO_ACCOUNT_SID`
4. Copia **Auth Token** → `TWILIO_AUTH_TOKEN` (marcar como secreto)
5. Para WhatsApp Sandbox: `whatsapp:+14155238886`

### WhatsApp Personal

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MY_WHATSAPP_NUMBER` | `whatsapp:+57XXXXXXXXXX` | Tu número personal que recibe reenvíos (formato: `whatsapp:+57` + número sin espacios) |

### Webhook (Automático en Render)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PUBLIC_BASE_URL` | (vacío o URL manual) | **NO necesaria** - Render automáticamente expone `RENDER_EXTERNAL_URL` que la aplicación usa |
| `RENDER_EXTERNAL_URL` | (automático) | **Render la configura automáticamente** (ej: `https://whatsapp-reminders.onrender.com`) |
| `TWILIO_WEBHOOK_PATH` | `/webhooks/twilio/whatsapp` | Ruta del webhook (normalmente no cambiar) |

**Nota:** La aplicación detecta automáticamente `RENDER_EXTERNAL_URL` de Render. No necesitas configurar `PUBLIC_BASE_URL` manualmente.

---

## 🔧 Configurar Variables en Render

### Opción 1: Desde el Dashboard (Recomendado)

1. Ve a tu servicio web en Render
2. Sección **"Environment"**
3. Haz clic en **"Add Environment Variable"**
4. Agrega cada variable una por una

### Opción 2: Usando `render.yaml` (Infraestructura como Código)

El archivo `render.yaml` ya está configurado. Si usas Git:

1. Render detectará automáticamente `render.yaml`
2. Creará los servicios y base de datos automáticamente
3. Solo necesitas configurar las variables marcadas como `sync: false`

---

## 🔒 Variables Secretas

**Marcar como Secret en Render:**
- `TWILIO_AUTH_TOKEN` ⚠️ **Muy sensible**
- `DATABASE_URL` ⚠️ Contiene credenciales de base de datos
- `TWILIO_ACCOUNT_SID` (opcional, pero recomendado)

**Cómo marcar como secreto:**
1. En Render, al agregar la variable
2. Activa el toggle **"Secret"** o **"Sensitive"**
3. El valor se ocultará en los logs

---

## ✅ Checklist de Variables

Antes de desplegar, verifica que tienes configuradas:

### Críticas (Sin estas, la app no funcionará)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `DATABASE_URL` (vinculada automáticamente)
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN` (marcar como secreto)
- [ ] `TWILIO_WHATSAPP_FROM`

### Importantes (Funcionalidad limitada sin estas)
- [ ] `APP_TIMEZONE=America/Bogota`
- [ ] `MY_WHATSAPP_NUMBER` (necesario para reenvíos)

### Automáticas (No configurar manualmente)
- [x] `RENDER_EXTERNAL_URL` (Render la configura automáticamente)
- [x] `PUBLIC_BASE_URL` (opcional, se usa `RENDER_EXTERNAL_URL`)

---

## 🐛 Verificar Variables Después del Deploy

1. Ve a tu servicio web en Render
2. Sección **"Environment"**
3. Verifica que todas las variables estén presentes
4. Revisa los logs para verificar que no hay errores de variables faltantes

**Si falta una variable crítica, verás en los logs:**
```
[INIT] ⚠️  Variables de entorno faltantes: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
```

---

## 📝 Ejemplo de Configuración Completa

```env
# Servidor
NODE_ENV=production
PORT=10000
APP_TIMEZONE=America/Bogota

# Base de datos (configurada automáticamente por Render)
DATABASE_URL=postgresql://usuario:password@dpg-xxxxx-a/whatsapp_reminders

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_secreto_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# WhatsApp Personal
MY_WHATSAPP_NUMBER=whatsapp:+57XXXXXXXXXX

# Webhook (automático)
RENDER_EXTERNAL_URL=https://whatsapp-reminders.onrender.com
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

**Nota:** `RENDER_EXTERNAL_URL` y `DATABASE_URL` se configuran automáticamente en Render. No necesitas copiarlas manualmente si usas "Link Database" y Render expone la URL externa.

---

¡Con esto tendrás todas las variables configuradas correctamente! 🎉
