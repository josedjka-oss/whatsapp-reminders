# 🧪 Prueba Manual - TTL AiPending

Pruebas manuales para verificar el funcionamiento del TTL en `/chat`.

---

## 📋 Prerrequisitos

1. Backend desplegado en Render
2. Frontend desplegado en Vercel
3. Variables de entorno configuradas:
   - `AI_PENDING_TTL_MINUTES=30` (o usar default)
   - `ADMIN_PASSWORD` en Render y Vercel

---

## 🧪 Prueba 1: Cancelar Recordatorio (Antes del TTL)

### Paso 1: Crear múltiples recordatorios similares

En `/chat`, crear al menos 2-3 recordatorios con texto similar:

```
"Recuérdame pagar la luz mañana a las 5pm"
"Recuérdame pagar el agua mañana a las 5pm"
"Recuérdame pagar el gas mañana a las 5pm"
```

### Paso 2: Intentar cancelar (debe mostrar lista)

En `/chat`:
```
"Cancela recordatorio de pagar"
```

**Resultado esperado:**
- Debe mostrar lista de opciones numeradas (1, 2, 3...)
- Debe guardar en `AiPending` con `updatedAt` actualizado

### Paso 3: Responder con número (antes de TTL)

En `/chat`, responder inmediatamente:
```
2
```

**Resultado esperado:**
- Debe cancelar el recordatorio #2
- Debe eliminar `AiPending`
- Debe mostrar confirmación: "He cancelado el recordatorio: ..."

---

## 🧪 Prueba 2: Cancelar Recordatorio (Después del TTL)

### Paso 1: Crear múltiples recordatorios similares

```
"Recuérdame pagar la luz mañana a las 5pm"
"Recuérdame pagar el agua mañana a las 5pm"
"Recuérdame pagar el gas mañana a las 5pm"
```

### Paso 2: Intentar cancelar (debe mostrar lista)

```
"Cancela recordatorio de pagar"
```

**Resultado esperado:**
- Lista de opciones numeradas
- `AiPending` creado con `updatedAt` = ahora

### Paso 3: Esperar más de 30 minutos (o cambiar TTL)

**Opción A:** Esperar 30 minutos reales

**Opción B:** Cambiar `AI_PENDING_TTL_MINUTES=1` en Render y esperar 1 minuto

### Paso 4: Responder con número (después de TTL)

En `/chat`, después de que expire:
```
2
```

**Resultado esperado:**
- Debe responder: "La lista de opciones ha expirado (más de 30 minutos). Por favor, vuelve a intentar cancelar el recordatorio."
- Debe eliminar `AiPending` expirado
- NO debe cancelar ningún recordatorio

---

## 🧪 Prueba 3: Validación de Rango

### Paso 1: Crear lista de opciones

```
"Cancela recordatorio de pagar"
```

### Paso 2: Responder con número fuera de rango

```
0
```

**Resultado esperado:**
- "Elige un número válido (1-5)."

```
6
```

**Resultado esperado:**
- "Elige un número válido (1-5)."

---

## 🧪 Prueba 4: Limpieza Defensiva

### Simular options inválido en DB

**Nota:** Esta prueba requiere acceso directo a la base de datos.

```sql
-- Simular options inválido
UPDATE "AiPending"
SET options = '{"invalid": "data"}'::json
WHERE "userId" = 'default' AND type = 'cancel_reminder';
```

### Responder con número

En `/chat`:
```
1
```

**Resultado esperado:**
- "La lista de opciones no es válida. Por favor, vuelve a intentar cancelar el recordatorio."
- Debe eliminar `AiPending` inválido

---

## ✅ Checklist de Verificación

- [ ] Validación de rango (1-5) funciona
- [ ] TTL verifica `updatedAt` correctamente
- [ ] TTL usa `AI_PENDING_TTL_MINUTES` (default 30)
- [ ] Pending expirado se elimina automáticamente
- [ ] Limpieza defensiva funciona si `options` no es array
- [ ] `upsert` actualiza `updatedAt` al crear lista
- [ ] Respuesta numérica funciona antes del TTL
- [ ] Respuesta numérica falla después del TTL

---

## 🔍 Verificar en Base de Datos

```sql
-- Ver AiPending actual
SELECT id, "userId", type, options, "createdAt", "updatedAt"
FROM "AiPending"
WHERE "userId" = 'default' AND type = 'cancel_reminder';

-- Calcular edad del pending
SELECT 
  id,
  "updatedAt",
  NOW() - "updatedAt" AS age,
  EXTRACT(EPOCH FROM (NOW() - "updatedAt")) / 60 AS age_minutes
FROM "AiPending"
WHERE "userId" = 'default' AND type = 'cancel_reminder';
```

---

## 📝 Notas

- El TTL se calcula desde `updatedAt`, no desde `createdAt`
- El `upsert` en `cancel_reminder` actualiza `updatedAt` automáticamente
- Si cambias `AI_PENDING_TTL_MINUTES`, necesitas redesplegar en Render
- El default es 30 minutos si no se configura

---

## 🚀 Configurar TTL Personalizado

En Render, agregar variable de entorno:

```bash
AI_PENDING_TTL_MINUTES=60  # 1 hora
```

O para pruebas rápidas:

```bash
AI_PENDING_TTL_MINUTES=1  # 1 minuto (solo para pruebas)
```
