# 📋 Prompt Detallado: Implementación de la Aplicación WhatsApp Reminders

## 🎯 Descripción General

Aplicación personal de recordatorios por WhatsApp usando Twilio, construida con Node.js, TypeScript, Express, Prisma y SQLite. Permite crear recordatorios programados (una vez, diario, mensual) que se envían automáticamente a cualquier número de WhatsApp, y recibe respuestas que se reenvían automáticamente al WhatsApp personal del usuario.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- **Node.js 20** - Runtime de JavaScript
- **TypeScript 5.5.4** - Lenguaje de programación tipado
- **Express 4.18.2** - Framework web para Node.js
- **Prisma 5.11.0** - ORM para base de datos
- **SQLite** - Base de datos relacional (archivo local)
- **node-cron 3.0.3** - Scheduler para tareas programadas
- **Twilio SDK 4.23.0** - SDK para WhatsApp API
- **date-fns-tz 3.1.0** - Manejo de fechas y zonas horarias
- **dotenv 16.4.5** - Gestión de variables de entorno

**Herramientas de Desarrollo:**
- **ts-node-dev 2.0.0** - Desarrollo con hot-reload
- **ngrok** - Túnel público para desarrollo local

---

## 📁 Estructura del Proyecto

```
whatsapp-reminders/
├── src/
│   ├── server.ts              # Servidor Express principal
│   ├── routes/
│   │   ├── reminders.ts      # CRUD de recordatorios
│   │   ├── webhooks.ts        # Webhook de Twilio
│   │   └── messages.ts        # Listar mensajes
│   ├── services/
│   │   ├── twilio.ts          # Servicio Twilio (enviar/reenviar)
│   │   └── scheduler.ts       # Lógica de scheduling con cron
│   └── utils/
│       └── validation.ts      # Validación de firma Twilio
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── migrations/            # Migraciones de Prisma
├── .env                       # Variables de entorno (gitignored)
├── .env.example               # Plantilla de variables de entorno
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración TypeScript
├── .gitignore                 # Archivos ignorados por Git
└── README.md                  # Documentación principal
```

---

## 🗄️ Modelo de Datos (Prisma Schema)

### Modelo: Reminder

```prisma
model Reminder {
  id          String    @id @default(uuid())
  to          String    // Número destino en formato whatsapp:+...
  body        String    // Mensaje del recordatorio
  scheduleType String   // once, daily, monthly
  sendAt      DateTime? // Para scheduleType "once"
  hour        Int?      // Hora del día (0-23)
  minute      Int?      // Minuto (0-59)
  dayOfMonth  Int?      // Día del mes (1-31) para monthly
  timezone    String    @default("America/Bogota")
  isActive    Boolean   @default(true)
  lastRunAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([isActive, scheduleType])
  @@index([lastRunAt])
}
```

**Campos:**
- `id`: UUID único del recordatorio
- `to`: Número destino en formato `whatsapp:+57XXXXXXXXXX`
- `body`: Contenido del mensaje
- `scheduleType`: Tipo de programación (`once`, `daily`, `monthly`)
- `sendAt`: Fecha/hora exacta para recordatorios `once`
- `hour`/`minute`: Hora del día para `daily` y `monthly`
- `dayOfMonth`: Día del mes para `monthly` (1-31)
- `timezone`: Zona horaria (default: `America/Bogota`)
- `isActive`: Si está activo o desactivado
- `lastRunAt`: Última vez que se envió (para evitar duplicados)
- `createdAt`/`updatedAt`: Timestamps automáticos

**Índices:**
- Índice compuesto en `[isActive, scheduleType]` para búsquedas eficientes
- Índice en `lastRunAt` para verificar duplicados

### Modelo: Message

```prisma
model Message {
  id        String   @id @default(uuid())
  direction String   // inbound, outbound
  from      String   // Número remitente
  to        String   // Número destino
  body      String   // Contenido del mensaje
  twilioSid String?  // Message SID de Twilio
  createdAt DateTime @default(now())

  @@index([direction])
  @@index([from])
  @@index([to])
  @@index([createdAt])
}
```

