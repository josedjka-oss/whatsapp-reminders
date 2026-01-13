# ✅ Checklist de Pruebas en Producción - TTL AiPending

Checklist para verificar que el TTL y la limpieza defensiva funcionan correctamente en producción.

---

## 🔧 Configuración Previa

### Render (Backend)
- [ ] Verificar que `AI_PENDING_TTL_MINUTES=30` esté configurado (o usar default)
- [ ] Verificar que el servicio se redesplegó correctamente
- [ ] Verificar logs sin errores de compilación

### Vercel (Frontend)
- [ ] Verificar que el frontend esté desplegado y accesible
- [ ] Verificar que `/chat` funcione correctamente

---

## 🧪 Prueba 1: Cancelar Recordatorio → Lista

### Pasos:
1. [ ] Ir a `/chat` en Vercel
2. [ ] Crear múltiples recordatorios similares:
   ```
   "Recuérdame pagar la luz mañana a las 5pm"
   "Recuérdame pagar el agua mañana a las 5pm"
   "Recuérdame pagar el gas mañana a las 5pm"
   ```
3. [ ] Intentar cancelar:
   ```
   "Cancela recordatorio de pagar"
   ```

### Resultado Esperado:
- [ ] Debe mostrar lista numerada (1, 2, 3...)
- [ ] Debe mostrar mensaje de clarificación con opciones
- [ ] NO debe hacer segunda llamada a OpenAI (verificar en logs de Render)
- [ ] Debe guardar en `AiPending` con `updatedAt` actualizado

### Verificar en Base de Datos (opcional):
```sql
SELECT id, "userId", type, options, "createdAt", "updatedAt"
FROM "AiPending"
WHERE "userId" = 'default' AND type = 'cancel_reminder';
```

---

## 🧪 Prueba 2: Responder con Número (Dentro del TTL)

### Pasos:
1. [ ] Después de Prueba 1, responder inmediatamente:
   ```
   2
   ```

### Resultado Esperado:
- [ ] Debe cancelar el recordatorio #2
- [ ] Debe eliminar `AiPending`
- [ ] Debe mostrar confirmación: "He cancelado el recordatorio: ..."
- [ ] Debe mostrar action chip: "Recordatorio cancelado: ..."

### Verificar en Base de Datos (opcional):
```sql
-- Verificar que el recordatorio #2 esté desactivado
SELECT id, body, "isActive"
FROM "Reminder"
WHERE body LIKE '%agua%'
ORDER BY "createdAt" DESC
LIMIT 1;

-- Verificar que AiPending fue eliminado
SELECT COUNT(*) FROM "AiPending"
WHERE "userId" = 'default' AND type = 'cancel_reminder';
-- Debe ser 0
```

---

## 🧪 Prueba 3: Responder Fuera del TTL (Debe Pedir Repetir)

### Pasos:
1. [ ] Crear múltiples recordatorios similares de nuevo:
   ```
   "Recuérdame pagar la luz mañana a las 5pm"
   "Recuérdame pagar el agua mañana a las 5pm"
   "Recuérdame pagar el gas mañana a las 5pm"
   ```
2. [ ] Intentar cancelar:
   ```
   "Cancela recordatorio de pagar"
   ```
3. [ ] **Esperar más de 30 minutos** (o cambiar `AI_PENDING_TTL_MINUTES=1` en Render y esperar 1 minuto)
4. [ ] Responder con número:
   ```
   2
   ```

### Resultado Esperado:
- [ ] Debe responder: "La lista de opciones ha expirado (más de 30 minutos). Por favor, vuelve a intentar cancelar el recordatorio."
- [ ] Debe eliminar `AiPending` expirado
- [ ] NO debe cancelar ningún recordatorio
- [ ] Debe pedir que se repita el flujo

