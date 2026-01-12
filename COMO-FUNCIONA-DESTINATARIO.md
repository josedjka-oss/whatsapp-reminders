# 📞 Cómo Funciona el Destinatario (Campo "to")

## 🎯 Resumen

El campo **`to`** (destinatario) especifica **a quién se envía el mensaje** de WhatsApp. Debe tener un formato específico para funcionar con Twilio.

---

## 📋 Formato del Destinatario

### **Formato Requerido:**

El destinatario **DEBE** tener el formato:
```
whatsapp:+[código de país][número]
```

### **Ejemplos:**

✅ **Correctos:**
- `whatsapp:+573024002656` (Colombia)
- `whatsapp:+14155551234` (Estados Unidos)
- `whatsapp:+34612345678` (España)
- `whatsapp:+521234567890` (México)

❌ **Incorrectos:**
- `573024002656` (falta prefijo `whatsapp:+`)
- `+573024002656` (falta prefijo `whatsapp:`)
- `whatsapp:573024002656` (falta el `+` después de `whatsapp:`)
- `573024002656` (falta todo el prefijo)

---

## 🔄 Dónde se Usa el Destinatario

### **1. Al Crear un Recordatorio**

**Endpoint:** `POST /api/reminders`

**Archivo:** `src/routes/reminders.ts`

```typescript
router.post("/", async (req: Request, res: Response) => {
  const { to, body, scheduleType, ... } = req.body;
  
  // Validación: "to" es requerido
  if (!to || !body || !scheduleType) {
    return res.status(400).json({
      error: "to, body y scheduleType son requeridos",
    });
  }
  
  // Se guarda en la base de datos
  const reminder = await prisma.reminder.create({
    data: {
      to,  // ← DESTINATARIO SE GUARDA AQUÍ
      body,
      scheduleType,
      // ...
    },
  });
});
```

**Ejemplo de petición:**
```json
{
  "to": "whatsapp:+573024002656",
  "body": "Mensaje de prueba",
  "scheduleType": "once",
  "sendAt": "2026-01-12T10:00:00Z"
}
```

### **2. Al Enviar el Mensaje**

**Archivo:** `src/services/twilio.ts`

```typescript
export const sendWhatsAppMessage = async ({
  to,      // ← DESTINATARIO (ej: "whatsapp:+573024002656")
  body,
}: SendMessageParams): Promise<string> => {
  const credentials = getTwilioCredentials();
  const client = getTwilioClient();
  
  // El destinatario se pasa directamente a Twilio
  const message = await client.messages.create({
    from: credentials.fromNumber,  // "whatsapp:+14155238886"
    to: to,                        // ← DESTINATARIO AQUÍ
    body: body,
  });
  
  // También se guarda en la base de datos
  await prisma.message.create({
    data: {
      direction: "outbound",
      from: credentials.fromNumber,
      to: to,  // ← DESTINATARIO SE GUARDA AQUÍ TAMBIÉN
      body: body,
    },
  });
  
  return message.sid;
};
```

### **3. En el Scheduler (Envío Automático)**

**Archivo:** `src/services/scheduler.ts`

```typescript
// El scheduler obtiene el destinatario del recordatorio guardado
for (const reminder of reminders) {
  if (shouldSend) {
    await sendWhatsAppMessage({
      to: reminder.to,  // ← DESTINATARIO DEL RECORDATORIO
      body: reminder.body,
    });
  }
}
```

---

## 📊 Flujo del Destinatario

### **Para Recordatorios:**

```
1. Usuario crea recordatorio
   POST /api/reminders
   {
     "to": "whatsapp:+573024002656"  ← SE INGRESA AQUÍ
   }
   
2. Se guarda en base de datos
   Reminder {
     to: "whatsapp:+573024002656"  ← SE GUARDA AQUÍ
     ...
   }
   
3. Scheduler verifica cada minuto
   ¿Debe enviarse? → SÍ
   
4. Scheduler llama a sendWhatsAppMessage()
   {
     to: reminder.to  ← SE USA EL DESTINATARIO GUARDADO
   }
   
5. Twilio SDK envía el mensaje
   client.messages.create({
     to: "whatsapp:+573024002656"  ← SE ENVÍA A ESTE NÚMERO
   })
   
6. WhatsApp entrega el mensaje al destinatario
```

---

## 🔍 Casos de Uso Específicos

### **1. Enviar a Tu Propio Número**

```json
{
  "to": "whatsapp:+573024002656",
  "body": "Recordatorio personal",
  "scheduleType": "daily",
  "hour": 9,
  "minute": 0
}
```

**Resultado:** Te envías un recordatorio a ti mismo todos los días a las 9:00 AM.

### **2. Enviar a un Familiar**

```json
{
  "to": "whatsapp:+573001234567",
  "body": "Recordatorio para mamá",
  "scheduleType": "monthly",
  "dayOfMonth": 15,
  "hour": 10,
  "minute": 0
}
```

**Resultado:** Se envía un mensaje mensual el día 15 a las 10:00 AM.

### **3. Enviar a Múltiples Destinatarios**

**Nota:** Actualmente, cada recordatorio tiene **un solo destinatario**. Para enviar a múltiples personas, debes crear **múltiples recordatorios**:

