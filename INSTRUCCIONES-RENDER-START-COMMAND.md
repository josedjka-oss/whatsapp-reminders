# ⚙️ Configurar Start Command en Render

## 🎯 Problema Actual

Render está usando `server-with-nextjs.js` que incluye el frontend antiguo. Necesitamos cambiar a `server.js` que es **solo el backend**.

---

## 📋 Pasos en Render Dashboard

### 1. Ir a la Configuración

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Selecciona tu servicio web: **WhatsApp Reminders**
3. Haz clic en **"Settings"** (Configuración) en el menú lateral

### 2. Actualizar Start Command

En la sección **"Start Command"**, cambia a:

```
NODE_ENV=production node dist/server.js
```

**IMPORTANTE:**
- ❌ **NO uses:** `node dist/server-with-nextjs.js` (ese incluye el frontend antiguo)
- ✅ **USA:** `node dist/server.js` (solo backend API)

### 3. Verificar Build Command

Asegúrate de que el **Build Command** sea:

```
npm run render-build
```

### 4. Guardar y Redesplegar

1. Haz clic en **"Save Changes"** al final de la página
2. Render redesplegará automáticamente
3. O ve a **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Verificación Después del Cambio

### 1. Verificar que el Backend Funciona

```bash
curl https://whatsapp-reminders-mzex.onrender.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "checks": {
    "database": "ok",
    "scheduler": "ok"
  }
}
```

### 2. Verificar que NO Sirve Frontend

Al visitar `https://whatsapp-reminders-mzex.onrender.com/` deberías ver:

```json
{
  "message": "WhatsApp Reminders API",
  "version": "1.0.0",
  "endpoints": {
    "reminders": "/api/reminders",
    "messages": "/api/messages",
    "ai": "/api/ai",
    "webhooks": "/webhooks/twilio/whatsapp",
    "health": "/health"
  }
}
```

**Esto es CORRECTO** - el backend solo sirve la API, no el frontend.

### 3. Probar el Endpoint de IA

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2023" \
  -d '{"text": "Hola"}'
```

---

## 📝 Resumen de Arquitectura

### Render (Backend)
- **URL:** `https://whatsapp-reminders-mzex.onrender.com`
- **Función:** Solo API (Express)
- **Endpoints:** `/api/ai`, `/api/reminders`, `/api/messages`, `/webhooks/twilio/whatsapp`
- **Start Command:** `NODE_ENV=production node dist/server.js`

### Vercel (Frontend)
- **URL:** `https://tu-proyecto.vercel.app`
- **Función:** Frontend Next.js con `/chat`
- **Comunicación:** Frontend → Proxy `/api/chat` (Vercel) → Backend `/api/ai` (Render)

---

## 🔄 Flujo Completo

1. Usuario visita: `https://tu-proyecto.vercel.app/chat`
2. Usuario escribe mensaje
3. Frontend llama: `POST /api/chat` (proxy en Vercel)
4. Proxy llama: `POST https://whatsapp-reminders-mzex.onrender.com/api/ai` (backend en Render)
5. Backend procesa con OpenAI y responde
6. Proxy devuelve respuesta al frontend
7. Frontend muestra respuesta al usuario

---

## ⚠️ Nota Importante

Después de cambiar el Start Command, Render redesplegará automáticamente. El proceso puede tardar 2-5 minutos.

Una vez completado, `https://whatsapp-reminders-mzex.onrender.com/` mostrará solo la API (sin frontend), que es el comportamiento esperado.