**Campos:**
- `id`: UUID único del mensaje
- `direction`: Dirección (`inbound` = recibido, `outbound` = enviado)
- `from`/`to`: Números de teléfono
- `body`: Contenido del mensaje
- `twilioSid`: ID del mensaje en Twilio (para tracking)
- `createdAt`: Timestamp de creación

**Índices:**
- Índices en `direction`, `from`, `to`, `createdAt` para búsquedas rápidas

---

## 🔧 Componentes Principales

### 1. Servidor Principal (`src/server.ts`)

**Responsabilidades:**
- Inicializar Express
- Configurar middlewares (CORS, JSON parser, URL-encoded)
- Registrar rutas
- Inicializar base de datos Prisma
- Iniciar scheduler
- Manejar graceful shutdown

**Endpoints:**
- `GET /` - Información de la API
- `GET /health` - Health check

**Inicialización:**
```typescript
- Carga variables de entorno con dotenv
- Conecta a base de datos SQLite
- Inicia scheduler (node-cron)
- Escucha en puerto 3000 (o PORT de .env)
```

### 2. Rutas de Recordatorios (`src/routes/reminders.ts`)

**Endpoints:**

**POST /api/reminders** - Crear recordatorio
- Valida campos requeridos según `scheduleType`
- Crea recordatorio en base de datos
- Retorna el recordatorio creado

**GET /api/reminders** - Listar recordatorios
- Filtros opcionales: `isActive`, `scheduleType`
- Ordenados por `createdAt` descendente

**PATCH /api/reminders/:id** - Actualizar recordatorio
- Permite actualizar cualquier campo
- Útil para activar/desactivar o cambiar programación

**DELETE /api/reminders/:id** - Eliminar recordatorio
- Elimina permanentemente de la base de datos

**Validaciones:**
- `scheduleType` debe ser: `once`, `daily`, o `monthly`
- `once` requiere `sendAt`
- `daily` requiere `hour` y `minute`
- `monthly` requiere `dayOfMonth`, `hour` y `minute`

### 3. Rutas de Mensajes (`src/routes/messages.ts`)

**Endpoints:**

**GET /api/messages** - Listar mensajes
- Filtros opcionales: `from`, `to`, `direction`
- Límite por defecto: 50 mensajes
- Ordenados por `createdAt` descendente

### 4. Webhook de Twilio (`src/routes/webhooks.ts`)

**Endpoint:**

**POST /webhooks/twilio/whatsapp** - Recibir mensajes entrantes

**Flujo:**
1. Recibe request de Twilio (form-urlencoded)
2. Valida firma de Twilio (`X-Twilio-Signature`)
3. Extrae datos del mensaje (`From`, `To`, `Body`, `MessageSid`)
4. Guarda mensaje en base de datos como `inbound`
5. Reenvía mensaje a WhatsApp personal del usuario
6. Responde a Twilio con TwiML (200 OK)

**Validación de Firma:**
- Usa `twilio.validateRequest()` con `TWILIO_AUTH_TOKEN`
- Construye URL completa para validación
- Si falla, registra warning pero continúa (para debug)

**Reenvío:**
- Formato: `📩 Respuesta de {from}:\n\n{body}`
- Envía a `MY_WHATSAPP_NUMBER` configurado en `.env`

### 5. Servicio Twilio (`src/services/twilio.ts`)

**Funciones:**

**sendWhatsAppMessage({ to, body })**
- Envía mensaje usando Twilio SDK
- Guarda mensaje en DB como `outbound`
- Retorna Message SID de Twilio
- Maneja errores y los propaga

**forwardToMyWhatsApp(from, body)**
- Formatea mensaje con prefijo `📩 Respuesta de {from}:`
- Llama a `sendWhatsAppMessage` con `MY_WHATSAPP_NUMBER`
- Si `MY_WHATSAPP_NUMBER` no está configurado, solo registra warning

**Configuración:**
- Usa `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` de `.env`
- Usa `TWILIO_WHATSAPP_FROM` como número remitente (Sandbox: `whatsapp:+14155238886`)

### 6. Scheduler (`src/services/scheduler.ts`)

