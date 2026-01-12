# 📤 Cómo Funciona el Envío de Mensajes

## 🎯 Resumen

La aplicación tiene **dos formas de enviar mensajes**:

1. **Recordatorios programados** → Se crean por API y se envían automáticamente según programación
2. **Reenvío de mensajes recibidos** → Cuando alguien envía un mensaje al número de Twilio, se reenvía automáticamente a tu WhatsApp personal

---

## 📝 1. Envío de Recordatorios Programados

### **Paso 1: Crear el Recordatorio (Ingresar el Texto)**

El texto del mensaje se ingresa mediante una **petición HTTP POST** a la API:

**Endpoint:** `POST /api/reminders`

**Ejemplo usando `curl`:**
```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573024002656",
    "body": "Este es el texto del mensaje que quieres enviar",
    "scheduleType": "once",
    "sendAt": "2026-01-12T10:00:00Z",
    "timezone": "America/Bogota"
  }'
```

**Ejemplo usando JavaScript (fetch):**
```javascript
const response = await fetch('https://whatsapp-reminders-mzex.onrender.com/api/reminders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'whatsapp:+573024002656',
    body: 'Este es el texto del mensaje que quieres enviar',
    scheduleType: 'once',
    sendAt: '2026-01-12T10:00:00Z',
    timezone: 'America/Bogota'
  })
});

const reminder = await response.json();
console.log('Recordatorio creado:', reminder);
```

### **Paso 2: El Texto se Guarda en la Base de Datos**

**Archivo:** `src/routes/reminders.ts`

```typescript
router.post("/", async (req: Request, res: Response) => {
  const { to, body, scheduleType, sendAt, hour, minute, dayOfMonth, timezone } = req.body;
  
  // Validaciones...
  
  // Se guarda en la base de datos
  const reminder = await prisma.reminder.create({
    data: {
      to,           // Número destino
      body,         // ← AQUÍ SE GUARDA EL TEXTO DEL MENSAJE
      scheduleType, // "once", "daily", "monthly"
      sendAt,       // Fecha/hora para "once"
      hour,         // Hora para "daily"/"monthly"
      minute,       // Minuto para "daily"/"monthly"
      dayOfMonth,   // Día del mes para "monthly"
      timezone,
      isActive: true,
    },
  });
  
  return res.status(201).json(reminder);
});
```

**El campo `body` contiene el texto del mensaje que se enviará.**

### **Paso 3: El Scheduler Verifica Cada Minuto**

**Archivo:** `src/services/scheduler.ts`

El scheduler se ejecuta **cada minuto** y verifica si algún recordatorio debe enviarse:

```typescript
cron.schedule("* * * * *", async () => {
  // 1. Obtener todos los recordatorios activos
  const reminders = await prisma.reminder.findMany({
    where: { isActive: true }
  });
  
  // 2. Para cada recordatorio, verificar si debe enviarse
  for (const reminder of reminders) {
    const shouldSend = await shouldSendReminder(reminder);
    
    if (shouldSend) {
      // 3. Enviar el mensaje
      await sendWhatsAppMessage({
        to: reminder.to,
        body: reminder.body,  // ← AQUÍ SE USA EL TEXTO GUARDADO
      });
      
      // 4. Actualizar lastRunAt para evitar duplicados
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { lastRunAt: new Date() }
      });
    }
  }
}, { timezone: "America/Bogota" });
```

### **Paso 4: Envío del Mensaje por Twilio**

**Archivo:** `src/services/twilio.ts`

La función `sendWhatsAppMessage()` es la que realmente envía el mensaje:

```typescript
export const sendWhatsAppMessage = async ({
  to,      // Número destino (ej: "whatsapp:+573024002656")
  body,    // ← AQUÍ ESTÁ EL TEXTO DEL MENSAJE
}: SendMessageParams): Promise<string> => {
  // 1. Obtener credenciales de Twilio
  const credentials = getTwilioCredentials();
  const client = getTwilioClient();
  
  // 2. Enviar mensaje usando Twilio SDK
  const message = await client.messages.create({
    from: credentials.fromNumber,  // "whatsapp:+14155238886"
    to: to,                       // "whatsapp:+573024002656"
    body: body,                   // ← EL TEXTO SE ENVÍA AQUÍ
  });
  
  // 3. Guardar en base de datos como mensaje enviado
  await prisma.message.create({
    data: {
      direction: "outbound",
      from: credentials.fromNumber,
      to: to,
      body: body,  // ← Se guarda también en la tabla Message
      twilioSid: message.sid,
    },
  });
  
  return message.sid;
};
```

