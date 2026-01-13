# 🚀 Despliegue: Frontend (Vercel) + Backend (Render)

Guía completa para desplegar la aplicación separada en dos servicios.

---

## 📋 Arquitectura

- **Backend (Render):** Express + Prisma + PostgreSQL + Scheduler + Twilio
- **Frontend (Vercel):** Next.js + React + Tailwind CSS

---

## 🔧 Parte 1: Backend en Render

### 1.1 Configurar Backend

El backend ya está configurado. Solo necesitas:

1. **Variables de Entorno en Render:**
   ```
   DATABASE_URL=postgresql://...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   MY_WHATSAPP_NUMBER=whatsapp:+57...
   APP_TIMEZONE=America/Bogota
   OPENAI_API_KEY=sk-...
   ADMIN_PASSWORD=2023
   FRONTEND_URL=https://tu-app.vercel.app  # ← Agregar después de desplegar frontend
   ```

2. **Build Command:**
   ```
   npm run render-build
   ```

3. **Start Command:**
   ```
   npm start
   ```

### 1.2 Verificar Backend

- Health check: `https://tu-backend.onrender.com/health`
- API: `https://tu-backend.onrender.com/api/reminders`

---

## 🎨 Parte 2: Frontend en Vercel

### 2.1 Preparar Frontend

1. **Navegar a la carpeta frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Probar localmente (opcional):**
   ```bash
   npm run dev
   ```
   - Abre: http://localhost:3000/chat
   - Configura `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3000
     ```

### 2.2 Desplegar en Vercel

#### Opción A: Desde GitHub (Recomendado)

1. **Sube el código a GitHub** (si no lo has hecho):
   ```bash
   git add frontend/
   git commit -m "Agregar frontend separado"
   git push origin main
   ```

2. **Conecta a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Haz clic en "Add New Project"
   - Selecciona tu repositorio

3. **Configura el proyecto:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (detectado automáticamente)
   - **Build Command:** `npm run build` (automático)
   - **Output Directory:** `.next` (automático)

4. **Variables de Entorno:**
   - Agrega:
     ```
     NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
     ```

5. **Desplegar:**
   - Haz clic en "Deploy"
   - Espera 1-2 minutos
   - Obtendrás una URL como: `https://tu-app.vercel.app`

#### Opción B: Desde CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Iniciar sesión:**
   ```bash
   vercel login
   ```

3. **Desplegar:**
   ```bash
   cd frontend
   vercel
   ```

4. **Seguir las instrucciones:**
   - ¿Set up and deploy? → **Y**
   - ¿Which scope? → Selecciona tu cuenta
   - ¿Link to existing project? → **N**
   - ¿Project name? → `whatsapp-reminders-frontend` (o el que prefieras)
   - ¿Directory? → `./` (enter)
   - ¿Override settings? → **N**

5. **Agregar variable de entorno:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Ingresa: https://tu-backend.onrender.com
   ```

6. **Redesplegar:**
   ```bash
   vercel --prod
   ```

### 2.3 Actualizar CORS en Backend

Después de obtener la URL de Vercel:

1. **Ve a Render Dashboard**
2. **Settings → Environment**
3. **Agrega/Actualiza:**
   ```
   FRONTEND_URL=https://tu-app.vercel.app
   ```
4. **Redeploy** el servicio

---

## ✅ Verificación

### Backend (Render)
- ✅ Health: `https://tu-backend.onrender.com/health`
- ✅ API: `https://tu-backend.onrender.com/api/reminders`
- ✅ CORS configurado para Vercel

### Frontend (Vercel)
- ✅ URL: `https://tu-app.vercel.app/chat`
- ✅ Login funciona (password: `2023`)
- ✅ Chat se conecta al backend
- ✅ OpenAI procesa instrucciones

---

## 🔄 Actualizaciones

### Actualizar Frontend

1. Haz cambios en `frontend/`
2. Commit y push a GitHub
3. Vercel despliega automáticamente

### Actualizar Backend

1. Haz cambios en `src/`
2. Commit y push a GitHub
3. Render despliega automáticamente (si está configurado)

---

## 🐛 Troubleshooting

### Frontend no se conecta al backend

1. Verifica `NEXT_PUBLIC_API_URL` en Vercel
2. Verifica `FRONTEND_URL` en Render
3. Revisa la consola del navegador para errores CORS

### Error CORS

1. Asegúrate de que `FRONTEND_URL` en Render sea exactamente la URL de Vercel
2. Verifica que el backend tenga CORS habilitado
3. Revisa los logs de Render

### Build falla en Vercel

1. Verifica que `Root Directory` sea `frontend`
2. Revisa los logs de build en Vercel
3. Asegúrate de que `package.json` esté en `frontend/`

---

## 📝 Resumen de URLs

- **Backend API:** `https://tu-backend.onrender.com`
- **Frontend Chat:** `https://tu-app.vercel.app/chat`
- **Health Check:** `https://tu-backend.onrender.com/health`

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en:
- **Backend:** Render (24/7, con scheduler)
- **Frontend:** Vercel (CDN global, rápido)