### Verificar en Base de Datos (opcional):
```sql
-- Verificar que ningún recordatorio fue cancelado
SELECT id, body, "isActive"
FROM "Reminder"
WHERE body LIKE '%agua%'
ORDER BY "createdAt" DESC
LIMIT 1;
-- isActive debe ser true

-- Verificar que AiPending fue eliminado
SELECT COUNT(*) FROM "AiPending"
WHERE "userId" = 'default' AND type = 'cancel_reminder';
-- Debe ser 0
```

---

## 🧪 Prueba 4: needs_clarification Corta el Flujo (Sin Segunda Llamada OpenAI)

### Pasos:
1. [ ] Crear múltiples recordatorios similares:
   ```
   "Recuérdame pagar la luz mañana a las 5pm"
   "Recuérdame pagar el agua mañana a las 5pm"
   "Recuérdame pagar el gas mañana a las 5pm"
   ```
2. [ ] Intentar cancelar:
   ```
   "Cancela recordatorio de pagar"
   ```

### Verificar en Logs de Render:
- [ ] Debe haber UNA sola llamada a OpenAI (la inicial con tool calls)
- [ ] NO debe haber segunda llamada a OpenAI (finalCompletion)
- [ ] Debe retornar inmediatamente con `needs_clarification`

### Verificar en Frontend:
- [ ] Debe mostrar mensaje de clarificación inmediatamente
- [ ] NO debe mostrar "Pensando..." después del mensaje de clarificación
- [ ] Debe permitir responder con número

---

## 🧪 Prueba 5: Validación de Rango Numérico

### Pasos:
1. [ ] Crear múltiples recordatorios similares
2. [ ] Intentar cancelar y obtener lista
3. [ ] Responder con número fuera de rango:
   ```
   0
   ```
4. [ ] Responder con número fuera de rango:
   ```
   6
   ```

### Resultado Esperado:
- [ ] Debe responder: "Elige un número válido (1-5)."
- [ ] NO debe cancelar ningún recordatorio
- [ ] NO debe eliminar `AiPending`

---

## 🧪 Prueba 6: Limpieza Defensiva (Options Inválido)

### Nota:
Esta prueba requiere acceso directo a la base de datos para simular un estado inválido.

### Pasos:
1. [ ] Simular `options` inválido en DB:
   ```sql
   UPDATE "AiPending"
   SET options = '{"invalid": "data"}'::json
   WHERE "userId" = 'default' AND type = 'cancel_reminder';
   ```
2. [ ] Responder con número:
   ```
   1
   ```

### Resultado Esperado:
- [ ] Debe responder: "La lista de opciones no es válida o está vacía. Por favor, vuelve a intentar cancelar el recordatorio."
- [ ] Debe eliminar `AiPending` inválido
- [ ] NO debe cancelar ningún recordatorio

---

## ✅ Checklist Final

### Funcionalidad:
- [ ] TTL funciona correctamente (30 minutos por defecto)
- [ ] Validación de rango (1-5) funciona
- [ ] Limpieza defensiva funciona
- [ ] `needs_clarification` corta el flujo correctamente
- [ ] Expiración elimina pending automáticamente

### UX:
- [ ] Mensajes claros y amigables
- [ ] Frontend muestra clarificación correctamente
- [ ] Frontend permite responder con número
- [ ] Confirmaciones son claras

### Performance:
- [ ] No hay segunda llamada a OpenAI cuando hay `needs_clarification`
- [ ] Respuestas son rápidas (< 3 segundos)
- [ ] No hay errores en logs

---

## 📝 Notas

- Si cambias `AI_PENDING_TTL_MINUTES=1` para pruebas rápidas, recuerda cambiarlo de vuelta a `30` después
- Los logs de Render muestran todas las llamadas a OpenAI
- Verificar que `updatedAt` se actualiza correctamente en `upsert`

---

## 🚀 Siguiente Paso

Si todas las pruebas pasan:
- ✅ Pulir UX del chat (`/chat`)
- ✅ Mejorar mensajes de confirmación
- ✅ Agregar indicadores visuales de estado
