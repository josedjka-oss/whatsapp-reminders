# 📱 WhatsApp Reminders - App Personal de Recordatorios

Aplicación personal para enviar recordatorios automáticos por WhatsApp usando Twilio, con capacidad de recibir y reenviar respuestas a tu WhatsApp personal.

## 🚀 Stack Tecnológico

- **Node.js 20** + **TypeScript**
- **Express** - Servidor web
- **PostgreSQL** + **Prisma** - Base de datos (SQLite para desarrollo local)
- **node-cron** - Scheduler para ejecutar recordatorios
- **Twilio SDK** - Envío y recepción de mensajes WhatsApp
- **date-fns-tz** - Manejo de zonas horarias

## 🌐 Despliegue a Producción

**La aplicación está lista para producción 24/7.**

Para desplegar en Render.com o Railway.app, sigue la guía completa en:

📖 **[DEPLOY-PRODUCCION.md](./DEPLOY-PRODUCCION.md)**

### Características de Producción:
- ✅ Funciona 24/7 sin intervención
- ✅ Reinicio automático si falla
- ✅ Base de datos PostgreSQL
- ✅ Health checks para monitoreo
- ✅ Logs estructurados
- ✅ Graceful shutdown
- ✅ Manejo robusto de errores

## 📋 Requisitos Previos

1. **Node.js 20** instalado
2. **Cuenta de Twilio** (gratis para sandbox)
3. **ngrok** (para desarrollo local, opcional)

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
PORT=3000
APP_TIMEZONE=America/Bogota
DATABASE_URL="file:./dev.db"

# Twilio Credentials (obténlas en https://console.twilio.com/)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# Twilio WhatsApp Number (Sandbox)
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Tu número de WhatsApp personal (formato: whatsapp:+57xxxxxxxxxx)
MY_WHATSAPP_NUMBER=whatsapp:+57xxxxxxxxxx

# URL pública (usar ngrok para desarrollo local)
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok.io

# Ruta del webhook
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# (Opcional) Abrir Prisma Studio para ver datos
npm run db:studio
```

## 📱 Configurar Twilio WhatsApp

### Paso 1: Activar Twilio WhatsApp Sandbox

1. Ve a [Twilio Console](https://console.twilio.com/)
2. Navega a **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Verás el número de sandbox: `whatsapp:+14155238886`
4. Verás un **código de unión** (join code) como: `join <palabra-secreta>`

### Paso 2: Unir tu WhatsApp al Sandbox

1. Abre WhatsApp en tu teléfono
2. Envía un mensaje al número: `+1 415 523 8886`
3. Envía el código: `join <palabra-secreta>` (el código que te mostró Twilio)
4. Recibirás confirmación: "Your WhatsApp number is now registered with Twilio"

### Paso 3: Configurar Webhook (Desarrollo Local con ngrok)

#### Instalar ngrok

```bash
# Descargar desde https://ngrok.com/download
# O con npm:
npm install -g ngrok
```

#### Iniciar túnel ngrok

```bash
# Inicia tu servidor primero (en otra terminal):
npm run dev

# Luego inicia ngrok (en otra terminal):
ngrok http 3000
```

Copiarás la URL de ngrok (ej: `https://abc123.ngrok.io`) y la usarás en `PUBLIC_BASE_URL`.

#### Configurar Webhook en Twilio