**Funcionalidad:**
- Ejecuta cada minuto usando `node-cron` (cron: `* * * * *`)
- Verifica todos los recordatorios activos (`isActive: true`)
- Calcula si "toca enviar" según `scheduleType` y `timezone`
- Evita duplicados usando `lastRunAt` + ventana de 60 segundos
- Reintenta 3 veces con backoff exponencial si falla

**Lógica de "Toca Enviar":**

**Once:**
- Verifica si `sendAt` ya pasó
- Verifica si estamos dentro de 60 segundos de `sendAt`
- Si se envía, desactiva automáticamente (`isActive: false`)

**Daily:**
- Compara hora y minuto actuales con `hour` y `minute` del recordatorio
- Usa zona horaria del recordatorio para calcular hora local

**Monthly:**
- Compara día del mes, hora y minuto actuales
- Usa zona horaria del recordatorio

**Prevención de Duplicados:**
- Si `lastRunAt` existe y está dentro de 60 segundos, no envía
- Actualiza `lastRunAt` después de enviar exitosamente

**Reintentos:**
- Si falla el envío, reintenta hasta 3 veces
- Backoff exponencial: 2s, 4s, 8s entre intentos
- Si falla después de 3 intentos, registra error pero no bloquea

### 7. Validación de Firma (`src/utils/validation.ts`)

**validateTwilioSignature(req, url)**
- Extrae `X-Twilio-Signature` header
- Usa `TWILIO_AUTH_TOKEN` para validar
- Llama a `twilio.validateRequest()` con URL completa y parámetros
- Retorna `true` si válida, `false` si no

**Nota:** Actualmente la validación no bloquea el webhook si falla (para facilitar debug), pero registra warnings.

---

## 🔄 Flujos de Datos

### Flujo 1: Crear y Enviar Recordatorio

```
1. Usuario crea recordatorio vía API
   POST /api/reminders
   ↓
2. Se guarda en base de datos (Reminder)
   ↓
3. Scheduler verifica cada minuto
   ↓
4. Cuando coincide hora/fecha programada:
   - Llama a sendWhatsAppMessage()
   - Twilio envía mensaje a destinatario
   - Se guarda mensaje en DB (Message, direction: outbound)
   - Se actualiza lastRunAt del Reminder
   - Si es "once", se desactiva (isActive: false)
```

### Flujo 2: Recibir y Reenviar Mensaje

```
1. Alguien envía mensaje al +1 415 523 8886 (Twilio)
   ↓
2. Twilio envía webhook a tu servidor
   POST https://ngrok-url.ngrok-free.dev/webhooks/twilio/whatsapp
   ↓
3. Servidor valida firma de Twilio
   ↓
4. Extrae datos del mensaje (From, To, Body)
   ↓
5. Guarda en base de datos (Message, direction: inbound)
   ↓
6. Llama a forwardToMyWhatsApp()
   ↓
7. Envía mensaje formateado a MY_WHATSAPP_NUMBER
   ↓
8. Usuario recibe reenvío en su WhatsApp personal
```

### Flujo 3: Scheduler (Cada Minuto)

```
1. Cron ejecuta cada minuto (* * * * *)
   ↓
2. Obtiene todos los recordatorios activos
   ↓
3. Para cada recordatorio:
   - Calcula si "toca enviar" según scheduleType
   - Verifica que no se haya enviado en últimos 60s
   ↓
4. Si toca enviar:
   - Intenta enviar (con reintentos)
   - Actualiza lastRunAt
   - Si es "once", desactiva
```

---

## 🔐 Variables de Entorno

### Configuración Requerida (`.env`)

