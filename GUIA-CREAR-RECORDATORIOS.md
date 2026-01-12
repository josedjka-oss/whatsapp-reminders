# 📅 Guía Completa: Crear y Gestionar Recordatorios

## 🎯 Resumen Rápido

Tu aplicación permite crear recordatorios que se envían automáticamente a cualquier número de WhatsApp, pero **todas las respuestas siempre llegan a tu WhatsApp personal** (`+573024002656`).

---

## 📋 Tipos de Recordatorios

### 1. **Once** (Una vez)
- Se envía **una sola vez** en una fecha/hora específica
- Después de enviarse, se desactiva automáticamente

### 2. **Daily** (Diario)
- Se envía **cada día** a la misma hora
- Continúa indefinidamente hasta que lo desactives

### 3. **Monthly** (Mensual)
- Se envía **el mismo día de cada mes** a la misma hora
- Continúa indefinidamente hasta que lo desactives

---

## 🚀 Cómo Crear Recordatorios

### Opción 1: Usando curl (Terminal/PowerShell)

### Opción 2: Usando Postman o Insomnia

### Opción 3: Usando un script de Node.js

---

## 📝 Ejemplos Prácticos

### Ejemplo 1: Recordatorio Único (Once)

**Enviar un mensaje mañana a las 2:00 PM a un cliente**

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Hola Juan, recordatorio: Reunión mañana a las 2 PM\",\"scheduleType\":\"once\",\"sendAt\":\"2025-01-11T14:00:00\",\"timezone\":\"America/Bogota\"}"
```

**Explicación**:
- `to`: Número destino (puede ser cualquier número, no solo el tuyo)
- `body`: Mensaje que se enviará
- `scheduleType`: `"once"` (una sola vez)
- `sendAt`: Fecha y hora exacta (formato: `YYYY-MM-DDTHH:mm:ss`)
- `timezone`: Zona horaria

**Nota**: Cambia `+573001234567` por el número real del destinatario.

### Ejemplo 2: Recordatorio Diario

**Enviar un mensaje cada día a las 8:00 AM a tu mamá**

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Buenos días mamá, que tengas un excelente día ❤️\",\"scheduleType\":\"daily\",\"hour\":8,\"minute\":0,\"timezone\":\"America/Bogota\"}"
```

**Explicación**:
- `scheduleType`: `"daily"` (diario)
- `hour`: `8` (8 AM)
- `minute`: `0` (en punto)
- Se enviará **cada día a las 8:00 AM**

### Ejemplo 3: Recordatorio Mensual

**Enviar un mensaje el día 5 de cada mes a las 9:00 AM a un cliente**

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Recordatorio mensual: Factura pendiente de pago\",\"scheduleType\":\"monthly\",\"dayOfMonth\":5,\"hour\":9,\"minute\":0,\"timezone\":\"America/Bogota\"}"
```

**Explicación**:
- `scheduleType`: `"monthly"` (mensual)
- `dayOfMonth`: `5` (día 5 del mes)
- `hour`: `9` (9 AM)
- `minute`: `0` (en punto)
- Se enviará **el día 5 de cada mes a las 9:00 AM**

### Ejemplo 4: Recordatorio Diario a las 6:00 PM

**Enviar un mensaje cada día a las 6:00 PM**

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Recordatorio: Revisar correos del día\",\"scheduleType\":\"daily\",\"hour\":18,\"minute\":0,\"timezone\":\"America/Bogota\"}"
```

**Nota**: `hour: 18` = 6:00 PM (formato 24 horas)

---

## 📱 Formato de Números de Teléfono

### Formato Requerido

Todos los números deben estar en formato internacional con el prefijo `whatsapp:`:

```
whatsapp:+[código de país][número completo]
```

### Ejemplos

- **Colombia**: `whatsapp:+573001234567`
- **México**: `whatsapp:+521234567890`
- **España**: `whatsapp:+34612345678`
- **Estados Unidos**: `whatsapp:+15551234567`

### Cómo Obtener el Formato Correcto

1. **Toma el número completo** (ejemplo: 300 123 4567)
2. **Agrega código de país** (Colombia: +57)
3. **Quita espacios y guiones**: `+573001234567`
4. **Agrega prefijo `whatsapp:`**: `whatsapp:+573001234567`

---

## ⏰ Zona Horaria

### Zona Horaria Configurada

Tu aplicación está configurada con: `America/Bogota`

### Otras Zonas Horarias Comunes

- `America/Mexico_City` (México)
- `America/New_York` (Estados Unidos - Este)
- `America/Los_Angeles` (Estados Unidos - Oeste)
- `Europe/Madrid` (España)
- `America/Argentina/Buenos_Aires` (Argentina)

**Puedes usar cualquier zona horaria** cambiando el campo `timezone` en el recordatorio.

---

## 🔄 Gestionar Recordatorios

### Listar Todos los Recordatorios

```bash
curl http://localhost:3000/api/reminders
```

