# 📤 SUBIR ARCHIVOS CORRECTOS A GITHUB

## ✅ Estado Actual
- ✅ Archivos incorrectos eliminados (servidor.ts, rutas/, servicios/, utilidades/)
- ✅ Carpeta `prisma/` creada con `schema.prisma`

## 🎯 Objetivo
Subir la estructura correcta desde tu computadora a GitHub.

---

## 📋 PASOS DETALLADOS

### **PASO 1: Preparar archivos en tu computadora**

1. **Abre el Explorador de Windows**
2. **Navega a**: `C:\Users\user\Desktop\WHATS\src\`
3. **Verifica que veas**:
   - `server.ts` (archivo)
   - `routes/` (carpeta)
   - `services/` (carpeta)
   - `utils/` (carpeta)

---

### **PASO 2: Ir a la carpeta src/ en GitHub**

1. **Abre en tu navegador**: https://github.com/josedjka-oss/recordatorios-de-whatsapp
2. **Haz clic en la carpeta `src/`** (o en `origen/` si ese es el nombre)
3. **Verifica que estés dentro de la carpeta** (deberías ver la ruta: `recordatorios-de-whatsapp/src/` o similar)

---

### **PASO 3: Subir archivos - MÉTODO 1 (Arrastrar y soltar)**

1. **Haz clic en "Add file"** → **"Upload files"** (arriba a la derecha)

2. **En el Explorador de Windows**, selecciona los archivos/carpetas:
   - Abre: `C:\Users\user\Desktop\WHATS\src\`
   - **Selecciona**:
     - ✅ `server.ts` (Ctrl + clic para seleccionar)
     - ✅ `routes` (carpeta completa - Ctrl + clic)
     - ✅ `services` (carpeta completa - Ctrl + clic)
     - ✅ `utils` (carpeta completa - Ctrl + clic)

3. **Arrastra todos los archivos/carpetas seleccionados** al área de arrastrar de GitHub (donde dice "Drag files here to add them to your repository")

4. **IMPORTANTE**: Verifica que GitHub muestre:
   ```
   src/server.ts
   src/routes/messages.ts
   src/routes/reminders.ts
   src/routes/webhooks.ts
   src/services/scheduler.ts
   src/services/twilio.ts
   src/utils/validation.ts
   ```

---

### **PASO 3 ALTERNATIVO: Subir archivos - MÉTODO 2 (Uno por uno)**

Si el método de arrastrar no funciona, sube cada carpeta individualmente:

#### 3.1 Subir `server.ts`:
1. Haz clic en **"Add file"** → **"Upload files"**
2. Haz clic en **"choose your files"**
3. Selecciona: `C:\Users\user\Desktop\WHATS\src\server.ts`
4. **Antes de hacer commit**, verifica que el nombre del archivo sea: `server.ts`
5. Si aparece `src/server.ts`, está bien
6. Si aparece solo `server.ts`, cámbialo a `src/server.ts`

#### 3.2 Subir carpeta `routes/`:
1. Haz clic en **"Add file"** → **"Upload files"**
2. Arrastra o selecciona **todos los archivos** dentro de `routes/`:
   - `messages.ts`
   - `reminders.ts`
   - `webhooks.ts`
3. **Antes de hacer commit**, verifica que los nombres sean:
   - `routes/messages.ts` (NO `rutas/messages.ts`)
   - `routes/reminders.ts`
   - `routes/webhooks.ts`

#### 3.3 Subir carpeta `services/`:
1. Haz clic en **"Add file"** → **"Upload files"**
2. Arrastra o selecciona **todos los archivos** dentro de `services/`:
   - `scheduler.ts`
   - `twilio.ts`
3. **Antes de hacer commit**, verifica que los nombres sean:
   - `services/scheduler.ts` (NO `servicios/scheduler.ts`)
   - `services/twilio.ts`

#### 3.4 Subir carpeta `utils/`:
1. Haz clic en **"Add file"** → **"Upload files"**
2. Arrastra o selecciona el archivo `utils/validation.ts`
3. **Antes de hacer commit**, verifica que el nombre sea:
   - `utils/validation.ts` (NO `utilidades/validation.ts`)

---

### **PASO 4: Hacer Commit**

1. **Desplázate hacia abajo** en la página de GitHub
2. **Escribe el mensaje de commit**:
   ```
   Corregir estructura: subir archivos con nombres en inglés
   ```
3. **Selecciona**: **"Commit directly to the main branch"**
4. **Haz clic en "Commit changes"** (botón verde)

---

## ✅ VERIFICACIÓN FINAL

Después del commit, verifica que tu repositorio tenga esta estructura:

```
recordatorios-de-whatsapp/
├── prisma/
│   └── schema.prisma ✅
├── src/
│   ├── server.ts ✅
│   ├── routes/
│   │   ├── messages.ts ✅
│   │   ├── reminders.ts ✅
│   │   └── webhooks.ts ✅
│   ├── services/
│   │   ├── scheduler.ts ✅
│   │   └── twilio.ts ✅
│   └── utils/
│       └── validation.ts ✅
├── package.json ✅
├── Procfile ✅
├── render.yaml ✅
└── ... (otros archivos)
```

---

## 🚀 SIGUIENTE PASO

Una vez que todo esté correcto:
1. ✅ Continuamos con Render.com
2. ✅ Configuramos variables de entorno
3. ✅ Desplegamos la aplicación

---

## ❓ ¿Problemas?

Si algún archivo no se sube correctamente:
1. Verifica que los nombres sean en inglés (routes, services, utils)
2. Verifica que estés dentro de la carpeta `src/` en GitHub
3. Intenta subir una carpeta a la vez si hay problemas
