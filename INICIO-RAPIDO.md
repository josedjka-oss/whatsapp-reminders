# 🚀 Inicio Rápido - WhatsApp Reminders

## ✅ Proyecto Creado

He creado completamente la aplicación de recordatorios WhatsApp usando Twilio desde cero.

## 📁 Estructura del Proyecto

```
whatsapp-reminders/
├── src/
│   ├── server.ts              ✅ Servidor Express principal
│   ├── routes/
│   │   ├── reminders.ts       ✅ CRUD de recordatorios
│   │   ├── webhooks.ts        ✅ Webhook de Twilio
│   │   └── messages.ts        ✅ Listar mensajes
│   ├── services/
│   │   ├── twilio.ts          ✅ Servicio Twilio (enviar/reenviar)
│   │   └── scheduler.ts       ✅ Scheduler con node-cron
│   └── utils/
│       └── validation.ts      ✅ Validación de firma Twilio
├── prisma/
│   └── schema.prisma          ✅ Esquema de base de datos
├── .env.example               ✅ Variables de entorno ejemplo
├── package.json               ✅ Dependencias configuradas
├── tsconfig.json              ✅ Configuración TypeScript
├── .gitignore                 ✅ Archivos ignorados
└── README.md                  ✅ Documentación completa
```

## 🔧 Pasos para Empezar

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Twilio
```

Variables necesarias en `.env`:
- `TWILIO_ACCOUNT_SID` - De Twilio Console
- `TWILIO_AUTH_TOKEN` - De Twilio Console
- `TWILIO_WHATSAPP_FROM` - Número de Twilio (ej: `whatsapp:+14155238886` para sandbox)
- `MY_WHATSAPP_NUMBER` - Tu número personal (ej: `whatsapp:+573001234567`)
- `PUBLIC_BASE_URL` - URL pública (usar ngrok para desarrollo local)

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate
```

### 4. Configurar Twilio WhatsApp Sandbox

1. Ve a [Twilio Console](https://console.twilio.com/)
2. **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Verás el número de sandbox: `+1 415 523 8886`
4. Verás un **código de unión** (join code)
5. **En tu WhatsApp**, envía un mensaje al `+1 415 523 8886` con el código: `join <código>`
6. Recibirás confirmación: "Your WhatsApp number is now registered with Twilio"

### 5. Configurar Webhook (Desarrollo Local con ngrok)

#### Instalar ngrok

```bash
# Windows: Descargar desde https://ngrok.com/download
# O usar npm:
npm install -g ngrok
```

#### Iniciar túnel ngrok

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Iniciar ngrok
ngrok http 3000
```

Copia la URL de ngrok (ej: `https://abc123.ngrok.io`) y úsala en:
- `.env`: `PUBLIC_BASE_URL=https://abc123.ngrok.io`
- Twilio Console → Webhook URL: `https://abc123.ngrok.io/webhooks/twilio/whatsapp`

### 6. Ejecutar la Aplicación

```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

## 📡 Probar la API

### Crear un Recordatorio (Once)

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

### Crear un Recordatorio (Daily)

```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio diario",
    "scheduleType": "daily",
    "hour": 9,
    "minute": 0,
    "timezone": "America/Bogota"
  }'
```

### Crear un Recordatorio (Monthly)

```bash
curl -X POST http://localhost:3000/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio mensual",
    "scheduleType": "monthly",
    "dayOfMonth": 5,
    "hour": 8,
    "minute": 30,
    "timezone": "America/Bogota"
  }'
```

### Listar Recordatorios

```bash
curl http://localhost:3000/api/reminders
```

### Listar Mensajes

```bash
curl http://localhost:3000/api/messages
```

## 🔄 Cómo Funciona

### Scheduler
- Se ejecuta **cada minuto** automáticamente
- Verifica todos los recordatorios activos
- Envía mensajes según la programación
- **Evita duplicados** (no envía si ya se envió en los últimos 60 segundos)
- **Reintenta 3 veces** si falla el envío

### Webhook
- Recibe mensajes entrantes en `/webhooks/twilio/whatsapp`
- **Valida firma de Twilio** para seguridad
- Guarda mensaje en base de datos
- **Reenvía automáticamente** a tu WhatsApp personal con formato:
  ```
  📩 Respuesta de whatsapp:+573001234567:

  Mensaje original aquí
  ```

## 📚 Documentación Completa

Ver `README.md` para documentación completa con:
- Instrucciones detalladas de configuración
- Todos los endpoints de la API
- Guía de despliegue (Render, Railway, VPS)
- Troubleshooting
- Ejemplos de uso

## 🎯 Próximos Pasos

1. ✅ Instalar dependencias: `npm install`
2. ✅ Configurar `.env` con tus credenciales de Twilio
3. ✅ Configurar base de datos: `npm run db:generate && npm run db:migrate`
4. ✅ Unir tu WhatsApp al Twilio Sandbox
5. ✅ Configurar webhook con ngrok
6. ✅ Iniciar servidor: `npm run dev`
7. ✅ Crear tu primer recordatorio con curl

¡Listo para usar! 🎉
