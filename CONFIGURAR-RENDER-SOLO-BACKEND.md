# ⚙️ Configurar Render para SOLO Backend

## 🎯 Objetivo

Render debe servir **SOLO el backend** (Express API), NO el frontend. El frontend se despliega en Vercel.

---

## 📋 Pasos en Render Dashboard

### 1. Ir a la Configuración del Servicio

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Selecciona tu servicio web (WhatsApp Reminders)
3. Ve a **Settings** (Configuración)

### 2. Actualizar Start Command

En la sección **"Start Command"**, cambia a:

```
NODE_ENV=production node dist/server.js
```

**IMPORTANTE:** 
- ❌ NO uses `dist/server-with-nextjs.js` (ese incluye el frontend antiguo)
- ✅ Usa `dist/server.js` (solo backend)

### 3. Verificar Build Command

Asegúrate de que el **Build Command** sea:

```
npm run render-build
```

Que ejecuta:
```
npm install --include=dev && npx prisma generate && npx prisma db push --skip-generate && npm run build
```

### 4. Guardar y Redesplegar

1. Haz clic en **"Save Changes"**
2. Render redesplegará automáticamente
3. O haz clic en **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ Verificación

Después del redespliegue:

1. **Backend API debe funcionar:**
   ```bash
   curl https://whatsapp-reminders-mzex.onrender.com/health
   ```
   Debe responder: `{"status":"ok"}`

2. **Backend API con autenticación:**
   ```bash
   curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/ai \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 2023" \
     -d '{"text": "Hola"}'
   ```

3. **NO debe servir frontend:**
   - `https://whatsapp-reminders-mzex.onrender.com/` puede mostrar un error 404 o un mensaje simple
   - Esto es **correcto** - el frontend está en Vercel

---

## 📝 Resumen

- **Render:** Solo backend API (Express)
- **Vercel:** Frontend Next.js con `/chat`
- **Comunicación:** Frontend (Vercel) → Proxy `/api/chat` (Vercel) → Backend `/api/ai` (Render)

---

## 🔗 URLs Finales

- **Backend API (Render):** `https://whatsapp-reminders-mzex.onrender.com/api/ai`
- **Frontend (Vercel):** `https://whatsapp-reminders.vercel.app/chat`
- **Health Check (Render):** `https://whatsapp-reminders-mzex.onrender.com/health`
