# 🔐 Variables de Entorno - Vercel y Render

Guía completa de variables de entorno necesarias para desplegar la aplicación.

---

## 📋 Render.com (Backend)

### Variables Requeridas

```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # ⚠️ SECRET
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
MY_WHATSAPP_NUMBER=whatsapp:+57xxxxxxxxxx

# Base de Datos
DATABASE_URL=postgresql://user:password@host:port/dbname  # ⚠️ SECRET (automático si usas Render PostgreSQL)

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # ⚠️ SECRET

# Autenticación
ADMIN_PASSWORD=tu-password-seguro-aqui  # ⚠️ SECRET
# O alternativamente:
AI_ADMIN_KEY=tu-password-seguro-aqui  # ⚠️ SECRET

# Configuración
APP_TIMEZONE=America/Bogota
PORT=10000  # Render asigna automáticamente, pero puedes especificar

# Opcionales (con defaults)
DEFAULT_REMINDER_HOUR=9
DEFAULT_REMINDER_MINUTE=0
AI_PENDING_TTL_MINUTES=30  # TTL para opciones pendientes (default: 30 minutos)
NODE_ENV=production
```

### Cómo Configurar en Render

1. Ve a tu servicio en Render Dashboard
2. Click en **Environment** (en el menú lateral)
3. Click en **Add Environment Variable**
4. Agrega cada variable:
   - **Key**: Nombre de la variable (ej: `TWILIO_AUTH_TOKEN`)
   - **Value**: Valor de la variable
   - **Mark as Secret**: ✅ Para variables sensibles (tokens, passwords, etc.)

### Variables que DEBEN ser SECRET

- ✅ `TWILIO_AUTH_TOKEN`
- ✅ `OPENAI_API_KEY`
- ✅ `ADMIN_PASSWORD` o `AI_ADMIN_KEY`
- ✅ `DATABASE_URL` (si lo configuras manualmente)

---

## 📋 Vercel (Frontend)

### Variables Requeridas

```bash
# Backend URL (pública)
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com

# Autenticación (secreto - solo para el proxy)
ADMIN_PASSWORD=tu-password-seguro-aqui  # ⚠️ SECRET (debe coincidir con Render)
```

### Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **Environment Variables**
3. Agrega cada variable:

#### Variable Pública (NEXT_PUBLIC_API_URL)
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://tu-backend.onrender.com`
- **Environment**: Production, Preview, Development (todas)
- **Mark as Secret**: ❌ (es pública)

#### Variable Secreta (ADMIN_PASSWORD)
- **Key**: `ADMIN_PASSWORD`
- **Value**: `tu-password-seguro-aqui` (debe ser el mismo que en Render)
- **Environment**: Production, Preview, Development (todas)
- **Mark as Secret**: ✅

---

## 🔄 Flujo de Autenticación

### Antes (Frontend → Backend directo)
```
Browser → POST /api/ai (Render)
         Header: Authorization: Bearer 2023
```

### Ahora (Frontend → Vercel Proxy → Backend)
```
Browser → POST /api/chat (Vercel)
         Sin headers (público)
         
Vercel Proxy → POST /api/ai (Render)
              Header: x-admin-password: tu-password-seguro
              Header: Authorization: Bearer tu-password-seguro
```

---

## ✅ Checklist de Configuración

### Render (Backend)
- [ ] `TWILIO_ACCOUNT_SID` configurado
- [ ] `TWILIO_AUTH_TOKEN` configurado como SECRET
- [ ] `TWILIO_WHATSAPP_FROM` configurado
- [ ] `MY_WHATSAPP_NUMBER` configurado
- [ ] `DATABASE_URL` configurado (automático si usas Render PostgreSQL)
- [ ] `OPENAI_API_KEY` configurado como SECRET
- [ ] `ADMIN_PASSWORD` configurado como SECRET
- [ ] `APP_TIMEZONE` configurado (opcional, default: America/Bogota)
- [ ] `DEFAULT_REMINDER_HOUR` configurado (opcional, default: 9)
- [ ] `DEFAULT_REMINDER_MINUTE` configurado (opcional, default: 0)

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` configurado (pública)
- [ ] `ADMIN_PASSWORD` configurado como SECRET (debe coincidir con Render)

---

## 🧪 Verificar Configuración

### Backend (Render)
```bash
curl https://tu-backend.onrender.com/health
```

### Frontend (Vercel)
```bash
curl https://tu-frontend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}'
```

---

## 🔒 Seguridad

### ✅ Buenas Prácticas

1. **Nunca commits secrets:**
   - No agregar `.env` al repositorio
   - Usar variables de entorno en Render/Vercel

2. **Passwords fuertes:**
   - `ADMIN_PASSWORD` debe ser al menos 16 caracteres
   - Usar caracteres aleatorios, números y símbolos

3. **Rotación periódica:**
   - Cambiar `ADMIN_PASSWORD` cada 3-6 meses
   - Rotar `TWILIO_AUTH_TOKEN` si se compromete

4. **Separación de entornos:**
   - Diferentes passwords para desarrollo/producción
   - Diferentes `OPENAI_API_KEY` si es necesario

---

## 📝 Notas

- `NEXT_PUBLIC_API_URL` es pública porque se usa en el browser
- `ADMIN_PASSWORD` en Vercel es secreto y solo lo usa el proxy server-side
- El proxy de Vercel (`/api/chat`) maneja la autenticación automáticamente
- El frontend ya no necesita manejar tokens de autenticación

---

## 🚀 Despliegue

1. **Render:**
   - Configurar todas las variables de entorno
   - Desplegar desde GitHub
   - Verificar que el servicio esté "Live"

2. **Vercel:**
   - Conectar repositorio GitHub
   - Configurar variables de entorno
   - Desplegar automáticamente

3. **Verificar:**
   - Frontend accesible en Vercel
   - Backend accesible en Render
   - Proxy funcionando correctamente
