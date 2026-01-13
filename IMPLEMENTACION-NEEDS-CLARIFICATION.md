# ✅ Implementación de needs_clarification

## 📋 Cambios Realizados

### 1. Flujo de `needs_clarification` en `processUserMessage`

**Antes:**
- `needs_clarification` se agregaba a `toolResults` y se hacía segunda llamada a OpenAI

**Ahora:**
- Si `executeTool` devuelve `{type: "needs_clarification"}`, se retorna inmediatamente sin segunda llamada
- NO se agrega a `toolResults`
- NO se llama `finalCompletion`

```typescript
if (action.type === "needs_clarification") {
  hasNeedsClarification = true;
  // NO agregar a toolResults, retornar directo
  return {
    reply: action.summary,
    actions: [action],
  };
}
```

### 2. Modelo `AiPending` en Prisma

**Nuevo modelo:**
```prisma
model AiPending {
  id        String   @id @default(uuid())
  userId    String   @default("default") // Por ahora solo 1 usuario
  type      String   // "cancel_reminder", etc.
  options   Json     // Array de opciones: [{index, id, body, to, ...}]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, type])
  @@index([userId])
}
```

### 3. Guardar opciones en DB cuando hay múltiples coincidencias

**En `cancel_reminder`:**
```typescript
if (matchingReminders.length > 1) {
  const options = matchingReminders.slice(0, 5).map((r, idx) => ({
    index: idx + 1,
    id: r.id,
    body: r.body,
    to: r.to,
    scheduleType: r.scheduleType,
  }));

  // Guardar en DB (upsert para solo 1 usuario)
  await prisma.aiPending.upsert({
    where: {
      userId_type: {
        userId: "default",
        type: "cancel_reminder",
      },
    },
    update: { options: options as any },
    create: {
      userId: "default",
      type: "cancel_reminder",
      options: options as any,
    },
  });

  return {
    type: "needs_clarification",
    summary: `Encontré ${matchingReminders.length} recordatorios...`,
  };
}
```

### 4. Resolver respuestas numéricas en `processUserMessage`

**Al inicio de `processUserMessage`:**
```typescript
// Verificar si el usuario está respondiendo a una pregunta de clarificación (número 1-5)
const numericMatch = text.trim().match(/^(\d+)$/);
if (numericMatch) {
  const selectedIndex = parseInt(numericMatch[1]);
  
  // Buscar pending de cancel_reminder
  const pending = await prisma.aiPending.findUnique({
    where: {
      userId_type: {
        userId: "default",
        type: "cancel_reminder",
      },
    },
  });

  if (pending && pending.options && Array.isArray(pending.options)) {
    const options = pending.options as any[];
    const selectedOption = options.find((opt) => opt.index === selectedIndex);
    
    if (selectedOption) {
      // Ejecutar cancel_reminder con el ID correcto
      await prisma.reminder.update({
        where: { id: selectedOption.id },
        data: { isActive: false },
      });

      // Eliminar pending
      await prisma.aiPending.delete({...});

      return {
        reply: `He cancelado el recordatorio: "${selectedOption.body}"`,
        actions: [{
          type: "canceled",
          summary: `Recordatorio cancelado: "${selectedOption.body}"`,
        }],
      };
    }
  }
}
```

### 5. Frontend: Mostrar `needs_clarification` de forma especial

**En `frontend/app/chat/page.tsx`:**
```typescript
{msg.actions.map((action, actionIndex) => {
  // Mostrar needs_clarification de forma especial
  if (action.type === "needs_clarification") {
    return (
      <div className="w-full mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-semibold mb-2">💬 Necesito más información:</p>
        <p className="text-sm text-blue-700 whitespace-pre-line">{action.summary}</p>
        <p className="text-xs text-blue-600 mt-2 italic">Responde con el número de la opción que deseas.</p>
      </div>
    );
  }
  // ... otros tipos de acciones
})}
```

---

## 🔄 Flujo Completo

1. **Usuario:** "Cancelar el recordatorio de pagar luz"
2. **Backend:** Encuentra 3 coincidencias
3. **Backend:** Guarda opciones en `AiPending`
4. **Backend:** Retorna `{type: "needs_clarification", summary: "Encontré 3 recordatorios...\n\n1. ...\n2. ...\n3. ..."}`
5. **Frontend:** Muestra pregunta especial con opciones
6. **Usuario:** Responde "2"
7. **Backend:** Detecta número, busca en `AiPending`, cancela recordatorio #2
8. **Backend:** Elimina `AiPending`
9. **Backend:** Retorna confirmación

---

## ✅ Checklist

- [x] `needs_clarification` NO se agrega a `toolResults`
- [x] `needs_clarification` NO hace segunda llamada a OpenAI
- [x] `needs_clarification` retorna inmediatamente con `reply: action.summary`
- [x] Modelo `AiPending` creado en Prisma
- [x] Opciones guardadas en DB cuando hay múltiples coincidencias
- [x] Respuestas numéricas resueltas contra `AiPending`
- [x] Frontend muestra `needs_clarification` de forma especial
- [x] Comportamiento actual mantenido para `created/updated/canceled/listed`

---

## 🚀 Próximos Pasos

1. **Migración Prisma:**
   ```bash
   npx prisma migrate dev --name add_ai_pending
   ```

2. **En Render:**
   - El build automático ejecutará `prisma db push` que creará la tabla

3. **Probar:**
   - Crear múltiples recordatorios similares
   - Intentar cancelar uno
   - Verificar que se muestre la pregunta
   - Responder con número
   - Verificar que se cancele el correcto

---

## 📝 Notas

- Por ahora solo soporta 1 usuario (`userId: "default"`)
- Solo implementado para `cancel_reminder`
- Fácilmente extensible a otros tipos de clarificaciones
- Las opciones se guardan como JSON en PostgreSQL
