# 🔍 Diagnóstico: Recordatorios no se envían a otros números

## Problema Reportado
- ✅ Recordatorios a tu propio número SÍ se envían
- ❌ Recordatorios programados a otros números NO se envían

## Posibles Causas

### 1. **Twilio Sandbox Mode** (MÁS PROBABLE)
Twilio tiene un modo "Sandbox" que solo permite enviar mensajes a números verificados. Si tu cuenta está en sandbox:
- Solo puedes enviar a números que hayas verificado previamente
- Necesitas verificar cada número antes de enviar

**Solución:**
1. Ve a [Twilio Console](https://console.twilio.com/)
2. Verifica si estás en "Sandbox" o "Production"
3. Si estás en Sandbox, necesitas:
   - Verificar cada número antes de enviar, O
   - Migrar a una cuenta de producción (requiere verificación de Twilio)

### 2. **Formato del Número**
El número debe estar en formato: `whatsapp:+573001234567`

**Verificar:**
- Revisa en la base de datos cómo se guardan los números
- Asegúrate de que el formato sea correcto

### 3. **Logs del Scheduler**
Revisa los logs en Render para ver si hay errores específicos:
- Ve a Render Dashboard → Logs
- Busca mensajes de `[SCHEDULER]` y `[TWILIO]`
- Busca errores como "unverified number" o "sandbox"

## Cómo Verificar

### Paso 1: Revisar Logs en Render
1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Selecciona tu servicio
3. Ve a "Logs"
4. Busca mensajes cuando debería enviarse el recordatorio
5. Busca errores de Twilio

### Paso 2: Verificar Formato del Número
En la base de datos, verifica que el número esté en formato:
```
whatsapp:+573001234567
```

NO debe ser:
- `+573001234567` (sin whatsapp:)
- `573001234567` (sin + ni whatsapp:)
- `whatsapp:573001234567` (sin +)

### Paso 3: Verificar Estado de Twilio
1. Ve a [Twilio Console](https://console.twilio.com/)
2. Ve a "Messaging" → "Try it out" → "Send a WhatsApp message"
3. Verifica si puedes enviar a números no verificados

## Solución Temporal

Si estás en Sandbox y necesitas enviar a números no verificados:

1. **Agregar números verificados en Twilio:**
   - Ve a Twilio Console
   - Agrega números a la lista de verificados

2. **O migrar a producción:**
   - Solicita acceso a producción en Twilio
   - Esto requiere verificación de tu cuenta

## Próximos Pasos

1. Revisa los logs en Render
2. Verifica el formato de los números en la base de datos
3. Confirma si estás en Sandbox o Production en Twilio
4. Comparte los logs si encuentras errores específicos