1. Ve a [Twilio Console](https://console.twilio.com/) → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Haz clic en **Configuration**
3. En **WHEN A MESSAGE COMES IN**, pega:
   ```
   https://TU-URL-NGROK.ngrok.io/webhooks/twilio/whatsapp
   ```
4. Selecciona **HTTP POST**
5. Guarda los cambios

**Nota:** Cada vez que reinicies ngrok, tendrás una URL nueva y deberás actualizar el webhook en Twilio.

### Paso 4: Configurar Webhook (Producción)

Si despliegas en Render/Railway, usa la URL de tu servicio directamente:

```env
PUBLIC_BASE_URL=https://tu-app.onrender.com
```

Y configura el webhook en Twilio con esa URL.

## 🏃 Ejecutar Localmente

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📡 API Endpoints

### Crear Recordatorio

```bash
# Recordatorio único (once)
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio: Reunión importante mañana",
    "scheduleType": "once",
    "sendAt": "2025-01-15T14:30:00",
    "timezone": "America/Bogota"
  }'

# Recordatorio diario (daily)
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio diario: Tomar medicamento",
    "scheduleType": "daily",
    "hour": 9,
    "minute": 0,
    "timezone": "America/Bogota"
  }'

# Recordatorio mensual (monthly)
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio mensual: Pago de facturas",
    "scheduleType": "monthly",
    "dayOfMonth": 5,
    "hour": 8,
    "minute": 30,
    "timezone": "America/Bogota"
  }'
```

### Listar Recordatorios

```bash
# Todos
curl http://localhost:3000/api/reminders

# Solo activos
curl http://localhost:3000/api/reminders?isActive=true

# Por tipo
curl http://localhost:3000/api/reminders?scheduleType=daily
```

### Actualizar Recordatorio

```bash
curl -X PATCH http://localhost:3000/api/reminders/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Eliminar Recordatorio

```bash
curl -X DELETE http://localhost:3000/api/reminders/{id}
```

### Listar Mensajes

```bash
# Todos
curl http://localhost:3000/api/messages

# Filtrar por dirección
curl http://localhost:3000/api/messages?direction=inbound

# Filtrar por remitente
curl http://localhost:3000/api/messages?from=whatsapp:+573001234567

# Limitar resultados
curl http://localhost:3000/api/messages?limit=10
```

## 🔄 Cómo Funciona

### Scheduler (node-cron)

- Se ejecuta **cada minuto**
- Verifica todos los recordatorios activos
- Calcula si "toca enviar" según:
  - **once**: Fecha/hora exacta (`sendAt`)
  - **daily**: Hora y minuto específicos
  - **monthly**: Día del mes, hora y minuto
- **Evita duplicados**: No envía si ya se envió en los últimos 60 segundos
- **Reintentos**: 3 intentos con backoff exponencial si falla

### Webhook de Twilio

- Recibe mensajes entrantes en `/webhooks/twilio/whatsapp`
- **Valida firma** de Twilio para seguridad
- Guarda mensaje en base de datos
- **Reenvía automáticamente** a tu WhatsApp personal con formato:
  ```
  📩 Respuesta de whatsapp:+573001234567:

  Mensaje original aquí
  ```

## 🚀 Desplegar a Producción en Render.com

**Guía completa paso a paso:** Ver **[DESPLIEGUE-RENDER.md](./DESPLIEGUE-RENDER.md)**

### Quick Start en Render

1. **Crear base de datos PostgreSQL:**
   - Render Dashboard → **New +** → **PostgreSQL**
   - Plan: Starter (Free) o Standard ($7/mes)
   - Name: `whatsapp-reminders-db`

2. **Crear servicio web:**
   - Render Dashboard → **New +** → **Web Service**
   - Conecta tu repositorio Git o sube código manualmente
   - Build Command: `npm install && npm run build && npx prisma migrate deploy`
   - Start Command: `npm start`

3. **Configurar variables de entorno:**
   - `NODE_ENV=production`
   - `PORT=10000`
   - `APP_TIMEZONE=America/Bogota`
   - `DATABASE_URL` (vincula automáticamente con la base de datos)
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
   - `MY_WHATSAPP_NUMBER`

4. **Configurar webhook de Twilio:**
   - Copia la URL de Render: `https://tu-url.onrender.com`
   - Configura en Twilio Console: `https://tu-url.onrender.com/webhooks/twilio/whatsapp`

5. **¡Listo!** El servicio funciona 24/7 automáticamente

**Características en Render:**
- ✅ Reinicio automático si falla
- ✅ PostgreSQL incluido (gratis o $7/mes)
- ✅ SSL automático (HTTPS)
- ✅ Health checks automáticos
- ✅ Logs centralizados y persistentes
- ✅ Variables de entorno seguras
- ✅ Webhook permanente (no necesita ngrok)

**Nota:** El plan gratuito se "duerme" después de 15 min de inactividad. Para producción 24/7, usa el plan Starter ($7/mes).

**Guía detallada:** Ver **[DESPLIEGUE-RENDER.md](./DESPLIEGUE-RENDER.md)** para pasos completos con capturas y troubleshooting.

## 🔒 Seguridad

- ✅ Validación de firma Twilio en webhooks (`X-Twilio-Signature`)
- ✅ Variables de entorno para credenciales
- ✅ `.env` en `.gitignore`

## 📊 Estructura de Base de Datos

### Reminder

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (UUID) | ID único |
| to | String | Número destino (whatsapp:+...) |
| body | String | Mensaje del recordatorio |
| scheduleType | String | once, daily, monthly |
| sendAt | DateTime? | Para "once" |
| hour | Int? | Hora (0-23) |
| minute | Int? | Minuto (0-59) |
| dayOfMonth | Int? | Día del mes (1-31) para "monthly" |
| timezone | String | Zona horaria (default: America/Bogota) |
| isActive | Boolean | Activo/desactivado |
| lastRunAt | DateTime? | Última vez que se envió |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### Message

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (UUID) | ID único |
| direction | String | inbound, outbound |
| from | String | Número remitente |
| to | String | Número destino |
| body | String | Contenido del mensaje |
| twilioSid | String? | Message SID de Twilio |
| createdAt | DateTime | Fecha de creación |

## 🧪 Pruebas

### Crear un recordatorio de prueba (una vez)

```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Prueba de recordatorio",
    "scheduleType": "once",
    "sendAt": "2025-01-15T10:00:00",
    "timezone": "America/Bogota"
  }'
```

Reemplaza `+573001234567` con tu número personal (formato: `+57` + número sin espacios).

### Verificar que funciona

1. Espera al minuto programado
2. Revisa los logs del servidor
3. Revisa tu WhatsApp
4. Lista mensajes: `curl http://localhost:3000/api/messages`

## 📝 Notas Importantes

- **Twilio Sandbox**: Solo puedes enviar a números verificados. Para producción, necesitas aprobación de Twilio.
- **Costo**: Sandbox es gratis. Producción: ~$0.005 por mensaje.
- **Timezone**: Los recordatorios usan la zona horaria configurada (`America/Bogota` por defecto).
- **Duplicados**: El sistema evita enviar el mismo recordatorio dos veces en 60 segundos.

## 🐛 Troubleshooting

### El scheduler no envía mensajes

- Verifica que `isActive: true` en el recordatorio
- Revisa los logs del servidor
- Verifica que la hora/minuto coincidan con la zona horaria
- Revisa credenciales de Twilio en `.env`

### Webhook no recibe mensajes

- Verifica que ngrok esté corriendo (si es local)
- Verifica la URL del webhook en Twilio Console
- Verifica que `PUBLIC_BASE_URL` esté correcta
- Revisa logs del servidor para ver si llegan requests

### Error de validación de firma

- Verifica que `TWILIO_AUTH_TOKEN` sea correcto
- Verifica que la URL del webhook en Twilio sea exactamente la que está en `PUBLIC_BASE_URL`

## 📚 Recursos

- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Console](https://console.twilio.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [node-cron Documentation](https://github.com/node-cron/node-cron)
