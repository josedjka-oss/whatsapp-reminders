# 📋 Instrucciones para Reorganizar Repositorio en GitHub (Interfaz Web)

## ✅ Estado Actual
- ✅ Archivos locales están correctos: `src/server.ts`, `prisma/schema.prisma`
- ⚠️ En GitHub hay archivos mal ubicados: `servidor.ts` en raíz, `esquema.prisma` en raíz

## 🎯 Objetivo
Mover los archivos a sus ubicaciones correctas directamente desde la interfaz web de GitHub.

---

## 📝 PASOS PASO A PASO

### **PASO 1: Ir al Repositorio**
1. Abre: https://github.com/josedjka-oss/recordatorios-de-whatsapp
2. Asegúrate de estar en la rama **`main`** (verifica arriba a la izquierda)

### **PASO 2: Eliminar Archivos Incorrectos de la Raíz**

#### 2.1 Eliminar `servidor.ts` (si existe en la raíz)
1. Haz clic en el archivo **`servidor.ts`** en la lista de archivos
2. Haz clic en el icono de **🗑️ basura/eliminar** (arriba a la derecha, al lado del lápiz ✏️)
3. Escribe el mensaje de commit: `"Eliminar servidor.ts duplicado de raíz"`
4. Selecciona **"Commit directly to the main branch"**
5. Haz clic en **"Commit changes"** (botón verde abajo)

#### 2.2 Eliminar `esquema.prisma` (si existe en la raíz)
1. Haz clic en el archivo **`esquema.prisma`** en la lista de archivos
2. Haz clic en el icono de **🗑️ basura/eliminar** (arriba a la derecha)
3. Escribe el mensaje de commit: `"Eliminar esquema.prisma duplicado de raíz"`
4. Selecciona **"Commit directly to the main branch"**
5. Haz clic en **"Commit changes"**

### **PASO 3: Verificar que Existen las Carpetas Correctas**

Verifica que existan estas carpetas:
- ✅ `src/` (debe existir)
- ⚠️ `prisma/` (puede no existir, la crearemos en el siguiente paso)

### **PASO 4: Crear Carpeta `prisma/` si No Existe**

Si **NO** ves la carpeta `prisma/` en GitHub:

1. Haz clic en **"Add file"** → **"Create new file"** (arriba a la derecha)
2. En el campo de nombre del archivo, escribe: **`prisma/schema.prisma`**
   - **IMPORTANTE**: El `/` después de `prisma` crea la carpeta automáticamente
3. **NO escribas nada** en el contenido todavía
4. Haz clic en **"Cancel"** (arriba a la izquierda)
   - Esto crea la carpeta `prisma/` vacía

### **PASO 5: Agregar `schema.prisma` a la Carpeta `prisma/`**

1. Haz clic en la carpeta **`prisma/`** (si existe) o créala con el paso anterior
2. Haz clic en **"Add file"** → **"Upload files"**
3. **Arrastra** el archivo `schema.prisma` desde tu carpeta local:
   - **Ubicación local**: `C:\Users\user\Desktop\WHATS\prisma\schema.prisma`
4. O haz clic en **"choose your files"** y selecciona el archivo
5. Desplázate hacia abajo y escribe el mensaje de commit: `"Agregar prisma/schema.prisma en ubicación correcta"`
6. Selecciona **"Commit directly to the main branch"**
7. Haz clic en **"Commit changes"** (botón verde)

### **PASO 6: Verificar que `src/server.ts` Existe**

1. Haz clic en la carpeta **`src/`**
2. Verifica que exista el archivo **`server.ts`** (NO `servidor.ts`)
3. Si **NO** existe `server.ts` pero existe `servidor.ts`:
   - Haz clic en `servidor.ts`
   - Haz clic en el icono de **✏️ editar** (lápiz)
   - **Copia TODO el contenido** del archivo
   - Haz clic en **"Cancel"**
   - Haz clic en **"Add file"** → **"Create new file"**
   - Nombre: `src/server.ts`
   - Pega el contenido copiado
   - Commit: `"Renombrar servidor.ts a server.ts"`
   - Haz clic en **"Commit changes"**
   - Luego elimina `servidor.ts` siguiendo el PASO 2

4. Si **NO** existe ningún archivo en `src/`:
   - Haz clic en **"Add file"** → **"Upload files"**
   - Arrastra **todos los archivos** de tu carpeta local `C:\Users\user\Desktop\WHATS\src\`:
     - `server.ts`
     - Carpeta `routes/` (arrastra toda la carpeta)
     - Carpeta `services/` (arrastra toda la carpeta)
     - Carpeta `utils/` (arrastra toda la carpeta)

### **PASO 7: Verificar Estructura Final**

Verifica que tu repositorio tenga esta estructura exacta:

```
recordatorios-de-whatsapp/
├── .gitignore ✅
├── package.json ✅
├── package-lock.json ✅
├── Procfile ✅
├── README.md ✅
├── render.yaml ✅
├── railway.json ✅
├── tsconfig.json ✅
├── src/
│   ├── server.ts ✅ (NO servidor.ts)
│   ├── routes/
│   │   ├── messages.ts ✅
│   │   ├── reminders.ts ✅
│   │   └── webhooks.ts ✅
│   ├── services/
│   │   ├── scheduler.ts ✅
│   │   └── twilio.ts ✅
│   └── utils/
│       └── validation.ts ✅
└── prisma/
    └── schema.prisma ✅ (NO esquema.prisma)
```

### **PASO 8: Verificación Final**

✅ **Checklist:**
- [ ] NO existe `servidor.ts` en la raíz
- [ ] NO existe `esquema.prisma` en la raíz
- [ ] Existe `src/server.ts` (NO `servidor.ts`)
- [ ] Existe `prisma/schema.prisma` (NO `esquema.prisma`)
- [ ] Todas las carpetas `src/routes/`, `src/services/`, `src/utils/` tienen sus archivos
- [ ] La estructura coincide con la lista del PASO 7

---

## 🚀 SIGUIENTE PASO DESPUÉS DE REORGANIZAR

Una vez que el repositorio esté reorganizado correctamente:

1. ✅ Ve a Render.com
2. ✅ Conecta el repositorio: `https://github.com/josedjka-oss/recordatorios-de-whatsapp`
3. ✅ Configura las variables de entorno
4. ✅ Despliega la aplicación

---

## ❓ ¿Problemas?

Si algún paso no funciona o tienes dudas:

1. Toma una captura de pantalla de la estructura actual en GitHub
2. Indica en qué paso específico estás teniendo problemas
3. Te ayudo a resolverlo paso a paso

---

## 💡 CONSEJO RÁPIDO

Si prefieres hacer todo más rápido:
- Puedes hacer varios commits en una sola sesión
- GitHub guarda tus cambios, así que puedes hacer los pasos 2-6 en cualquier orden
- Lo importante es que al final la estructura sea la correcta

---

**¡Listo! Sigue estos pasos y tu repositorio quedará perfectamente organizado. 🎉**
