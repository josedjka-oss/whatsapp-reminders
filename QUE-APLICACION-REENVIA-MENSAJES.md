# 📱 ¿Qué Aplicación Envía los Mensajes a tu Número Personal?

## 🎯 Respuesta Rápida

**Es el mismo backend que ya tienes funcionando en Render.**

**No es una aplicación separada.** Es parte del mismo sistema que envía los recordatorios.

---

## 🔄 Flujo Completo

### 1. Alguien Envía un Mensaje al Número Business

```
Usuario → Envía mensaje → +573242145488 (número Business)
```

### 2. Twilio Recibe el Mensaje

```
Twilio → Recibe mensaje → Configura webhook → Envía notificación
```

### 3. Tu Backend Recibe el Webhook

**URL del webhook:** `https://whatsapp-reminders-mzex.onrender.com/webhooks/twilio/whatsapp`

**Archivo:** `src/routes/webhooks.ts`

**Código:**
```typescript
router.post("/twilio/whatsapp", async (req: Request, res: Response) => {
  // Recibe el mensaje de Twilio
  const from = req.body.From; // Número que envió el mensaje
  const body = req.body.Body;  // Texto del mensaje
  const mediaUrls = [...];     // URLs de imágenes si hay
  
  // Guarda en base de datos
  await prisma.message.create({...});
  
  // Reenvía a tu número personal
  await forwardToMyWhatsApp(from, body, mediaUrls);
});
```

### 4. El Backend Reenvía el Mensaje

**Función:** `forwardToMyWhatsApp()` en `src/services/twilio.ts`

**Código:**
```typescript
export const forwardToMyWhatsApp = async (
  from: string,
  body: string,
  mediaUrls: string[] = []
): Promise<void> => {
  // Obtiene tu número personal desde MY_WHATSAPP_NUMBER
  const myWhatsAppNumber = credentials.myWhatsAppNumber;
  
  // Usa Twilio API para enviar el mensaje
  await sendWhatsAppMessage({
    to: myWhatsAppNumber,  // Tu número personal
    reminderText: `📩 Respuesta de ${from}:\n\n${body}`
  });
};
```

### 5. Twilio Envía el Mensaje a tu Número Personal

```
Backend → Twilio API → Envía mensaje → Tu número personal
```

---

## 🏗️ Arquitectura

### Backend en Render

**URL:** `https://whatsapp-reminders-mzex.onrender.com`

**Componentes:**
1. **Webhook endpoint** (`/webhooks/twilio/whatsapp`)
   - Recibe mensajes entrantes de Twilio
   - Guarda en base de datos
   - Llama a `forwardToMyWhatsApp()`

2. **Función de reenvío** (`forwardToMyWhatsApp()`)
   - Usa Twilio API
   - Envía mensaje a tu número personal
   - Usa el mismo sistema que los recordatorios

3. **Scheduler** (envía recordatorios)
   - Usa `sendWhatsAppMessage()`
   - Envía recordatorios programados

---

## 📊 Diagrama de Flujo

```
┌─────────────────┐
│  Usuario envía  │
│  mensaje a      │
│  +573242145488  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Twilio recibe  │
│  el mensaje     │
└────────┬────────┘
         │
         │ Webhook POST
         ▼
┌─────────────────────────────────────┐
│  Backend en Render                 │
│  /webhooks/twilio/whatsapp         │
│                                    │
│  1. Recibe webhook                 │
│  2. Guarda en base de datos        │
│  3. Llama forwardToMyWhatsApp()    │
└────────┬───────────────────────────┘
         │
         │ forwardToMyWhatsApp()
         ▼
┌─────────────────────────────────────┐
│  Twilio API                        │
│  sendWhatsAppMessage()             │
│                                    │
│  From: +573242145488 (Business)    │
│  To: +57XXXXXXXXXX (Tu personal)   │
└────────┬───────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Recibes el     │
│  mensaje en tu  │
│  WhatsApp       │
│  personal       │
└─────────────────┘
```

---

## 🔍 Detalles Técnicos

### ¿Qué Aplicación?

**No es una aplicación separada.** Es el mismo backend que:
- ✅ Envía recordatorios programados
- ✅ Procesa mensajes de la IA
- ✅ Maneja webhooks de Twilio
- ✅ Reenvía mensajes entrantes

### ¿Dónde Está el Código?

**Archivos relevantes:**
1. `src/routes/webhooks.ts` - Recibe webhooks de Twilio
2. `src/services/twilio.ts` - Función `forwardToMyWhatsApp()`
3. `src/services/twilio.ts` - Función `sendWhatsAppMessage()`

### ¿Qué Usa para Enviar?

**Twilio API** (la misma que usa para enviar recordatorios)

**Código:**
```typescript
// Usa la misma función que los recordatorios
await sendWhatsAppMessage({
  to: myWhatsAppNumber,  // Tu número personal
  reminderText: forwardedBody
});
```

**Diferencia:**
- Recordatorios: `to` = número del destinatario del recordatorio
- Reenvío: `to` = tu número personal (`MY_WHATSAPP_NUMBER`)

---

## ✅ Resumen

### ¿Qué aplicación envía los mensajes?

**El mismo backend en Render que ya tienes funcionando.**

### ¿Cómo funciona?

1. Alguien envía mensaje → Número Business
2. Twilio → Webhook → Tu backend
3. Backend → `forwardToMyWhatsApp()` → Twilio API
4. Twilio API → Envía mensaje → Tu número personal

### ¿Es una aplicación separada?

**No.** Es parte del mismo sistema:
- Mismo backend
- Misma base de datos
- Misma API de Twilio
- Mismo código

### ¿Qué cambia?

**Solo el destinatario:**
- Recordatorios: `to` = número del cliente
- Reenvío: `to` = tu número personal

---

## 🎯 Conclusión

**No hay una aplicación separada.** El reenvío de mensajes es una funcionalidad integrada en tu backend existente.

**El mismo backend que:**
- ✅ Envía recordatorios programados
- ✅ Procesa mensajes de la IA
- ✅ Maneja webhooks de Twilio
- ✅ **Reenvía mensajes entrantes a tu número personal**

**Todo funciona automáticamente cuando:**
- ✅ `MY_WHATSAPP_NUMBER` está configurado
- ✅ El webhook está configurado en Twilio
- ✅ El backend está funcionando en Render

---

## 📋 Checklist

- [ ] Backend funcionando en Render
- [ ] Webhook configurado en Twilio
- [ ] `MY_WHATSAPP_NUMBER` configurado
- [ ] Mensajes entrantes se reenvían automáticamente

---

**Todo está integrado en el mismo sistema. No necesitas configurar nada adicional.**