```env
# Servidor
PORT=3000
APP_TIMEZONE=America/Bogota

# Base de Datos
DATABASE_URL="file:./prisma/dev.db"

# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# WhatsApp Personal
MY_WHATSAPP_NUMBER=whatsapp:+57XXXXXXXXXX

# Webhook
PUBLIC_BASE_URL=https://tu-ngrok-url.ngrok-free.dev
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

**Descripción:**
- `PORT`: Puerto del servidor (default: 3000)
- `APP_TIMEZONE`: Zona horaria por defecto
- `DATABASE_URL`: Ruta del archivo SQLite
- `TWILIO_ACCOUNT_SID`: Account SID de Twilio
- `TWILIO_AUTH_TOKEN`: Auth Token de Twilio
- `TWILIO_WHATSAPP_FROM`: Número de Twilio (Sandbox o producción)
- `MY_WHATSAPP_NUMBER`: Tu número personal (recibe reenvíos)
- `PUBLIC_BASE_URL`: URL pública (ngrok en desarrollo)
- `TWILIO_WEBHOOK_PATH`: Ruta del webhook

---

## 🚀 Scripts Disponibles

### package.json Scripts

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio"
}
```

**Uso:**
- `npm run dev`: Desarrollo con hot-reload
- `npm run build`: Compilar TypeScript a JavaScript
- `npm start`: Ejecutar versión compilada
- `npm run db:generate`: Generar cliente Prisma
- `npm run db:migrate`: Ejecutar migraciones
- `npm run db:studio`: Abrir interfaz visual de Prisma

---

## 🔌 API Endpoints Detallados

### POST /api/reminders

**Crear recordatorio**

**Request Body:**
```json
{
  "to": "whatsapp:+573001234567",
  "body": "Mensaje del recordatorio",
  "scheduleType": "once" | "daily" | "monthly",
  "sendAt": "2025-01-11T14:00:00",  // Solo para "once"
  "hour": 9,                         // Para "daily" y "monthly"
  "minute": 0,                        // Para "daily" y "monthly"
  "dayOfMonth": 5,                    // Solo para "monthly"
  "timezone": "America/Bogota"        // Opcional, default: America/Bogota
}
```

**Response:**
```json
{
  "id": "uuid",
  "to": "whatsapp:+573001234567",
  "body": "Mensaje del recordatorio",
  "scheduleType": "once",
  "sendAt": "2025-01-11T14:00:00.000Z",
  "isActive": true,
  "createdAt": "2025-01-10T17:30:00.000Z",
  ...
}
```

### GET /api/reminders

**Listar recordatorios**

**Query Parameters:**
- `isActive`: `true` | `false` (filtrar por estado)
- `scheduleType`: `once` | `daily` | `monthly` (filtrar por tipo)

**Response:**
```json
[
  {
    "id": "uuid",
    "to": "whatsapp:+573001234567",
    "body": "Mensaje",
    "scheduleType": "daily",
    "hour": 9,
    "minute": 0,
    "isActive": true,
    ...
  }
]
```

### PATCH /api/reminders/:id

**Actualizar recordatorio**

**Request Body:** (cualquier campo actualizable)
```json
{
  "isActive": false,
  "body": "Nuevo mensaje",
  "hour": 10,
  "minute": 30
}
```

**Response:** Recordatorio actualizado

### DELETE /api/reminders/:id

**Eliminar recordatorio**

**Response:** 204 No Content

### GET /api/messages

**Listar mensajes**

**Query Parameters:**
- `from`: Filtrar por remitente
- `to`: Filtrar por destino
- `direction`: `inbound` | `outbound`
- `limit`: Número máximo de resultados (default: 50)

**Response:**
```json
{
  "count": 10,
  "messages": [
    {
      "id": "uuid",
      "direction": "inbound",
      "from": "whatsapp:+573001234567",
      "to": "whatsapp:+14155238886",
      "body": "Mensaje recibido",
      "createdAt": "2025-01-10T17:30:00.000Z"
    }
  ]
}
```

### POST /webhooks/twilio/whatsapp

**Webhook de Twilio (interno)**

**Request:** Form-urlencoded de Twilio
- `From`: Número remitente
- `To`: Número destino
- `Body`: Contenido del mensaje
- `MessageSid`: ID del mensaje en Twilio

**Headers:**
- `X-Twilio-Signature`: Firma para validación

**Response:** TwiML XML
```xml
<Response></Response>
```

---

## ⚙️ Configuración de Twilio

### WhatsApp Sandbox

**Número de Twilio:** `+1 415 523 8886` (fijo para Sandbox)

