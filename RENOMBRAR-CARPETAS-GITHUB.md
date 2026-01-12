# Renombrar Carpetas en GitHub (rutas → routes, servicios → services, utilidades → utils)

## ⚠️ IMPORTANTE: GitHub no permite renombrar carpetas directamente

Necesitamos **mover los archivos** de las carpetas en español a carpetas en inglés.

---

## PASO 1: Renombrar `rutas/` → `routes/`

### Opción A: Mover archivos uno por uno (Más seguro)

1. **Haz clic en la carpeta `rutas/`**
2. **Para cada archivo** (`messages.ts`, `reminders.ts`, `webhooks.ts`):
   - Haz clic en el archivo
   - Haz clic en el icono **✏️ editar** (lápiz)
   - **Copia TODO el contenido** del archivo
   - Haz clic en **"Cancel"**
   - Haz clic en **"Add file"** → **"Create new file"**
   - En el campo de nombre, escribe: **`routes/nombre-archivo.ts`**
     - Ejemplo: `routes/messages.ts`
     - Ejemplo: `routes/reminders.ts`
     - Ejemplo: `routes/webhooks.ts`
   - **Pega el contenido** copiado
   - Commit: `"Mover rutas/messages.ts a routes/messages.ts"` (cambia el nombre del archivo)
   - Haz clic en **"Commit changes"**

3. **Después de mover todos los archivos**, elimina la carpeta vacía `rutas/`:
   - Ve a la carpeta `rutas/`
   - Si está vacía, GitHub la eliminará automáticamente
   - O haz clic en cada archivo restante y elimínalo

### Opción B: Subir archivos desde tu computadora (Más rápido)

1. **En tu computadora**, los archivos ya están en la carpeta correcta:
   - `C:\Users\user\Desktop\WHATS\src\routes\`
   
2. **En GitHub**, haz clic en **"Add file"** → **"Upload files"**

3. **Arrastra TODOS los archivos** desde:
   - `C:\Users\user\Desktop\WHATS\src\routes\` (carpeta completa)
   
4. **IMPORTANTE**: Antes de hacer commit, verifica que GitHub cree la ruta:
   - Debe ser: `routes/messages.ts`
   - NO debe ser: `rutas/messages.ts`

5. **Commit**: `"Agregar carpetas routes/ (reemplazar rutas/)"`

6. **Elimina la carpeta antigua `rutas/`** (ve a la carpeta y elimina los archivos)

---

## PASO 2: Renombrar `servicios/` → `services/`

Sigue el mismo proceso que el PASO 1, pero:
- Carpeta origen: `servicios/`
- Carpeta destino: `services/`
- Archivos: `scheduler.ts`, `twilio.ts`
- Ruta local: `C:\Users\user\Desktop\WHATS\src\services\`

---

## PASO 3: Renombrar `utilidades/` → `utils/`

Sigue el mismo proceso que el PASO 1, pero:
- Carpeta origen: `utilidades/`
- Carpeta destino: `utils/`
- Archivo: `validation.ts`
- Ruta local: `C:\Users\user\Desktop\WHATS\src\utils\`

---

## ✅ VERIFICACIÓN FINAL

Después de renombrar todo, tu estructura debe ser:

```
src/
├── server.ts ✅ (NO servidor.ts)
├── routes/
│   ├── messages.ts ✅
│   ├── reminders.ts ✅
│   └── webhooks.ts ✅
├── services/
│   ├── scheduler.ts ✅
│   └── twilio.ts ✅
└── utils/
    └── validation.ts ✅
```

---

## 🚀 MÉTODO ALTERNATIVO RÁPIDO (Recomendado)

Si prefieres hacerlo todo de una vez:

1. **Elimina las carpetas en español** (`rutas/`, `servicios/`, `utilidades/`) y `servidor.ts`

2. **Sube todo de nuevo desde tu computadora**:
   - Arrastra la carpeta completa `C:\Users\user\Desktop\WHATS\src\` a GitHub
   - GitHub creará la estructura correcta automáticamente

3. **Commit**: `"Corregir estructura: renombrar carpetas a inglés"`

---

**💡 CONSEJO:** El método alternativo es más rápido y menos propenso a errores.
