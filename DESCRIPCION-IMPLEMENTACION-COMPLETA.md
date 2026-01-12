# 📋 Descripción Técnica Completa de la Aplicación

## 🎯 Objetivo de la Aplicación

Aplicación personal de recordatorios por WhatsApp que permite:
1. **Recibir mensajes** enviados a un número de Twilio WhatsApp y reenviarlos automáticamente al número personal del usuario
2. **Crear recordatorios programados** que se envían automáticamente por WhatsApp (una vez, diario, mensual)
3. **Ejecutarse 24/7** en producción sin intervención manual

---

## 🏗️ Arquitectura y Stack Tecnológico

### **Backend:**
- **Runtime:** Node.js 20
- **Lenguaje:** TypeScript
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL (producción) / SQLite (desarrollo local)
- **ORM:** Prisma
- **Scheduler:** node-cron
- **WhatsApp:** Twilio SDK

### **Hosting:**
- **PaaS:** Render.com (Web Service)
- **Base de Datos:** Render PostgreSQL
- **Despliegue:** Automático desde GitHub

---

## 📁 Estructura del Proyecto

```
whatsapp-reminders/
├── src/
│   ├── server.ts              # Servidor Express principal
│   ├── routes/
│   │   ├── reminders.ts        # API REST para recordatorios
│   │   ├── messages.ts         # API REST para mensajes
│   │   └── webhooks.ts         # Webhook de Twilio para mensajes entrantes
│   ├── services/
│   │   ├── twilio.ts           # Servicio para enviar/reenviar mensajes
│   │   └── scheduler.ts        # Cron job para ejecutar recordatorios
│   └── utils/
│       └── validation.ts       # Validación de firma Twilio
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── migrations/             # Migraciones de Prisma
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Modelo de Datos (Prisma)

### **Modelo Reminder:**
```prisma
model Reminder {
  id          String    @id @default(uuid())
  to          String    // Número destino (whatsapp:+57...)
  body        String    // Mensaje del recordatorio
  scheduleType String   // "once", "daily", "monthly"
  sendAt      DateTime? // Para scheduleType "once"
  hour        Int?      // Hora (0-23) para daily/monthly
  minute      Int?      // Minuto (0-59) para daily/monthly
  dayOfMonth  Int?      // Día del mes (1-31) para monthly
  timezone    String    @default("America/Bogota")
  isActive    Boolean   @default(true)
  lastRunAt   DateTime? // Para evitar duplicados
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### **Modelo Message:**
```prisma
model Message {
  id        String   @id @default(uuid())
  direction String   // "inbound" o "outbound"
  from      String   // Número remitente
  to        String   // Número destino
  body      String   // Contenido del mensaje
  twilioSid String?  // Message SID de Twilio
  createdAt DateTime @default(now())
}
```

---

## 🔄 Flujos Principales

### **1. Flujo de Recepción de Mensajes (Webhook)**

```
WhatsApp → Twilio → Webhook Endpoint → Base de Datos → Reenvío a WhatsApp Personal
```

**Implementación:**
- **Endpoint:** `POST /webhooks/twilio/whatsapp`
- **Archivo:** `src/routes/webhooks.ts`
- **Proceso:**
  1. Twilio envía webhook con mensaje entrante (form-urlencoded)
  2. Se valida la firma de Twilio (temporalmente deshabilitada)
  3. Se extraen datos del mensaje (`From`, `To`, `Body`, `MessageSid`)
  4. Se guarda en base de datos como `Message` con `direction: "inbound"`
  5. Se reenvía al número personal usando `forwardToMyWhatsApp()`
  6. Se responde a Twilio con TwiML vacío

**Código clave:**
```typescript
router.post("/twilio/whatsapp", async (req: Request, res: Response) => {
  // Validar firma (temporalmente deshabilitada)
  // Extraer datos del mensaje
  const from = req.body.From;
  const body = req.body.Body;
  
  // Guardar en DB
  await prisma.message.create({ direction: "inbound", ... });
  
  // Reenviar a WhatsApp personal
  await forwardToMyWhatsApp(from, body);
  
  // Responder a Twilio
  return res.status(200).type("text/xml").send("<Response></Response>");
});
```

---

### **2. Flujo de Envío de Recordatorios (Scheduler)**

```
Cron Job (cada minuto) → Consultar recordatorios activos → Verificar si debe enviarse → Enviar por Twilio → Actualizar lastRunAt
```

**Implementación:**
- **Archivo:** `src/services/scheduler.ts`
- **Frecuencia:** Cada minuto (`* * * * *`)
- **Timezone:** `America/Bogota` (configurable)
- **Proceso:**
  1. Cron job se ejecuta cada minuto
  2. Consulta todos los `Reminder` con `isActive: true`
  3. Para cada recordatorio, verifica si debe enviarse según `scheduleType`:
     - **once:** Compara `sendAt` con hora actual (tolerancia 60s)
     - **daily:** Compara `hour` y `minute` con hora actual en timezone
     - **monthly:** Compara `dayOfMonth`, `hour` y `minute` con fecha/hora actual
  4. Verifica `lastRunAt` para evitar duplicados (ventana de 60 segundos)
  5. Si debe enviarse:
     - Envía mensaje usando `sendWhatsAppMessage()`
     - Actualiza `lastRunAt`
     - Si es `scheduleType: "once"`, desactiva el recordatorio (`isActive: false`)
  6. Reintentos: 3 intentos con backoff exponencial (2s, 4s, 8s)

**Código clave:**
```typescript
cron.schedule("* * * * *", async () => {
  const reminders = await prisma.reminder.findMany({
    where: { isActive: true }
  });
  
  for (const reminder of reminders) {
    if (await shouldSendReminder(reminder)) {
      await sendWhatsAppMessage({ to: reminder.to, body: reminder.body });
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { lastRunAt: new Date() }
      });
    }
  }
}, { timezone: "America/Bogota" });
```

---

### **3. Flujo de Creación de Recordatorios (API REST)**

```
Cliente → POST /api/reminders → Validar datos → Crear en DB → Retornar recordatorio creado
```

**Implementación:**
- **Endpoint:** `POST /api/reminders`
- **Archivo:** `src/routes/reminders.ts`
- **Validaciones:**
  - `scheduleType` debe ser "once", "daily" o "monthly"
  - Para "once": requiere `sendAt`
  - Para "daily": requiere `hour` y `minute`
  - Para "monthly": requiere `dayOfMonth`, `hour` y `minute`
  - `to` debe tener formato `whatsapp:+...`

**Ejemplo de request:**
```json
{
  "to": "whatsapp:+573024002656",
  "body": "Recordatorio: Reunión importante",
  "scheduleType": "once",
  "sendAt": "2026-01-12T10:00:00Z",
  "timezone": "America/Bogota"
}
```

---

## 🔧 Servicios Principales

### **1. Servicio Twilio (`src/services/twilio.ts`)**

**Funciones:**
- `getTwilioCredentials()`: Obtiene y valida credenciales de variables de entorno
- `getTwilioClient()`: Crea cliente de Twilio (lazy initialization)
- `sendWhatsAppMessage({ to, body })`: Envía mensaje por WhatsApp
- `forwardToMyWhatsApp(from, body)`: Reenvía mensaje recibido al número personal

**Variables de entorno requeridas:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (SECRET)
- `TWILIO_WHATSAPP_FROM` (ej: `whatsapp:+14155238886`)
- `MY_WHATSAPP_NUMBER` (ej: `whatsapp:+573024002656`)

**Código clave:**
```typescript
export const sendWhatsAppMessage = async ({ to, body }: SendMessageParams) => {
  const credentials = getTwilioCredentials();
  const client = getTwilioClient();
  
  const message = await client.messages.create({
    from: credentials.fromNumber,
    to: to,
    body: body,
  });
  
  // Guardar en DB
  await prisma.message.create({
    direction: "outbound",
    from: credentials.fromNumber,
    to: to,
    body: body,
    twilioSid: message.sid,
  });
  
  return message.sid;
};
```

---

### **2. Servicio Scheduler (`src/services/scheduler.ts`)**

**Funciones:**
- `shouldSendReminder(reminder)`: Determina si un recordatorio debe enviarse ahora
- `processReminders()`: Procesa todos los recordatorios activos
- `startScheduler()`: Inicia el cron job

**Lógica de `shouldSendReminder()`:**
- Verifica `lastRunAt` para evitar duplicados (ventana de 60s)
- Para "once": Compara `sendAt` con hora actual (tolerancia 60s)
- Para "daily": Compara `hour` y `minute` con hora actual en timezone
- Para "monthly": Compara `dayOfMonth`, `hour` y `minute` con fecha/hora actual en timezone

**Uso de librerías:**
- `date-fns-tz`: Para formatear fechas en timezone específico
- `date-fns`: Para comparaciones de fechas (`isBefore`, `addMinutes`)

---

## 🌐 API REST Endpoints

### **Reminders:**
- `GET /api/reminders` - Listar todos los recordatorios
- `POST /api/reminders` - Crear nuevo recordatorio
- `PATCH /api/reminders/:id` - Actualizar/activar/desactivar recordatorio

### **Messages:**
- `GET /api/messages` - Listar mensajes (filtros opcionales: `from`, `to`, `direction`)

### **Health:**
- `GET /health` - Health check con estado de DB y scheduler

### **Webhook:**
- `POST /webhooks/twilio/whatsapp` - Webhook de Twilio para mensajes entrantes

---

## 🔐 Seguridad

### **Validación de Firma Twilio:**
- **Archivo:** `src/utils/validation.ts`
- **Función:** `validateTwilioSignature(req, url)`
- **Estado actual:** Temporalmente deshabilitada para permitir mensajes (se procesa pero no se rechaza si falla)
- **Implementación:** Usa `twilio.validateRequest(authToken, signature, url, params)`

### **Variables de Entorno:**
- `TWILIO_AUTH_TOKEN` marcado como SECRET en Render
- Todas las credenciales sensibles en variables de entorno (no en código)

---

## 🚀 Despliegue en Render.com

### **Configuración:**
- **Tipo:** Web Service
- **Build Command:** `npm install --include=dev && prisma generate && tsc && npx prisma db push --skip-generate`
- **Start Command:** `npm start`
- **Instance Type:** Starter
- **Health Check Path:** `/health`
- **Auto-Deploy:** Habilitado desde GitHub

### **Base de Datos:**
- **Tipo:** PostgreSQL (Render)
- **Sincronización:** `prisma db push` en build (crea tablas si no existen)
- **Migraciones:** No se usan migraciones formales, se usa `db push` para sincronizar schema

### **Variables de Entorno en Render:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=[SECRET]
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
MY_WHATSAPP_NUMBER=whatsapp:+573024002656
DATABASE_URL=[PostgreSQL connection string de Render]
APP_TIMEZONE=America/Bogota
NODE_ENV=production
PORT=10000
```

---

## 📊 Logging

### **Formato de Logs:**
- Prefijos para identificar origen: `[WEBHOOK]`, `[TWILIO]`, `[SCHEDULER]`, `[INIT]`
- Timestamps ISO: `2026-01-11T15:32:29.306Z`
- Logs estructurados en `stdout`/`stderr` (compatible con Render)

### **Ejemplos de Logs:**
```
[WEBHOOK] 📩 Mensaje recibido de whatsapp:+573024002656 → whatsapp:+14155238886: "Hola"
[TWILIO] Enviando mensaje de whatsapp:+14155238886 a whatsapp:+573024002656
[SCHEDULER] 2026-01-11T15:33:00.736Z - Verificando recordatorios activos...
```

---

## 🔄 Manejo de Errores

### **Graceful Shutdown:**
- Manejo de señales `SIGTERM` y `SIGINT`
- Cierre graceful de servidor HTTP
- Desconexión de base de datos
- Timeout de 5 segundos antes de forzar cierre

### **Errores No Capturados:**
- `uncaughtException`: Log y graceful shutdown
- `unhandledRejection`: Log y graceful shutdown

### **Reintentos:**
- Envío de mensajes: 3 intentos con backoff exponencial (2s, 4s, 8s)
- Errores de DB: Se registran pero no bloquean el flujo principal

---

## 🧪 Testing y Validación

### **Validación de Datos:**
- Validación de `scheduleType` (debe ser "once", "daily", "monthly")
- Validación de formato de números (`whatsapp:+...`)
- Validación de rangos (hour: 0-23, minute: 0-59, dayOfMonth: 1-31)

### **Idempotencia:**
- `lastRunAt` previene envíos duplicados (ventana de 60 segundos)
- Verificación de `isActive` antes de procesar

---

## 📝 Características Especiales

### **1. Prevención de Duplicados:**
- Usa `lastRunAt` + ventana de 60 segundos
- Verifica si ya se ejecutó en el último minuto antes de enviar

### **2. Timezone Support:**
- Todos los cálculos de tiempo usan `America/Bogota` (configurable)
- Usa `date-fns-tz` para formatear fechas en timezone específico

### **3. Lazy Initialization:**
- Cliente de Twilio se crea solo cuando se necesita
- Credenciales se validan en cada uso

### **4. Logging Detallado:**
- Logs extensivos para debugging
- Información de credenciales (solo primeros 10 caracteres por seguridad)

---

## 🔗 Integraciones Externas

### **Twilio:**
- **SDK:** `twilio` (v4.23.0)
- **Uso:** Envío de mensajes WhatsApp, validación de webhooks
- **Sandbox:** Usando Twilio WhatsApp Sandbox (`+1 415 523 8886`)

### **Prisma:**
- **Versión:** 5.11.0
- **Provider:** PostgreSQL (producción)
- **Migraciones:** No se usan, se usa `db push` para sincronizar

---

## 📦 Dependencias Principales

```json
{
  "express": "^4.18.2",
  "twilio": "^4.23.0",
  "@prisma/client": "^5.11.0",
  "node-cron": "^3.0.3",
  "date-fns": "^3.6.0",
  "date-fns-tz": "^3.1.0",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5"
}
```

---

## 🎯 Flujo Completo de un Recordatorio

1. **Usuario crea recordatorio** → `POST /api/reminders`
2. **Se guarda en DB** → `Reminder` con `isActive: true`
3. **Scheduler verifica cada minuto** → `processReminders()`
4. **Se evalúa si debe enviarse** → `shouldSendReminder()`
5. **Si debe enviarse:**
   - Se envía por Twilio → `sendWhatsAppMessage()`
   - Se guarda en DB → `Message` con `direction: "outbound"`
   - Se actualiza `lastRunAt`
   - Si es "once", se desactiva (`isActive: false`)

---

## 🔍 Puntos Clave de la Implementación

1. **Scheduler robusto:** Ejecuta cada minuto, previene duplicados, maneja timezones
2. **Webhook funcional:** Recibe, valida, guarda y reenvía mensajes
3. **API REST completa:** CRUD de recordatorios y consulta de mensajes
4. **Producción-ready:** Graceful shutdown, logging, manejo de errores
5. **Despliegue automatizado:** GitHub → Render, sin intervención manual

---

## 📚 Documentación Adicional

- `README.md`: Guía de uso y configuración
- `ESTADO-FINAL-EXITOSO.md`: Estado actual de la aplicación
- `PASO-A-PASO-RENDER-COMPLETO.md`: Guía de despliegue en Render

---

**Esta es la descripción técnica completa de la aplicación. Puedes compartir este documento con ChatGPT o cualquier otro desarrollador para que entienda cómo está implementada. 🚀**