**Configuración:**
1. Unir WhatsApp personal al Sandbox enviando `join [código]` al `+1 415 523 8886`
2. Configurar webhook en Twilio Console:
   - URL: `https://tu-ngrok-url.ngrok-free.dev/webhooks/twilio/whatsapp`
   - Método: POST

**Limitaciones del Sandbox:**
- Solo puedes enviar a números verificados (unidos al Sandbox)
- Gratis para desarrollo
- Para producción, necesitas número verificado de Twilio

### Producción

Para producción:
1. Solicitar número verificado de Twilio
2. Actualizar `TWILIO_WHATSAPP_FROM` con el nuevo número
3. Configurar webhook con URL de producción (sin ngrok)

---

## 🔄 Scheduler: Lógica Detallada

### Algoritmo de "Toca Enviar"

**Once:**
```typescript
1. Verificar que sendAt existe
2. Verificar que sendAt ya pasó (now >= sendAt)
3. Verificar que estamos dentro de 60 segundos de sendAt
4. Verificar que no se envió en últimos 60 segundos (lastRunAt)
```

**Daily:**
```typescript
1. Verificar que hour y minute existen
2. Obtener hora actual en timezone del recordatorio
3. Comparar: currentHour === hour && currentMinute === minute
4. Verificar que no se envió en últimos 60 segundos
```

**Monthly:**
```typescript
1. Verificar que dayOfMonth, hour y minute existen
2. Obtener fecha actual en timezone del recordatorio
3. Comparar:
   - currentDay === dayOfMonth
   - currentHour === hour
   - currentMinute === minute
4. Verificar que no se envió en últimos 60 segundos
```

### Prevención de Duplicados

**Estrategia:**
- Usa `lastRunAt` para rastrear última ejecución
- Si `lastRunAt` existe y está dentro de 60 segundos, no envía
- Actualiza `lastRunAt` inmediatamente después de enviar exitosamente
- Ventana de 60 segundos evita envíos duplicados si el scheduler se ejecuta múltiples veces

### Manejo de Errores

**Reintentos:**
- 3 intentos máximo
- Backoff exponencial: 2s, 4s, 8s
- Si falla después de 3 intentos, registra error pero no bloquea el scheduler

**Errores Comunes:**
- Twilio API error: Credenciales incorrectas, número inválido
- Base de datos error: Conexión perdida, constraint violation
- Timeout: Twilio no responde en tiempo razonable

---

## 🗄️ Base de Datos

### SQLite

**Ubicación:** `prisma/dev.db` (archivo local)

**Ventajas:**
- No requiere servidor de base de datos
- Archivo único, fácil de respaldar
- Rápido para desarrollo y uso personal

**Limitaciones:**
- No ideal para múltiples instancias simultáneas
- Para producción con alta concurrencia, considerar PostgreSQL

### Migraciones

**Prisma Migrate:**
- Migraciones en `prisma/migrations/`
- Ejecutar: `npm run db:migrate`
- Generar cliente: `npm run db:generate`

---

## 🔒 Seguridad

### Validación de Firma Twilio

**Implementación:**
- Valida `X-Twilio-Signature` header
- Usa `TWILIO_AUTH_TOKEN` para validar
- Construye URL completa para validación
- Actualmente no bloquea si falla (para debug), pero registra warnings

**Mejora Futura:**
- Bloquear requests sin firma válida en producción
- Agregar rate limiting
- Validar origen de IPs de Twilio

### Variables de Entorno

**Seguridad:**
- `.env` en `.gitignore` (no se sube a Git)
- Credenciales nunca en código
- `TWILIO_AUTH_TOKEN` especialmente sensible

---

## 🧪 Testing y Debugging

### Logs del Servidor

**Información registrada:**
- Inicio del servidor
- Conexión a base de datos
- Inicio del scheduler
- Cada verificación del scheduler
- Recordatorios enviados
- Webhooks recibidos
- Errores y warnings

### ngrok Inspector

**URL:** `http://127.0.0.1:4040`

**Información disponible:**
- Todos los requests que llegan a ngrok
- Headers y body de cada request
- Status codes y respuestas
- Útil para debuggear webhooks

### Prisma Studio

**Comando:** `npm run db:studio`

