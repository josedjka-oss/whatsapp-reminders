# 🌐 URL Pública de la Interfaz Web

## ✅ URL de Producción

**URL Pública:** `https://whatsapp-reminders-mzex.onrender.com/chat`

Esta es la URL donde estará disponible la interfaz web de chat para gestionar recordatorios con lenguaje natural.

---

## 🏗️ Arquitectura de Despliegue

### **Opción 1: Todo en Render (Recomendado)**

**Configuración:**
- **Servidor:** Express + Next.js integrados
- **Archivo principal:** `server-with-nextjs.ts`
- **Puerto:** 3000 (o el que Render asigne)
- **URL Base:** `https://whatsapp-reminders-mzex.onrender.com`

**Rutas:**
- `/chat` → Interfaz web de chat
- `/api/*` → Endpoints de API (reminders, messages, ai)
- `/webhooks/*` → Webhooks de Twilio
- `/health` → Health check

### **Opción 2: Separado (Desarrollo Local)**

**Desarrollo:**
- **Backend:** `http://localhost:3000` (Express)
- **Frontend:** `http://localhost:3001` (Next.js)

**Producción:**
- Todo integrado en un solo servidor en Render

---

## 🔧 Configuración en Render

### **Build Command:**

```bash
npm run render-build
```

Esto ejecuta:
1. `npm install --include=dev`
2. `prisma generate`
3. `tsc` (compila TypeScript)
4. `npx prisma db push --skip-generate`
5. `next build` (compila Next.js)

### **Start Command:**

```bash
npm start
```

Esto ejecuta:
- `node dist/server-with-nextjs.js`

### **Variables de Entorno en Render:**

```env
# Backend
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
MY_WHATSAPP_NUMBER=whatsapp:+57...
APP_TIMEZONE=America/Bogota
NODE_ENV=production
PORT=10000

# OpenAI
OPENAI_API_KEY=sk-...

# Seguridad
ADMIN_PASSWORD=tu_password_seguro

# Frontend (opcional)
NEXT_PUBLIC_API_URL=https://whatsapp-reminders-mzex.onrender.com
```

---

## 📋 Estructura de URLs

### **URLs Públicas:**

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/chat` | Interfaz web de chat | Público (con password) |
| `/api/reminders` | API de recordatorios | Público (sin auth) |
| `/api/messages` | API de mensajes | Público (sin auth) |
| `/api/ai` | API de OpenAI | Protegido (password) |
| `/webhooks/twilio/whatsapp` | Webhook Twilio | Público (validación firma) |
| `/health` | Health check | Público |

### **Ejemplo de Uso:**

1. **Acceder a la interfaz:**
   ```
   https://whatsapp-reminders-mzex.onrender.com/chat
   ```

2. **Ingresar password:**
   - Se solicita al acceder por primera vez
   - Se guarda en localStorage del navegador

3. **Usar el chat:**
   - Escribir instrucciones en lenguaje natural
   - El sistema procesa y ejecuta acciones
   - Ver confirmaciones visuales

---

## 🚀 Despliegue Paso a Paso

### **1. Preparar Código:**

```bash
# Asegurarse de que todo esté commiteado
git add .
git commit -m "Agregar interfaz web con OpenAI"
git push origin main
```

### **2. Configurar Render:**

1. Ve a Render Dashboard
2. Selecciona tu servicio `whatsapp-reminders`
3. Ve a **Settings**
4. Actualiza **Build Command:**
   ```
   npm run render-build
   ```
5. Verifica **Start Command:**
   ```
   npm start
   ```
6. Agrega variables de entorno:
   - `OPENAI_API_KEY`
   - `ADMIN_PASSWORD`

### **3. Desplegar:**

Render detectará automáticamente el push a GitHub y desplegará.

O haz **Manual Deploy** desde Render Dashboard.

### **4. Verificar:**

1. Espera 3-5 minutos a que termine el build
2. Ve a: `https://whatsapp-reminders-mzex.onrender.com/chat`
3. Deberías ver la pantalla de login
4. Ingresa tu password
5. ¡Listo! Ya puedes usar el chat

---

## 🔍 Verificación

### **Checklist de Verificación:**

- [ ] Build completado sin errores
- [ ] Servidor iniciado correctamente
- [ ] `/health` responde OK
- [ ] `/chat` muestra la interfaz de login
- [ ] Login funciona con `ADMIN_PASSWORD`
- [ ] Chat responde a instrucciones
- [ ] OpenAI procesa correctamente
- [ ] Recordatorios se crean desde el chat

---

## 📝 Notas Importantes

1. **URL Pública:**
   - La URL es completamente pública
   - La seguridad está en el password (`ADMIN_PASSWORD`)
   - Rate limiting protege contra abuso

2. **HTTPS:**
   - Render proporciona HTTPS automáticamente
   - No necesitas configurar certificados

3. **Dominio Personalizado (Opcional):**
   - Puedes configurar un dominio personalizado en Render
   - Ejemplo: `chat.tudominio.com`
   - Render te guiará en la configuración

4. **Monitoreo:**
   - Usa `/health` para monitoreo
   - Render tiene logs en tiempo real
   - Puedes configurar alertas

---

## 🆘 Troubleshooting

### **Error: "Cannot find module 'next'"**

**Solución:**
- Verifica que `next` esté en `devDependencies`
- Ejecuta `npm install` nuevamente

### **Error: "Next.js build failed"**

**Solución:**
- Verifica que `app/` tenga los archivos correctos
- Revisa los logs de build en Render

### **Error: "404 en /chat"**

**Solución:**
- Verifica que `server-with-nextjs.ts` esté compilado
- Verifica que Next.js se haya compilado correctamente
- Revisa los logs del servidor

---

**URL Final:** `https://whatsapp-reminders-mzex.onrender.com/chat` 🚀
