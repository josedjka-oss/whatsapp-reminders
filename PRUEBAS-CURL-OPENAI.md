# 🧪 Pruebas con cURL - Integración OpenAI

Pruebas rápidas usando `curl` para verificar la integración OpenAI en producción.

---

## 📋 Prerrequisitos

1. Backend desplegado en Render (o corriendo localmente)
2. `OPENAI_API_KEY` configurada en Render
3. `ADMIN_PASSWORD` configurada (o usar "2023" por defecto)
4. URL del backend (ej: `https://whatsapp-reminders-mzex.onrender.com`)

---

## 🔧 Variables de Entorno Requeridas

```bash
# En Render
OPENAI_API_KEY=sk-...
ADMIN_PASSWORD=2023  # o AI_ADMIN_KEY
DEFAULT_REMINDER_HOUR=9  # opcional, default 9
DEFAULT_REMINDER_MINUTE=0  # opcional, default 0
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

## 🧪 Prueba 2: Cancelar recordatorio con múltiples coincidencias

**Objetivo:** Cancelar un recordatorio que puede tener múltiples coincidencias

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Cancelar el recordatorio de pagar luz"
  }'
```

**Respuesta esperada (si hay 1 coincidencia):**
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

**Respuesta esperada (si hay múltiples coincidencias):**
```json
{
  "reply": "Encontré 3 recordatorios que coinciden. ¿Cuál quieres cancelar?\n\n1. \"Recuérdame pagar la luz\" para whatsapp:+57...\n2. \"Pagar luz mensual\" para whatsapp:+57...\n3. \"Recordatorio luz\" para whatsapp:+57...\n\nPor favor, sé más específico o proporciona el ID del recordatorio.",
  "actions": [
    {
      "type": "needs_clarification",
      "summary": "Encontré 3 recordatorios que coinciden. ¿Cuál quieres cancelar?\n\n1. \"Recuérdame pagar la luz\" para whatsapp:+57...\n2. \"Pagar luz mensual\" para whatsapp:+57...\n3. \"Recordatorio luz\" para whatsapp:+57...\n\nPor favor, sé más específico o proporciona el ID del recordatorio."
    }
  ]
}
```

**Verificaciones:**
- ✅ Si hay 1 coincidencia → `type: "canceled"`
- ✅ Si hay múltiples → `type: "needs_clarification"` (NO error)
- ✅ `reply` contiene la lista de opciones
- ✅ NO se hace segunda llamada a OpenAI cuando hay `needs_clarification`

---

## 🧪 Prueba 3: Error - Sin autenticación

```bash
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test"
  }'
```

**Respuesta esperada:**
```json
{
  "error": "No autorizado",
  "message": "Se requiere autenticación"
}
```

---

## 🧪 Prueba 4: Error - OPENAI_API_KEY no configurado (producción)

```bash
# Simular sin OPENAI_API_KEY (solo en producción)
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{
    "text": "Test"
  }'
```

**Respuesta esperada:**
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

## 🧪 Prueba 5: Recordatorio diario

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

---

## 🧪 Prueba 6: Listar recordatorios

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

## ✅ Checklist de Verificación

Después de ejecutar las pruebas, verifica:

- [ ] **isValidISO:** Acepta cualquier ISO válido (con offset o Z)
- [ ] **Contactos:** No rompe si modelo Contact no existe
- [ ] **needs_clarification:** No lanza Error, devuelve tipo especial
- [ ] **needs_clarification:** NO hace segunda llamada a OpenAI
- [ ] **Defaults:** Usa DEFAULT_REMINDER_HOUR y DEFAULT_REMINDER_MINUTE
- [ ] **Autenticación:** Requiere ADMIN_PASSWORD o AI_ADMIN_KEY
- [ ] **Rate limiting:** Funciona correctamente
- [ ] **OPENAI_API_KEY:** Error claro en producción

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
- `needs_clarification` NO es un error, es una solicitud de más información

---

## 🚀 Ejecutar Todas las Pruebas

```bash
# Prueba 1
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{"text": "Recuérdame pagar la luz mañana a las 5pm"}'

# Prueba 2
curl -X POST https://tu-backend.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{"text": "Cancelar el recordatorio de pagar luz"}'
```
