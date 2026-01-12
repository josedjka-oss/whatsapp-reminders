# 🔧 Reorganizar Repositorio en GitHub

## ✅ Estado Actual
- **Archivos locales**: ✅ Estructura correcta (`src/server.ts`, `prisma/schema.prisma`)
- **GitHub**: ❌ Archivos mal ubicados (`servidor.ts` en raíz, `esquema.prisma` en raíz)

## 🎯 Objetivo
Reorganizar el repositorio en GitHub para que coincida con la estructura local correcta.

---

## 📋 PASOS PARA REORGANIZAR EN GITHUB (Interfaz Web)

### **Paso 1: Verificar archivos duplicados/incorrectos**

En GitHub, verifica si existen estos archivos en la **raíz** del repositorio:
- ❌ `servidor.ts` (debe eliminarse si existe)
- ❌ `esquema.prisma` (debe eliminarse si existe)

### **Paso 2: Eliminar archivos incorrectos de la raíz**

1. Ve a: `https://github.com/josedjka-oss/recordatorios-de-whatsapp`
2. Haz clic en cada archivo incorrecto (`servidor.ts`, `esquema.prisma`)
3. Haz clic en el icono de **🗑️ basura/eliminar** (arriba a la derecha)
4. Escribe el mensaje de commit: `"Eliminar archivos duplicados de raíz"`
5. Haz clic en **"Commit changes"**

### **Paso 3: Verificar estructura correcta**

Verifica que estos archivos/carpetas existan en las ubicaciones correctas:

#### ✅ Estructura Correcta:
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

### **Paso 4: Si faltan archivos, agregarlos**

Si alguno de los archivos de la estructura correcta NO existe en GitHub:

1. Haz clic en **"Add file"** → **"Upload files"**
2. **Arrastra** el archivo desde tu carpeta local a GitHub
3. **Importante**: Arrastra a la carpeta correcta:
   - `src/server.ts` → Arrastra a la carpeta `src/`
   - `prisma/schema.prisma` → Arrastra a la carpeta `prisma/` (si no existe, créala primero)

### **Paso 5: Crear carpeta `prisma/` si no existe**

Si no existe la carpeta `prisma/`:

1. Haz clic en **"Add file"** → **"Create new file"**
2. Escribe: `prisma/schema.prisma` (el `/` crea la carpeta automáticamente)
3. **NO escribas contenido** todavía
4. Haz clic en **"Cancel"** (esto crea la carpeta vacía)
5. Ahora haz clic en **"Add file"** → **"Upload files"**
6. Arrastra `schema.prisma` a la carpeta `prisma/`

---

## 🚀 SOLUCIÓN AUTOMÁTICA (Si prefieres usar Git)

Si prefieres hacerlo automáticamente con Git, ejecuta este script:

```powershell
# Instalar Git si no está instalado (requiere permisos de administrador)
# winget install --id Git.Git -e --source winget

# O descarga desde: https://git-scm.com/download/win

# Luego ejecuta:
cd C:\Users\user\Desktop\WHATS
git clone https://github.com/josedjka-oss/recordatorios-de-whatsapp.git temp-repo
cd temp-repo
git checkout -b fix-structure

# Copiar archivos correctos
Copy-Item -Path "..\src\*" -Destination ".\src\" -Recurse -Force
Copy-Item -Path "..\prisma\schema.prisma" -Destination ".\prisma\schema.prisma" -Force

# Eliminar archivos incorrectos
if (Test-Path "servidor.ts") { Remove-Item "servidor.ts" }
if (Test-Path "esquema.prisma") { Remove-Item "esquema.prisma" }

# Verificar estructura
Write-Host "`n📁 Estructura actual:" -ForegroundColor Cyan
Get-ChildItem -Recurse -File | Select-Object FullName

# Commit
git add .
git commit -m "Reorganizar estructura: mover archivos a carpetas correctas"
git push origin fix-structure

# Crear Pull Request desde GitHub o hacer merge directo
```

---

## ✅ VERIFICACIÓN FINAL

Después de reorganizar, verifica que:

- ✅ `src/server.ts` existe (NO `servidor.ts`)
- ✅ `prisma/schema.prisma` existe (NO `esquema.prisma`)
- ✅ NO hay archivos duplicados en la raíz
- ✅ Todas las carpetas (`src/`, `prisma/`) existen con sus archivos

---

## 🎯 SIGUIENTE PASO

Una vez reorganizado el repositorio, continúa con:
1. Conectar el repositorio a Render.com
2. Configurar variables de entorno
3. Desplegar la aplicación

---

## 📞 Si tienes problemas

Si alguno de los archivos no se puede eliminar o mover:
1. Toma una captura de pantalla de la estructura actual en GitHub
2. Indica qué archivos específicos están causando problemas
3. Te ayudo a resolverlo paso a paso