---

## 🔄 2. Reenvío de Mensajes Recibidos

### **Paso 1: Alguien Envía un Mensaje a Twilio**

Cuando alguien envía un mensaje de WhatsApp al número de Twilio (`+1 415 523 8886`), Twilio recibe el mensaje.

### **Paso 2: Twilio Envía Webhook a la Aplicación**

Twilio envía un webhook `POST` a:
```
POST /webhooks/twilio/whatsapp
```

**Archivo:** `src/routes/webhooks.ts`

```typescript
router.post("/twilio/whatsapp", async (req: Request, res: Response) => {
  // 1. Extraer datos del mensaje recibido
  const from = req.body.From;      // "whatsapp:+573024002656"
  const body = req.body.Body;      // ← AQUÍ ESTÁ EL TEXTO RECIBIDO
  const to = req.body.To;           // "whatsapp:+14155238886"
  
  // 2. Guardar en base de datos
  await prisma.message.create({
    data: {
      direction: "inbound",
      from: from,
      to: to,
      body: body,  // ← Se guarda el texto recibido
    },
  });
  
  // 3. Reenviar a tu WhatsApp personal
  await forwardToMyWhatsApp(from, body);  // ← Se reenvía el texto
  
  return res.status(200).type("text/xml").send("<Response></Response>");
});
```

### **Paso 3: Reenvío del Mensaje**

**Archivo:** `src/services/twilio.ts`

```typescript
export const forwardToMyWhatsApp = async (
  from: string,    // "whatsapp:+573024002656"
  body: string     // ← AQUÍ ESTÁ EL TEXTO RECIBIDO
): Promise<void> => {
  const credentials = getTwilioCredentials();
  const myWhatsAppNumber = credentials.myWhatsAppNumber;  // "whatsapp:+573024002656"
  
  // Formatear el mensaje reenviado
  const forwardedBody = `📩 Respuesta de ${from}:\n\n${body}`;
  // Ejemplo: "📩 Respuesta de whatsapp:+573024002656:\n\nHola, este es el mensaje recibido"
  
  // Enviar usando la misma función de envío
  await sendWhatsAppMessage({
    to: myWhatsAppNumber,
    body: forwardedBody,  // ← Se envía el texto formateado
  });
};
```

---

## 📊 Flujo Completo Visual

### **Para Recordatorios:**

```
1. Usuario → POST /api/reminders
   {
     "body": "Texto del mensaje",  ← INGRESO DEL TEXTO
     "to": "whatsapp:+57...",
     "scheduleType": "once",
     ...
   }
   
2. API → Base de Datos
   Reminder {
     body: "Texto del mensaje",  ← SE GUARDA
     ...
   }
   
3. Scheduler (cada minuto) → Verifica recordatorios
   ¿Debe enviarse? → SÍ
   
4. Scheduler → sendWhatsAppMessage()
   {
     to: "whatsapp:+57...",
     body: "Texto del mensaje"  ← SE USA EL TEXTO GUARDADO
   }
   
5. Twilio SDK → client.messages.create()
   {
     from: "whatsapp:+14155238886",
     to: "whatsapp:+57...",
     body: "Texto del mensaje"  ← SE ENVÍA A TWILIO
   }
   
6. Twilio → WhatsApp → Usuario recibe mensaje
```

### **Para Reenvío de Mensajes Recibidos:**

```
1. Alguien → WhatsApp → Twilio
   Mensaje: "Hola, este es el mensaje"
   
2. Twilio → Webhook POST /webhooks/twilio/whatsapp
   {
     From: "whatsapp:+573024002656",
     Body: "Hola, este es el mensaje",  ← TEXTO RECIBIDO
     To: "whatsapp:+14155238886"
   }
   
3. Webhook → Base de Datos
   Message {
     direction: "inbound",
     body: "Hola, este es el mensaje"  ← SE GUARDA
   }
   
4. Webhook → forwardToMyWhatsApp()
   {
     from: "whatsapp:+573024002656",
     body: "Hola, este es el mensaje"  ← SE USA EL TEXTO RECIBIDO
   }
   
5. forwardToMyWhatsApp → Formatea mensaje
   forwardedBody = "📩 Respuesta de whatsapp:+573024002656:\n\nHola, este es el mensaje"
   
6. forwardToMyWhatsApp → sendWhatsAppMessage()
   {
     to: "whatsapp:+573024002656",
     body: "📩 Respuesta de whatsapp:+573024002656:\n\nHola, este es el mensaje"
   }
   
7. Twilio → WhatsApp → Tu número personal recibe el mensaje reenviado
```