### Listar Solo Recordatorios Activos

```bash
curl "http://localhost:3000/api/reminders?isActive=true"
```

### Listar Solo Recordatorios Diarios

```bash
curl "http://localhost:3000/api/reminders?scheduleType=daily"
```

### Desactivar un Recordatorio

```bash
curl -X PATCH http://localhost:3000/api/reminders/{id} `
  -H "Content-Type: application/json" `
  -d "{\"isActive\":false}"
```

**Nota**: Reemplaza `{id}` con el ID real del recordatorio (lo obtienes al listar).

### Activar un Recordatorio

```bash
curl -X PATCH http://localhost:3000/api/reminders/{id} `
  -H "Content-Type: application/json" `
  -d "{\"isActive\":true}"
```

### Actualizar un Recordatorio

```bash
curl -X PATCH http://localhost:3000/api/reminders/{id} `
  -H "Content-Type: application/json" `
  -d "{\"body\":\"Nuevo mensaje\",\"hour\":10,\"minute\":30}"
```

### Eliminar un Recordatorio

```bash
curl -X DELETE http://localhost:3000/api/reminders/{id}
```

---

## 📩 Cómo Funciona el Reenvío de Respuestas

### ✅ Configuración Actual

**Todas las respuestas** que lleguen al número de Twilio (`+1 415 523 8886`) **se reenvían automáticamente a tu WhatsApp personal** (`+573024002656`).

### Ejemplo de Flujo

1. **Envías un recordatorio** a `whatsapp:+573001234567` (un cliente)
2. **El cliente recibe** el mensaje en su WhatsApp
3. **El cliente responde** al número de Twilio (`+1 415 523 8886`)
4. **Tu servidor recibe** el mensaje a través del webhook
5. **Tu servidor reenvía** el mensaje a tu WhatsApp personal (`+573024002656`)
6. **Tú recibes** el mensaje con formato:
   ```
   📩 Respuesta de whatsapp:+573001234567:
   
   [mensaje del cliente]
   ```

### ✅ Ventaja

- Puedes enviar recordatorios a **cualquier número**
- Todas las respuestas llegan a **tu WhatsApp personal**
- No necesitas cambiar configuración para cada destinatario

---

## 🎯 Casos de Uso Reales

### Caso 1: Recordatorios a Clientes

**Enviar recordatorio de pago cada mes a diferentes clientes**

```bash
# Cliente 1 - Día 5 de cada mes
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Hola, recordatorio: Factura pendiente de pago\",\"scheduleType\":\"monthly\",\"dayOfMonth\":5,\"hour\":9,\"minute\":0,\"timezone\":\"America/Bogota\"}"

# Cliente 2 - Día 10 de cada mes
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573007654321\",\"body\":\"Hola, recordatorio: Factura pendiente de pago\",\"scheduleType\":\"monthly\",\"dayOfMonth\":10,\"hour\":9,\"minute\":0,\"timezone\":\"America/Bogota\"}"
```

**Todas las respuestas llegarán a tu WhatsApp personal** (`+573024002656`).

### Caso 2: Recordatorios Familiares

**Enviar buenos días cada día a diferentes familiares**

```bash
# A tu mamá - Cada día a las 7 AM
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001111111\",\"body\":\"Buenos días mamá ❤️\",\"scheduleType\":\"daily\",\"hour\":7,\"minute\":0,\"timezone\":\"America/Bogota\"}"

# A tu papá - Cada día a las 7:30 AM
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573002222222\",\"body\":\"Buenos días papá ❤️\",\"scheduleType\":\"daily\",\"hour\":7,\"minute\":30,\"timezone\":\"America/Bogota\"}"
```

### Caso 3: Recordatorio de Reunión

