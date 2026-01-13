# 🚀 Guía Paso a Paso: Desplegar en Vercel

## 📋 Prerrequisitos

- ✅ Cuenta en [Vercel](https://vercel.com) (puedes crear una con GitHub)
- ✅ Repositorio en GitHub con el código del frontend
- ✅ Backend funcionando en Render: `https://whatsapp-reminders-mzex.onrender.com`

---

## 📝 Paso 1: Crear Cuenta en Vercel (si no tienes)

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** o **"Log In"**
3. Elige **"Continue with GitHub"** (recomendado)
4. Autoriza Vercel para acceder a tus repositorios

---

## 📝 Paso 2: Conectar Repositorio

1. En el Dashboard de Vercel, haz clic en **"Add New Project"** o **"New Project"**
2. Si es la primera vez, verás una lista de tus repositorios de GitHub
3. Busca y selecciona: **`whatsapp-reminders`** (o el nombre de tu repo)
4. Haz clic en **"Import"**

---

## 📝 Paso 3: Configurar el Proyecto

### 3.1. Framework Preset
- Vercel detectará automáticamente **Next.js**
- ✅ Debe mostrar: **"Framework Preset: Next.js"**
- Si no lo detecta, selecciónalo manualmente

### 3.2. Root Directory ⚠️ IMPORTANTE
- Haz clic en **"Edit"** o **"Configure"** en Root Directory
- Cambia de `./` a: **`frontend`**
- Esto le dice a Vercel que el código Next.js está en la carpeta `frontend/`

### 3.3. Build Settings
- **Build Command:** `npm run build` (automático, no cambiar)
- **Output Directory:** `.next` (automático, no cambiar)
- **Install Command:** `npm install` (automático, no cambiar)

---

## 📝 Paso 4: Configurar Variables de Entorno

Antes de hacer deploy, configura las variables:

### 4.1. Variable Pública (NEXT_PUBLIC_API_URL)

1. En la sección **"Environment Variables"**, haz clic en **"Add"**
2. **Key:** `NEXT_PUBLIC_API_URL`
3. **Value:** `https://whatsapp-reminders-mzex.onrender.com`
4. **Environment:** Marca todas (Production, Preview, Development)
5. Haz clic en **"Save"**

### 4.2. Variable Secreta (ADMIN_PASSWORD) - Opcional

1. Haz clic en **"Add"** nuevamente
2. **Key:** `ADMIN_PASSWORD`
3. **Value:** `2023` (o tu password del backend)
4. **Environment:** Marca todas (Production, Preview, Development)
5. **IMPORTANTE:** Marca como **"Secret"** (oculta el valor)
6. Haz clic en **"Save"**

**Nota:** Si no configuras `ADMIN_PASSWORD`, el proxy funcionará sin autenticación (modo "solo personal").

---

## 📝 Paso 5: Desplegar

1. Revisa que todo esté configurado:
   - ✅ Framework: Next.js
   - ✅ Root Directory: `frontend`
   - ✅ Variables de entorno configuradas
2. Haz clic en **"Deploy"**
3. Espera 2-5 minutos mientras Vercel:
   - Clona el repositorio
   - Instala dependencias (`npm install`)
   - Compila el proyecto (`npm run build`)
   - Despliega

---

## 📝 Paso 6: Verificar el Despliegue

### 6.1. Ver el Estado

Durante el deploy, verás:
- ✅ "Building..." (compilando)
- ✅ "Deploying..." (desplegando)
- ✅ "Ready" (listo)

### 6.2. Obtener la URL

Una vez completado, Vercel te dará una URL como:
- `https://whatsapp-reminders-xxxxx.vercel.app`

### 6.3. Probar el Chat

1. Visita: `https://tu-proyecto.vercel.app/chat`
2. Deberías ver la interfaz tipo WhatsApp Web
3. Escribe un mensaje como: "Recuérdame mañana a las 5 pm pagar la luz"
4. Deberías ver la respuesta del asistente

---

## ✅ Verificación Final

### 1. Probar el Proxy

```bash
curl -X POST https://tu-proyecto.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola"}'
```

**Respuesta esperada:**
```json
{
  "reply": "Respuesta del asistente...",
  "actions": [...]
}
```

### 2. Verificar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables, verifica que:
- ✅ `NEXT_PUBLIC_API_URL` está configurada
- ✅ `ADMIN_PASSWORD` está configurada (si la usas)

---

## 🔧 Troubleshooting

### Error: "Build Failed"
- **Causa:** Root Directory incorrecto
- **Solución:** Verifica que Root Directory sea `frontend`

### Error: "Module not found"
- **Causa:** Dependencias faltantes
- **Solución:** Verifica que `frontend/package.json` tenga todas las dependencias

### Error: "NEXT_PUBLIC_API_URL no configurado"
- **Causa:** Variable de entorno no configurada
- **Solución:** Agrega `NEXT_PUBLIC_API_URL` en Vercel Settings

### Error: 500 en `/api/chat`
- **Causa:** Backend no responde o `ADMIN_PASSWORD` incorrecta
- **Solución:** 
  1. Verifica que el backend en Render esté funcionando
  2. Verifica que `ADMIN_PASSWORD` en Vercel coincida con la del backend

### Error: "Cannot GET /"
- **Causa:** Estás visitando la raíz, no `/chat`
- **Solución:** Visita `https://tu-proyecto.vercel.app/chat`

---

## 📝 Resumen de URLs

Después del despliegue:

- **Frontend (Vercel):** `https://tu-proyecto.vercel.app/chat`
- **Backend API (Render):** `https://whatsapp-reminders-mzex.onrender.com/api/ai`
- **Health Check (Render):** `https://whatsapp-reminders-mzex.onrender.com/health`

---

## 🎉 ¡Listo!

Una vez desplegado, podrás:
- ✅ Acceder al chat desde cualquier dispositivo
- ✅ Crear recordatorios con lenguaje natural
- ✅ Ver el historial del chat (guardado en localStorage)

---

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