---

## 🔑 Puntos Clave

### **1. Dónde se Ingresa el Texto:**

- **Recordatorios:** En el campo `body` del JSON al crear el recordatorio (`POST /api/reminders`)
- **Mensajes recibidos:** En el campo `Body` del webhook de Twilio

### **2. Dónde se Almacena el Texto:**

- **Recordatorios:** En la tabla `Reminder`, campo `body`
- **Mensajes:** En la tabla `Message`, campo `body`

### **3. Cómo se Envía el Texto:**

- **Función principal:** `sendWhatsAppMessage({ to, body })`
- **SDK usado:** `twilio` → `client.messages.create({ from, to, body })`
- **El campo `body` es el texto que se envía**

### **4. Formato del Texto:**

- **Texto plano:** Se envía tal cual
- **Reenvíos:** Se formatea con prefijo `📩 Respuesta de {from}:\n\n{body}`
- **Sin límite de caracteres** (Twilio maneja automáticamente mensajes largos)

---

## 💡 Ejemplos Prácticos

### **Ejemplo 1: Crear Recordatorio con Texto Simple**

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573024002656",
    "body": "Recordatorio: Reunión a las 3pm",
    "scheduleType": "once",
    "sendAt": "2026-01-12T15:00:00Z"
  }'
```

**Resultado:** El texto `"Recordatorio: Reunión a las 3pm"` se guarda y se enviará a las 3pm.

### **Ejemplo 2: Crear Recordatorio con Texto Largo**

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573024002656",
    "body": "Este es un mensaje largo que puede contener múltiples líneas.\n\nSegunda línea del mensaje.\n\nTercera línea con más información importante.",
    "scheduleType": "daily",
    "hour": 9,
    "minute": 0
  }'
```

**Resultado:** El texto completo (con saltos de línea `\n`) se guarda y se enviará todos los días a las 9:00 AM.

### **Ejemplo 3: Mensaje Recibido y Reenviado**

**Alguien envía:** `"Hola, ¿cómo estás?"`

**Se reenvía como:**
```
📩 Respuesta de whatsapp:+573024002656:

Hola, ¿cómo estás?
```

---

## 🔧 Código Clave Resumido

### **Función Principal de Envío:**

```typescript
// src/services/twilio.ts
export const sendWhatsAppMessage = async ({ to, body }: SendMessageParams) => {
  const client = getTwilioClient();
  
  // AQUÍ SE ENVÍA EL TEXTO
  const message = await client.messages.create({
    from: "whatsapp:+14155238886",
    to: to,
    body: body,  // ← EL TEXTO VA AQUÍ
  });
  
  return message.sid;
};
```

### **Uso en el Scheduler:**

```typescript
// src/services/scheduler.ts
await sendWhatsAppMessage({
  to: reminder.to,
  body: reminder.body,  // ← TEXTO GUARDADO EN LA BD
});
```

### **Uso en el Webhook:**

```typescript
// src/routes/webhooks.ts
await forwardToMyWhatsApp(
  req.body.From,    // Remitente
  req.body.Body     // ← TEXTO RECIBIDO DE TWILIO
);
```

---

## 📝 Resumen

1. **Ingreso del texto:**
   - Recordatorios: Campo `body` en `POST /api/reminders`
   - Mensajes recibidos: Campo `Body` en webhook de Twilio

2. **Almacenamiento:**
   - Recordatorios: Tabla `Reminder`, campo `body`
   - Mensajes: Tabla `Message`, campo `body`

3. **Envío:**
   - Función: `sendWhatsAppMessage({ to, body })`
   - SDK: `twilio.client.messages.create({ from, to, body })`
   - El campo `body` contiene el texto que se envía

4. **Proceso automático:**
   - Scheduler verifica cada minuto
   - Si debe enviarse, llama a `sendWhatsAppMessage()` con el texto guardado
   - Twilio envía el mensaje a WhatsApp

---

**¿Tienes alguna pregunta específica sobre cómo funciona el envío de mensajes? 🚀**
