# 🎯 PLAN: App de Recordatorios WhatsApp con Twilio

## Objetivo del Proyecto

Aplicación personal para enviar recordatorios por WhatsApp usando Twilio, con funcionalidad de webhook para reenviar respuestas a tu WhatsApp personal.

## Arquitectura Nueva

### Frontend (Opcional - Simplificado)
- Next.js con formulario simple para crear recordatorios
- O usar solo API REST directamente

### Backend
- **Stack**: Node.js 20 + TypeScript + Express
- **Base de datos**: SQLite + Prisma
- **Scheduler**: node-cron (ejecuta cada minuto)
- **WhatsApp**: Twilio SDK
- **Validación**: Firma Twilio en webhooks

## Estructura del Proyecto

```
whatsapp-reminders/
├── src/
│   ├── server.ts              # Servidor Express principal
│   ├── routes/
│   │   ├── reminders.ts       # CRUD de recordatorios
│   │   ├── webhooks.ts        # Webhook de Twilio
│   │   └── messages.ts        # Listar mensajes
│   ├── services/
│   │   ├── twilio.ts          # Servicio Twilio (enviar/recibir)
│   │   └── scheduler.ts       # Lógica de scheduling con cron
│   └── utils/
│       └── validation.ts      # Validación de firma Twilio
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── migrations/            # Migraciones
├── .env.example               # Variables de entorno ejemplo
├── .env                       # Variables reales (gitignored)
├── package.json
├── tsconfig.json
└── README.md                  # Documentación completa
```

## Funcionalidades

### 1. Recordatorios (Reminders)
- Crear recordatorio con tipo: `once`, `daily`, `monthly`
- Configurar hora y fecha específica
- Activar/desactivar recordatorios
- Listar y filtrar recordatorios

### 2. Scheduler (node-cron)
- Ejecuta cada minuto
- Calcula si "toca enviar" según scheduleType y timezone
- Evita duplicados con lastRunAt
- Reintenta 3 veces si falla

### 3. Webhook Twilio
- Recibe mensajes entrantes
- Valida firma Twilio
- Guarda en base de datos
- Reenvía a tu WhatsApp personal con formato: "📩 Respuesta de {From}: {Body}"

## Modelo de Datos

### Reminder
- id (String, @id, @default(uuid()))
- to (String) - Número destino
- body (String) - Mensaje
- scheduleType (Enum: once, daily, monthly)
- sendAt (DateTime?) - Para "once"
- hour (Int?) - Hora del día (0-23)
- minute (Int?) - Minuto (0-59)
- dayOfMonth (Int?) - Día del mes (1-31) para "monthly"
- timezone (String, @default("America/Bogota"))
- isActive (Boolean, @default(true))
- lastRunAt (DateTime?)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)

### Message
- id (String, @id, @default(uuid()))
- direction (Enum: inbound, outbound)
- from (String)
- to (String)
- body (String)
- twilioSid (String?) - ID de Twilio
- createdAt (DateTime, @default(now()))

## API Endpoints

- `POST /api/reminders` - Crear recordatorio
- `GET /api/reminders` - Listar recordatorios
- `PATCH /api/reminders/:id` - Actualizar/activar/desactivar
- `DELETE /api/reminders/:id` - Eliminar
- `GET /api/messages` - Listar mensajes (con filtros)
- `POST /webhooks/twilio/whatsapp` - Webhook de Twilio

## Variables de Entorno

```env
PORT=3000
APP_TIMEZONE=America/Bogota
DATABASE_URL="file:./dev.db"
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM="whatsapp:+1415xxxxxxx"
MY_WHATSAPP_NUMBER="whatsapp:+57xxxxxxxxxx"
PUBLIC_BASE_URL="https://TU-DOMINIO"
TWILIO_WEBHOOK_PATH="/webhooks/twilio/whatsapp"
```

## Pasos de Implementación

1. ✅ Limpiar proyecto (borrar cloud-run, functions, documentación antigua)
2. ✅ Crear estructura de directorios
3. ✅ Configurar Prisma con schema
4. ✅ Implementar servidor Express base
5. ✅ Servicio Twilio (enviar mensajes)
6. ✅ Rutas de recordatorios (CRUD)
7. ✅ Scheduler con node-cron
8. ✅ Webhook de Twilio con validación
9. ✅ Frontend simple (opcional) o solo API
10. ✅ README completo con instrucciones

## Ventajas de Este Enfoque

✅ **Twilio es confiable** - 99.9% uptime
✅ **Sin problemas de sesión** - No necesita mantener conexiones
✅ **Webhooks nativos** - Twilio maneja todo
✅ **Código simple** - Sin Puppeteer, sin Baileys
✅ **Fácil de debuggear** - SQLite local, logs claros
✅ **Desplegable fácil** - Cualquier hosting (Render, Railway, etc.)

## Costos

- **Twilio Sandbox**: Gratis (solo a números verificados)
- **Twilio Producción**: ~$0.005 por mensaje
- **Hosting**: Render/Railway free tier o ~$5-7/mes

---

**¿Procedo con la implementación completa desde cero?**
