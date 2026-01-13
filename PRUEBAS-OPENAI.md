# 🧪 Pruebas de Integración OpenAI

Pruebas rápidas usando `curl` para verificar que la integración OpenAI funciona correctamente.

---

## 📋 Prerrequisitos

1. Backend desplegado en Render (o corriendo localmente)
2. `OPENAI_API_KEY` configurada en Render
3. `ADMIN_PASSWORD` configurada (o usar "2023" por defecto)

---

## 🔧 Variables de Entorno

```bash
# En Render o .env local
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=2023
```

---

## 🧪 Prueba 1: Recordatorio único con fecha relativa

**Objetivo:** Crear un recordatorio para "mañana a las 5pm"

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Recuérdame pagar la luz mañana a las 5pm"
  }'
```

**Respuesta esperada:**
```json
{
  "reply": "Listo, he creado un recordatorio para pagar la luz mañana a las 17:00.",
  "actions": [
    {
      "type": "created",
      "summary": "Recordatorio creado: Enviaré \"Recuérdame pagar la luz\" a whatsapp:+57... el DD/MM/YYYY a las 17:00"
    }
  ]
}
```

**Verificaciones:**
- ✅ `scheduleType` debe ser `"once"`
- ✅ `sendAt` debe ser una fecha ISO válida (mañana a las 17:00 en timezone America/Bogota)
- ✅ `body` debe contener "Recuérdame pagar la luz"
- ✅ La fecha formateada en `summary` debe estar en timezone correcto

---

## 🧪 Prueba 2: Recordatorio diario

**Objetivo:** Crear un recordatorio diario a las 5pm

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Enviar mensaje a Juan todos los días a las 5 pm"
  }'
```

**Respuesta esperada:**
```json
{
  "reply": "Listo, he creado un recordatorio diario para enviar un mensaje a Juan todos los días a las 17:00.",
  "actions": [
    {
      "type": "created",
      "summary": "Recordatorio creado: Enviaré \"Enviar mensaje a Juan\" a whatsapp:+57... todos los días a las 17:00"
    }
  ]
}
```

**Verificaciones:**
- ✅ `scheduleType` debe ser `"daily"`
- ✅ `hour` debe ser `17`
- ✅ `minute` debe ser `0`
- ✅ `sendAt` debe ser `null`
- ✅ Si "Juan" no existe como contacto, debe preguntar por el número

---

## 🧪 Prueba 3: Listar recordatorios

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "¿Qué recordatorios tengo activos?"
  }'
```

**Respuesta esperada:**
```json
{
  "reply": "Tienes X recordatorio(s) activo(s): ...",
  "actions": [
    {
      "type": "listed",
      "summary": "Tienes X recordatorio(s) activo(s)"
    }
  ]
}
```

---

## 🧪 Prueba 4: Cancelar recordatorio

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Cancela el recordatorio de pagar la luz"
  }'
```

**Respuesta esperada:**
```json
{
  "reply": "He cancelado el recordatorio de pagar la luz.",
  "actions": [
    {
      "type": "canceled",
      "summary": "Recordatorio cancelado: \"Recuérdame pagar la luz\""
    }
  ]
}
```

**Si hay múltiples coincidencias:**
```json
{
  "reply": "Encontré 3 recordatorios que coinciden. ¿Cuál quieres cancelar? ...",
  "actions": [
    {
      "type": "error",
      "summary": "Error: Encontré 3 recordatorios que coinciden..."
    }
  ]
}
```

---

## 🧪 Prueba 5: Error - Falta información

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Enviar mensaje a Juan todos los días"
  }'
```

**Respuesta esperada:**
```json
{
  "reply": "Necesito la hora para este tipo de recordatorio. ¿A qué hora?",
  "actions": [
    {
      "type": "error",
      "summary": "Error: Necesito la hora para este tipo de recordatorio. ¿A qué hora?"
    }
  ]
}
```

---

## 🧪 Prueba 6: Error - OPENAI_API_KEY no configurado

```bash
# Simular sin OPENAI_API_KEY (solo en desarrollo)
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Test"
  }'
```

**Respuesta esperada (producción):**
```json
{
  "error": "OpenAI no está configurado",
  "reply": "Lo siento, el servicio de IA no está disponible. Por favor, contacta al administrador.",
  "actions": [
    {
      "type": "error",
      "summary": "OPENAI_API_KEY no configurado en producción"
    }
  ]
}
```

---

## ✅ Checklist de Verificación

Después de ejecutar las pruebas, verifica:

- [ ] **Prisma Singleton:** Solo una instancia de PrismaClient en toda la app
- [ ] **parseRelativeTime:** No parsea ISO dates, solo texto natural
- [ ] **Timezone:** Fechas formateadas en America/Bogota
- [ ] **cancel_reminder:** Maneja múltiples coincidencias correctamente
- [ ] **Errores:** Respuestas amigables con `actions` de tipo "error"
- [ ] **Seguridad:** `/api/ai` protegido con `ADMIN_PASSWORD`
- [ ] **OPENAI_API_KEY:** Validación en producción

---

## 🔍 Verificar en Base de Datos

Después de las pruebas, verifica en la base de datos:

```sql
-- Ver recordatorios creados
SELECT id, "to", body, "scheduleType", "sendAt", hour, minute, "dayOfMonth", timezone, "isActive"
FROM "Reminder"
ORDER BY "createdAt" DESC
LIMIT 5;
```

---

## 📝 Notas

- Todas las fechas deben estar en timezone `America/Bogota`
- Los números de WhatsApp deben estar en formato `whatsapp:+57...`
- Si un contacto no existe, OpenAI debe preguntar por el número
- Los errores deben ser claros y accionables
