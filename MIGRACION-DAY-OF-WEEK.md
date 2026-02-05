# Migración: Agregar soporte para recordatorios semanales

## ✅ Cambios Implementados

Se ha agregado soporte completo para recordatorios semanales con selección de día de la semana.

### Cambios en el código:
- ✅ Schema de Prisma actualizado con campo `dayOfWeek`
- ✅ Backend actualizado para aceptar `scheduleType: "weekly"` con `dayOfWeek`
- ✅ Scheduler actualizado para procesar recordatorios semanales
- ✅ Frontend actualizado con paso adicional para seleccionar día de la semana
- ✅ Visualización actualizada para mostrar el día de la semana

## 🔧 Migración de Base de Datos

**IMPORTANTE:** Debes ejecutar esta migración SQL en la base de datos de producción antes de que los cambios funcionen completamente.

### Opción 1: Desde Render Dashboard (Recomendado)

1. Ve a tu servicio en Render: https://dashboard.render.com
2. Selecciona tu servicio de backend
3. Ve a la pestaña **"Shell"** o **"Logs"**
4. Abre una conexión a la base de datos PostgreSQL
5. Ejecuta el siguiente SQL:

```sql
ALTER TABLE "Reminder" 
ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER;
```

### Opción 2: Desde psql (Línea de comandos)

Si tienes acceso a `psql` con las credenciales de la base de datos:

```bash
psql $DATABASE_URL -c "ALTER TABLE \"Reminder\" ADD COLUMN IF NOT EXISTS \"dayOfWeek\" INTEGER;"
```

### Opción 3: Desde el archivo SQL

El archivo `prisma/migrations/add_day_of_week.sql` contiene el SQL necesario. Puedes copiarlo y ejecutarlo en tu cliente de PostgreSQL.

## 📋 Verificación

Después de ejecutar la migración, verifica que el campo existe:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Reminder' AND column_name = 'dayOfWeek';
```

Deberías ver:
```
 column_name | data_type
-------------+-----------
 dayOfWeek   | integer
```

## 🎯 Funcionalidad

Una vez completada la migración:

1. **Crear recordatorio semanal:**
   - Selecciona "Semanalmente" en el formulario
   - Elige el día de la semana (Lunes, Martes, etc.)
   - Selecciona la hora
   - El recordatorio se enviará cada semana en ese día y hora

2. **Visualización:**
   - Los recordatorios semanales mostrarán: "Todos los [Día]s a las [Hora]"
   - Ejemplo: "Todos los Lunes a las 09:00"

3. **Scheduler:**
   - El scheduler verificará cada minuto si es el día y hora correctos
   - Los recordatorios semanales permanecen activos (no se desactivan después de enviar)

## ⚠️ Nota

- `dayOfWeek`: 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
- Los recordatorios semanales existentes que fueron creados antes de esta actualización seguirán funcionando como "once" (no se verán afectados)
