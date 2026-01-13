# 🚀 Desplegar Frontend en Vercel

Guía rápida para desplegar el frontend de WhatsApp Reminders en Vercel.

---

## 📋 Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio en GitHub con el código del frontend
3. Backend desplegado en Render (URL: `https://whatsapp-reminders-mzex.onrender.com`)

---

## 🚀 Pasos para Desplegar

### 1. Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (si el repo tiene frontend/ y backend/)
   - O si el repo es solo frontend, deja el root como está

### 2. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega:

**Variables Públicas:**
- `NEXT_PUBLIC_API_URL` = `https://whatsapp-reminders-mzex.onrender.com`

**Variables Secretas (en Settings → Environment Variables):**
- `ADMIN_PASSWORD` = Tu password de admin del backend (la misma que usas en Render)

### 3. Configuración de Build

Vercel detectará automáticamente Next.js, pero verifica:

- **Build Command:** `npm run build` (automático)
- **Output Directory:** `.next` (automático)
- **Install Command:** `npm install` (automático)

### 4. Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el build
3. Vercel te dará una URL como: `https://tu-proyecto.vercel.app`

---

## ✅ Verificar Despliegue

1. Visita la URL de Vercel
2. Navega a `/chat`
3. Prueba enviar un mensaje como: "Recuérdame mañana a las 5 pm pagar la luz"
4. Deberías ver la respuesta del asistente

---

## 🔧 Troubleshooting

### Error: "NEXT_PUBLIC_API_URL no configurado"
- Verifica que la variable de entorno esté configurada en Vercel
- Reinicia el despliegue después de agregar variables

### Error: "No se pudo conectar con el servidor"
- Verifica que el backend en Render esté funcionando
- Verifica que `NEXT_PUBLIC_API_URL` apunte a la URL correcta
- Verifica que `ADMIN_PASSWORD` sea correcta

### Error 401/403
- Verifica que `ADMIN_PASSWORD` en Vercel coincida con la del backend en Render

---

## 📝 Notas

- El frontend llama a `/api/chat` (proxy en Vercel) que luego llama al backend en Render
- El historial del chat se guarda en `localStorage` del navegador
- Cada usuario tiene su propio historial local

---

## 🔗 URLs

- **Backend (Render):** https://whatsapp-reminders-mzex.onrender.com
- **Frontend (Vercel):** Tu URL de Vercel
- **Chat:** `https://tu-proyecto.vercel.app/chat`