```bash
# Recordatorio 1
curl -X POST /api/reminders -d '{
  "to": "whatsapp:+573024002656",
  "body": "Mensaje 1",
  ...
}'

# Recordatorio 2
curl -X POST /api/reminders -d '{
  "to": "whatsapp:+573001234567",
  "body": "Mensaje 2",
  ...
}'
```

---

## 🔄 Reenvío de Mensajes Recibidos

### **Destinatario en Mensajes Recibidos:**

Cuando alguien envía un mensaje al número de Twilio, el **destinatario del reenvío** es siempre tu número personal (configurado en `MY_WHATSAPP_NUMBER`).

**Archivo:** `src/services/twilio.ts`

```typescript
export const forwardToMyWhatsApp = async (
  from: string,    // Quien envió el mensaje original
  body: string
): Promise<void> => {
  const credentials = getTwilioCredentials();
  const myWhatsAppNumber = credentials.myWhatsAppNumber;  // ← DESTINATARIO FIJO
  
  // Siempre se reenvía a tu número personal
  await sendWhatsAppMessage({
    to: myWhatsAppNumber,  // ← SIEMPRE ES TU NÚMERO
    body: forwardedBody,
  });
};
```

**Variable de entorno:**
```
MY_WHATSAPP_NUMBER=whatsapp:+573024002656
```

**Resultado:** Todos los mensajes recibidos se reenvían automáticamente a este número.

---

## 📝 Validación del Destinatario

### **Validaciones Actuales:**

1. **Campo requerido:** El campo `to` es obligatorio al crear un recordatorio
2. **Formato:** Debe tener el formato `whatsapp:+[número]` (validación implícita por Twilio)
3. **Twilio valida:** Si el formato es incorrecto, Twilio devolverá un error al intentar enviar

### **Ejemplo de Error si el Formato es Incorrecto:**

```json
{
  "code": 21211,
  "message": "The 'To' number whatsapp:573024002656 is not a valid phone number",
  "moreInfo": "https://www.twilio.com/docs/errors/21211"
}
```

**Solución:** Asegúrate de incluir el `+` después de `whatsapp:`:
- ❌ `whatsapp:573024002656`
- ✅ `whatsapp:+573024002656`

---

## 🔧 Código Clave

### **1. Guardar Destinatario en Recordatorio:**

```typescript
// src/routes/reminders.ts
const reminder = await prisma.reminder.create({
  data: {
    to: req.body.to,  // ← Se guarda tal cual se recibe
    // ...
  },
});
```

### **2. Usar Destinatario al Enviar:**

```typescript
// src/services/twilio.ts
const message = await client.messages.create({
  from: "whatsapp:+14155238886",
  to: to,  // ← Se usa directamente
  body: body,
});
```

### **3. Destinatario en Scheduler:**

```typescript
// src/services/scheduler.ts
await sendWhatsAppMessage({
  to: reminder.to,  // ← Se obtiene del recordatorio guardado
  body: reminder.body,
});
```

---

## 💡 Ejemplos Prácticos

### **Ejemplo 1: Recordatorio Diario a Ti Mismo**

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573024002656",
    "body": "Recordatorio diario",
    "scheduleType": "daily",
    "hour": 9,
    "minute": 0
  }'
```

**Destinatario:** `whatsapp:+573024002656` (tu número)

### **Ejemplo 2: Recordatorio Mensual a Otro Número**

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio mensual",
    "scheduleType": "monthly",
    "dayOfMonth": 1,
    "hour": 10,
    "minute": 0
  }'
```

**Destinatario:** `whatsapp:+573001234567` (otro número)

### **Ejemplo 3: Ver Destinatarios de Recordatorios Existentes**

```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/reminders
```

**Respuesta:**
```json
[
  {
    "id": "...",
    "to": "whatsapp:+573024002656",  ← DESTINATARIO
    "body": "Mensaje 1",
    "scheduleType": "daily",
    ...
  },
  {
    "id": "...",
    "to": "whatsapp:+573001234567",  ← OTRO DESTINATARIO
    "body": "Mensaje 2",
    "scheduleType": "monthly",
    ...
  }
]
```

---

## 📊 Resumen

### **Formato del Destinatario:**
- ✅ **Correcto:** `whatsapp:+573024002656`
- ❌ **Incorrecto:** `573024002656`, `+573024002656`, `whatsapp:573024002656`

### **Dónde se Usa:**
1. **Al crear recordatorio:** Campo `to` en `POST /api/reminders`
2. **Al guardar:** Se almacena en tabla `Reminder`, campo `to`
3. **Al enviar:** Se pasa a `sendWhatsAppMessage({ to, body })`
4. **En Twilio:** Se envía a `client.messages.create({ to })`

### **Destinatario Fijo para Reenvíos:**
- Todos los mensajes recibidos se reenvían a `MY_WHATSAPP_NUMBER`
- Configurado en variables de entorno de Render

### **Validación:**
- Campo `to` es obligatorio
- Twilio valida el formato al intentar enviar
- Error si el formato es incorrecto

---

**¿Tienes alguna pregunta específica sobre cómo funciona el destinatario? 🚀**
