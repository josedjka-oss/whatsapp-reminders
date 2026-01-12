# PASO 4: Crear carpeta src/ y subir todos los archivos

## Verificar si src/ ya existe

1. En GitHub, revisa si ya existe la carpeta **`src/`**
2. Si **SÍ existe**, haz clic en ella y verifica qué archivos tiene dentro
3. Si **NO existe**, créala con el siguiente método

---

## Crear carpeta src/ y subir archivos

### Método 1: Crear carpeta primero (Recomendado)

1. Haz clic en **"Add file"** → **"Create new file"**

2. En el campo de nombre, escribe:
   ```
   src/.gitkeep
   ```
   (Esto crea la carpeta `src/` vacía)

3. Haz clic en **"Cancel"** (solo queríamos crear la carpeta)

4. Ahora haz clic en **"Add file"** → **"Upload files"**

5. **Arrastra TODOS los archivos** desde tu carpeta local:
   - Ve a: `C:\Users\user\Desktop\WHATS\src\`
   - Arrastra **`server.ts`** directamente
   
6. **IMPORTANTE**: Antes de hacer commit, verifica que el nombre del archivo sea:
   ```
   src/server.ts
   ```
   NO `server.ts` (sin la carpeta)

7. Commit: `"Agregar src/server.ts"`

8. Haz clic en **"Commit changes"**

---

## Subir carpetas routes/, services/, utils/

### Opción A: Subir carpeta completa (Si GitHub lo permite)

1. Haz clic en **"Add file"** → **"Upload files"**

2. **Arrastra la carpeta completa** desde tu computadora:
   - Arrastra `C:\Users\user\Desktop\WHATS\src\routes\` (carpeta completa)
   - Arrastra `C:\Users\user\Desktop\WHATS\src\services\` (carpeta completa)
   - Arrastra `C:\Users\user\Desktop\WHATS\src\utils\` (carpeta completa)

3. GitHub debería crear automáticamente: `src/routes/`, `src/services/`, `src/utils/`

4. Commit: `"Agregar carpetas src/routes, src/services, src/utils"`

5. Haz clic en **"Commit changes"**

---

### Opción B: Crear archivos individualmente (Si la opción A no funciona)

#### Para routes/:

1. Haz clic en **"Add file"** → **"Create new file"**

2. Nombre: `src/routes/messages.ts`

3. Abre en tu editor local: `C:\Users\user\Desktop\WHATS\src\routes\messages.ts`

4. **Copia TODO el contenido** y pégalo en GitHub

5. Haz clic en **"Commit changes"** con mensaje: `"Agregar src/routes/messages.ts"`

6. Repite para:
   - `src/routes/reminders.ts`
   - `src/routes/webhooks.ts`

#### Para services/:

1. Repite el proceso para:
   - `src/services/scheduler.ts`
   - `src/services/twilio.ts`

#### Para utils/:

1. Repite el proceso para:
   - `src/utils/validation.ts`

---

## ✅ VERIFICACIÓN FINAL

Después de subir todo, verifica que tu repositorio tenga:

```
✅ src/server.ts
✅ src/routes/messages.ts
✅ src/routes/reminders.ts
✅ src/routes/webhooks.ts
✅ src/services/scheduler.ts
✅ src/services/twilio.ts
✅ src/utils/validation.ts
✅ prisma/schema.prisma
```

---

**💡 CONSEJO:** Si prefieres, puedo ayudarte a crear un script que prepare todos los archivos en un ZIP para que los subas de una vez.