**Enviar recordatorio de reunión una vez**

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Recordatorio: Reunión importante mañana a las 2 PM. Por favor confirma asistencia.\",\"scheduleType\":\"once\",\"sendAt\":\"2025-01-11T14:00:00\",\"timezone\":\"America/Bogota\"}"
```

Si el destinatario responde, recibirás la respuesta en tu WhatsApp personal.

---

## 📊 Ver Mensajes Enviados y Recibidos

### Ver Todos los Mensajes

```bash
curl http://localhost:3000/api/messages
```

### Ver Solo Mensajes Recibidos (Inbound)

```bash
curl "http://localhost:3000/api/messages?direction=inbound"
```

### Ver Solo Mensajes Enviados (Outbound)

```bash
curl "http://localhost:3000/api/messages?direction=outbound"
```

### Ver Mensajes de un Número Específico

```bash
curl "http://localhost:3000/api/messages?from=whatsapp:+573001234567"
```

---

## 🕐 Horarios (Formato 24 Horas)

### Conversión de Horas

- **12:00 AM (Medianoche)**: `hour: 0`
- **1:00 AM**: `hour: 1`
- **6:00 AM**: `hour: 6`
- **12:00 PM (Mediodía)**: `hour: 12`
- **1:00 PM**: `hour: 13`
- **6:00 PM**: `hour: 18`
- **11:00 PM**: `hour: 23`

### Ejemplos de Horarios

```json
{"hour": 8, "minute": 0}   // 8:00 AM
{"hour": 8, "minute": 30}  // 8:30 AM
{"hour": 14, "minute": 0}  // 2:00 PM
{"hour": 18, "minute": 15} // 6:15 PM
{"hour": 22, "minute": 0}  // 10:00 PM
```

---

## 📅 Fechas (Formato para "Once")

### Formato de Fecha

```
YYYY-MM-DDTHH:mm:ss
```

### Ejemplos

```json
"sendAt": "2025-01-11T14:00:00"  // 11 de enero 2025, 2:00 PM
"sendAt": "2025-01-15T09:30:00"  // 15 de enero 2025, 9:30 AM
"sendAt": "2025-02-01T08:00:00"  // 1 de febrero 2025, 8:00 AM
```

### Obtener Fecha Actual + X Minutos

**Para probar rápidamente**, puedes usar una fecha 5-10 minutos en el futuro:

- **Ahora**: 10 de enero 2025, 5:30 PM
- **En 5 minutos**: `"sendAt": "2025-01-10T17:35:00"`
- **En 10 minutos**: `"sendAt": "2025-01-10T17:40:00"`

---

## 🎨 Personalizar Mensajes

### Usar Emojis

```json
{
  "body": "💊 Recordatorio: Tomar medicamento a las 8 AM"
}
```

### Mensajes Largos

```json
{
  "body": "Hola, este es un recordatorio importante.\n\nPor favor revisa:\n1. Revisar correos\n2. Llamar a cliente\n3. Enviar reporte\n\nGracias!"
}
```

### Mensajes con Variables

Los mensajes son texto plano, pero puedes crear diferentes recordatorios para diferentes personas con mensajes personalizados.

---

## 🔍 Verificar que un Recordatorio se Creó

### Paso 1: Listar Recordatorios

```bash
curl http://localhost:3000/api/reminders
```

### Paso 2: Buscar tu Recordatorio

Verás algo como:

```json
[
  {
    "id": "abc123...",
    "to": "whatsapp:+573001234567",
    "body": "Recordatorio diario",
    "scheduleType": "daily",
    "hour": 8,
    "minute": 0,
    "isActive": true,
    "createdAt": "2025-01-10T17:30:00.000Z"
  }
]
```

### Paso 3: Verificar Estado

- `isActive: true` → Se enviará según la programación
- `isActive: false` → No se enviará (desactivado)
- `lastRunAt: null` → Aún no se ha enviado
- `lastRunAt: "2025-01-10T..."` → Última vez que se envió

---

## ⚠️ Notas Importantes

### 1. Formato de Números

**Siempre incluye**:
- Prefijo `whatsapp:`
- Código de país `+57`
- Número completo sin espacios

**Correcto**: `whatsapp:+573001234567`  
**Incorrecto**: `+573001234567` (falta `whatsapp:`)  
**Incorrecto**: `573001234567` (falta `whatsapp:` y `+`)

### 2. Zona Horaria

Todos los recordatorios usan la zona horaria especificada. Si creas un recordatorio para las 9:00 AM en `America/Bogota`, se enviará a las 9:00 AM hora de Bogotá, sin importar dónde estés.

### 3. Recordatorios Recurrentes

Los recordatorios `daily` y `monthly` continúan indefinidamente hasta que:
- Los desactives manualmente (`isActive: false`)
- Los elimines

### 4. Recordatorios "Once"

Los recordatorios `once` se desactivan automáticamente después de enviarse.

### 5. Reenvío de Respuestas

**Todas las respuestas** que lleguen al número de Twilio (`+1 415 523 8886`) se reenvían a tu WhatsApp personal (`+573024002656`), sin importar a quién hayas enviado el recordatorio original.

---

## 🧪 Prueba Rápida

### Crear un Recordatorio de Prueba (5 minutos desde ahora)

1. **Obtén la hora actual** (ejemplo: 5:30 PM)
2. **Calcula 5 minutos más** (5:35 PM)
3. **Crea el recordatorio**:

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573024002656\",\"body\":\"Prueba de recordatorio\",\"scheduleType\":\"once\",\"sendAt\":\"2025-01-10T17:35:00\",\"timezone\":\"America/Bogota\"}"
```

**Ajusta** `sendAt` según tu hora actual + 5 minutos.

4. **Espera 5 minutos**
5. **Revisa tu WhatsApp** - deberías recibir el mensaje

---

## 📚 Más Información

- **README.md**: Documentación completa de la API
- **APLICACION-FUNCIONANDO.md**: Guía de uso general

---

**¿Listo para crear tu primer recordatorio?** Usa los ejemplos de arriba y ajusta los valores según tus necesidades.