**Interfaz visual** para ver y editar datos en la base de datos.

---

## 🚀 Despliegue

### Desarrollo Local

**Requisitos:**
1. Servidor corriendo: `npm run dev`
2. ngrok corriendo: `npx ngrok http 3000`
3. Webhook configurado en Twilio Console

### Producción

**Opciones de Hosting:**

**Render.com:**
- Build: `npm install && npm run build && npm run db:generate && npm run db:migrate`
- Start: `npm start`
- Variables de entorno: Configurar en dashboard
- URL pública automática (no necesita ngrok)

**Railway.app:**
- Similar a Render
- Detección automática de Node.js
- Variables de entorno en dashboard

**VPS (DigitalOcean, Linode, etc.):**
- Instalar Node.js 20
- Clonar repositorio
- Configurar `.env`
- Usar PM2 para mantener proceso vivo
- Configurar nginx como reverse proxy (opcional)

**Consideraciones:**
- Cambiar `DATABASE_URL` a PostgreSQL en producción
- Actualizar `PUBLIC_BASE_URL` con URL de producción
- Configurar webhook en Twilio con URL de producción
- Usar número verificado de Twilio (no Sandbox)

---

## 📊 Flujo Completo de un Recordatorio

### Ejemplo: Recordatorio Diario a las 9 AM

```
1. Usuario crea recordatorio:
   POST /api/reminders
   {
     "to": "whatsapp:+573001234567",
     "body": "Buenos días",
     "scheduleType": "daily",
     "hour": 9,
     "minute": 0
   }
   ↓
2. Se guarda en DB:
   Reminder {
     id: "abc123",
     to: "whatsapp:+573001234567",
     scheduleType: "daily",
     hour: 9,
     minute: 0,
     isActive: true,
     lastRunAt: null
   }
   ↓
3. Scheduler ejecuta cada minuto:
   - Minuto 8:59 → No coincide (hora 8, minuto 59)
   - Minuto 9:00 → ¡Coincide! (hora 9, minuto 0)
   ↓
4. Verifica duplicados:
   - lastRunAt es null → OK, puede enviar
   ↓
5. Envía mensaje:
   - Llama a sendWhatsAppMessage()
   - Twilio envía a whatsapp:+573001234567
   - Guarda en DB (Message, direction: outbound)
   ↓
6. Actualiza recordatorio:
   - lastRunAt = now()
   - isActive sigue true (es daily, no se desactiva)
   ↓
7. Al día siguiente a las 9:00 AM:
   - Scheduler detecta coincidencia
   - Verifica: lastRunAt fue ayer → OK, puede enviar
   - Repite proceso
```

---

## 🔍 Casos Especiales

### Zona Horaria

**Manejo:**
- Cada recordatorio tiene su propia `timezone`
- El scheduler calcula hora local usando `date-fns-tz`
- Ejemplo: Recordatorio a las 9 AM en `America/Bogota` se envía a las 9 AM hora de Bogotá, sin importar dónde esté el servidor

### Recordatorios Mensuales y Días que No Existen

**Problema:** ¿Qué pasa si un recordatorio está programado para el día 31 y el mes solo tiene 30 días?

**Solución Actual:**
- Prisma permite `dayOfMonth` de 1-31
- Si el día no existe, el scheduler simplemente no encontrará coincidencia ese mes
- Se enviará el siguiente mes cuando el día exista

**Mejora Futura:**
- Validar `dayOfMonth` según el mes
- O usar "último día del mes" como opción

### Múltiples Recordatorios a la Misma Hora

**Comportamiento:**
- El scheduler procesa todos los recordatorios activos
- Si varios coinciden a la misma hora, todos se envían
- Cada uno tiene su propio `lastRunAt` para evitar duplicados

---

## 🐛 Manejo de Errores

### Errores de Twilio

**Causas comunes:**
- Credenciales incorrectas
- Número de destino inválido o no verificado (en Sandbox)
- Límite de rate de Twilio
- Número bloqueado o no disponible

**Manejo:**
- Se capturan y registran en logs
- Se propagan al scheduler
- Scheduler reintenta 3 veces
- Si falla, se registra error pero no bloquea otros recordatorios

