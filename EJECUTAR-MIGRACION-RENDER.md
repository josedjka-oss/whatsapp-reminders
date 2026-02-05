# 🚀 Ejecutar Migración SQL en Render - Guía Paso a Paso

## Método 1: Desde Render Dashboard (Más Fácil) ⭐

### Paso 1: Acceder a la Base de Datos

1. Ve a **Render Dashboard**: https://dashboard.render.com
2. Inicia sesión con tu cuenta
3. Busca tu servicio de **PostgreSQL Database** (no el servicio de backend)
4. Haz clic en el nombre de la base de datos

### Paso 2: Abrir el Shell

1. En la página de la base de datos, busca la pestaña **"Connect"** o **"Info"**
2. Busca la sección **"Connection Info"** o **"Internal Database URL"**
3. Copia la **Internal Database URL** (algo como: `postgresql://user:pass@host:5432/dbname`)

### Paso 3: Usar el Shell de Render

1. En el dashboard de Render, ve a tu **servicio de backend** (no la base de datos)
2. Haz clic en el servicio
3. Ve a la pestaña **"Shell"** (en el menú lateral)
4. Haz clic en **"Open Shell"** o **"Connect"**

### Paso 4: Ejecutar la Migración

En el Shell, ejecuta estos comandos:

```bash
# Conectarse a la base de datos usando la variable de entorno
psql $DATABASE_URL
```

Si `psql` no está disponible, usa:

```bash
# Instalar psql si es necesario (solo una vez)
apt-get update && apt-get install -y postgresql-client

# Conectarse
psql $DATABASE_URL
```

Una vez conectado, ejecuta:

```sql
ALTER TABLE "Reminder" 
ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER;
```

Para salir de psql, escribe:
```sql
\q
```

---

## Método 2: Crear Endpoint Temporal (Alternativa)

Si el Shell no funciona, podemos crear un endpoint temporal en el backend que ejecute la migración.

### Paso 1: Agregar el Endpoint

Ya está creado el archivo `src/routes/migrate.ts` que puedes usar.

### Paso 2: Ejecutar la Migración

1. Despliega el código actualizado
2. Visita: `https://whatsapp-reminders-mzex.onrender.com/api/migrate/add-day-of-week`
3. Deberías ver: `{"success": true, "message": "Campo dayOfWeek agregado exitosamente"}`

### Paso 3: Eliminar el Endpoint (Después)

Una vez que la migración esté completa, elimina el endpoint para seguridad.

---

## Método 3: Usar Cliente PostgreSQL Local (Avanzado)

Si tienes PostgreSQL instalado localmente:

1. Obtén la **External Database URL** desde Render Dashboard
2. Ejecuta en tu terminal local:

```bash
psql "postgresql://user:pass@host:5432/dbname" -c "ALTER TABLE \"Reminder\" ADD COLUMN IF NOT EXISTS \"dayOfWeek\" INTEGER;"
```

---

## ✅ Verificar que Funcionó

Después de ejecutar la migración, verifica que el campo existe:

### Desde el Shell de Render:

```sql
psql $DATABASE_URL -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Reminder' AND column_name = 'dayOfWeek';"
```

Deberías ver:
```
 column_name | data_type
-------------+-----------
 dayOfWeek   | integer
```

### O desde el endpoint de verificación:

Visita: `https://whatsapp-reminders-mzex.onrender.com/api/migrate/verify-day-of-week`

---

## 🎯 Después de la Migración

Una vez completada la migración:

1. ✅ El backend ya está actualizado (código desplegado)
2. ✅ El frontend ya está actualizado (código desplegado)
3. ✅ La base de datos ahora tiene el campo `dayOfWeek`
4. ✅ Puedes crear recordatorios semanales desde la interfaz

---

## ⚠️ Nota de Seguridad

- El campo `dayOfWeek` es opcional (puede ser NULL)
- Los recordatorios existentes no se verán afectados
- Solo los nuevos recordatorios semanales usarán este campo