### Errores de Base de Datos

**Causas comunes:**
- Archivo de base de datos bloqueado
- Constraint violation (datos inválidos)
- Conexión perdida

**Manejo:**
- Prisma maneja reconexión automática
- Errores se registran en logs
- Webhook responde 200 para no bloquear Twilio

### Errores de Validación

**Causas comunes:**
- Datos faltantes o inválidos en request
- Firma de Twilio inválida

**Manejo:**
- Validación en rutas antes de procesar
- Respuestas 400/403 apropiadas
- Logs detallados para debug

---

## 📈 Mejoras Futuras Posibles

### Funcionalidades

1. **Interfaz Web**: Frontend con Next.js para gestionar recordatorios
2. **Autenticación**: Sistema de usuarios para múltiples usuarios
3. **Plantillas**: Plantillas de mensajes reutilizables
4. **Estadísticas**: Dashboard con métricas de envíos
5. **Notificaciones**: Alertas cuando un recordatorio falla

### Técnicas

1. **PostgreSQL**: Migrar de SQLite a PostgreSQL para producción
2. **Queue System**: Usar Bull o similar para manejar envíos masivos
3. **Caching**: Redis para cachear recordatorios frecuentes
4. **Monitoring**: Integración con servicios de monitoreo
5. **Tests**: Suite de tests unitarios e integración

---

## 📚 Dependencias Principales

### Producción

```json
{
  "express": "^4.18.2",           // Servidor web
  "twilio": "^4.23.0",            // SDK de Twilio
  "@prisma/client": "^5.11.0",    // Cliente Prisma
  "node-cron": "^3.0.3",          // Scheduler
  "date-fns": "^3.6.0",           // Manejo de fechas
  "date-fns-tz": "^3.1.0",        // Zonas horarias
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.4.5"             // Variables de entorno
}
```

### Desarrollo

```json
{
  "typescript": "^5.5.4",         // Compilador TypeScript
  "ts-node-dev": "^2.0.0",        // Hot-reload
  "prisma": "^5.11.0",            // CLI de Prisma
  "@types/express": "^4.17.21",   // Tipos TypeScript
  "@types/node": "^20.14.12",     // Tipos Node.js
  "@types/node-cron": "^3.0.11"   // Tipos node-cron
}
```

---

## 🎯 Resumen de Arquitectura

### Patrón: API REST + Webhook + Scheduler

**Componentes:**
1. **API REST**: Endpoints para CRUD de recordatorios y mensajes
2. **Webhook Handler**: Recibe y procesa mensajes entrantes de Twilio
3. **Scheduler**: Ejecuta tareas programadas (cron job)
4. **Servicios**: Lógica de negocio separada (Twilio, scheduling)

**Flujo de Datos:**
- **Entrada**: API REST (crear recordatorios), Webhook (recibir mensajes)
- **Procesamiento**: Scheduler (verificar y enviar), Servicios (lógica de negocio)
- **Salida**: Twilio API (enviar mensajes), Base de datos (persistencia)

**Persistencia:**
- SQLite para desarrollo
- Prisma ORM para abstracción de base de datos
- Fácil migración a PostgreSQL para producción

---

## ✅ Estado Actual

**Funcionalidades Implementadas:**
- ✅ Crear recordatorios (once, daily, monthly)
- ✅ Envío automático según programación
- ✅ Recibir mensajes entrantes (webhook)
- ✅ Reenvío automático a WhatsApp personal
- ✅ Listar y gestionar recordatorios
- ✅ Listar mensajes enviados/recibidos
- ✅ Validación de firma Twilio
- ✅ Prevención de duplicados
- ✅ Reintentos automáticos
- ✅ Manejo de zonas horarias

**Configuración:**
- ✅ Variables de entorno
- ✅ Base de datos SQLite
- ✅ Scheduler activo
- ✅ Webhook configurado
- ✅ ngrok para desarrollo local

**Documentación:**
- ✅ README completo
- ✅ Guías paso a paso
- ✅ Ejemplos de uso
- ✅ Troubleshooting

---

**Este prompt contiene toda la información técnica sobre la implementación de la aplicación.**
