# 🚀 Comandos para Desarrollo Local y Despliegue en Vercel

## 📋 Desarrollo Local

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/`:

```env
NEXT_PUBLIC_API_URL=https://whatsapp-reminders-mzex.onrender.com
ADMIN_PASSWORD=tu_password_aqui
```

**Nota:** `ADMIN_PASSWORD` es opcional. Si no lo configuras, el proxy funcionará sin autenticación (modo "solo personal").

### 3. Ejecutar en Desarrollo

```bash
cd frontend
npm run dev
```

El servidor se iniciará en: `http://localhost:3000`

### 4. Probar la Conexión

Abre tu navegador y ve a: `http://localhost:3000/chat`

O prueba con curl:

```bash
# Probar el proxy directamente
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola, ¿qué recordatorios tengo?"}'
```

**Respuesta esperada:**
```json
{
  "reply": "Tu respuesta del asistente aquí...",
  "actions": [...]
}
```

---

## 🌐 Desplegar en Vercel

### Opción 1: Desde el Dashboard de Vercel

1. **Conectar Repositorio:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Haz clic en **"Add New Project"**
   - Selecciona tu repositorio de GitHub

2. **Configurar Proyecto:**
   - **Framework Preset:** Next.js (detectado automáticamente)
   - **Root Directory:** `frontend` ⚠️ **IMPORTANTE**
   - **Build Command:** `npm run build` (automático)
   - **Output Directory:** `.next` (automático)

3. **Configurar Variables de Entorno:**
   - En la configuración del proyecto, ve a **Settings → Environment Variables**
   - Agrega:
     - `NEXT_PUBLIC_API_URL` = `https://whatsapp-reminders-mzex.onrender.com` (pública)
     - `ADMIN_PASSWORD` = `tu_password_aqui` (secreta, opcional)

4. **Desplegar:**
   - Haz clic en **"Deploy"**
   - Espera a que termine el build

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Navegar al frontend
cd frontend

# Iniciar sesión en Vercel
vercel login

# Desplegar
vercel

# Seguir las instrucciones:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N (primera vez) o Y (si ya existe)
# - What's your project's name? whatsapp-reminders-frontend
# - In which directory is your code located? ./
# - Want to override the settings? N

# Agregar variables de entorno
vercel env add NEXT_PUBLIC_API_URL
# Valor: https://whatsapp-reminders-mzex.onrender.com

vercel env add ADMIN_PASSWORD
# Valor: tu_password_aqui (opcional)

# Redesplegar con las nuevas variables
vercel --prod
```

---

## ✅ Verificar Despliegue

1. **Visitar la URL de Vercel:**
   - Ejemplo: `https://whatsapp-reminders.vercel.app/chat`

2. **Probar la conexión:**
   - Escribe un mensaje como: "Recuérdame mañana a las 5 pm pagar la luz"
   - Deberías ver la respuesta del asistente

3. **Probar con curl:**
   ```bash
   curl -X POST https://whatsapp-reminders.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"text": "Hola"}'
   ```

---

## 🔧 Troubleshooting

### Error: "NEXT_PUBLIC_API_URL no configurado"
- Verifica que la variable esté en `.env.local` (local) o en Vercel (producción)
- Reinicia el servidor después de agregar variables

### Error: "No se pudo conectar con el servidor"
- Verifica que el backend en Render esté funcionando
- Verifica que `NEXT_PUBLIC_API_URL` apunte a la URL correcta
- Prueba hacer curl directo al backend: `curl https://whatsapp-reminders-mzex.onrender.com/health`

### Error 401/403
- Si configuraste `ADMIN_PASSWORD`, verifica que sea correcta
- Si no configuraste `ADMIN_PASSWORD`, el backend debe permitir requests sin auth (modo "solo personal")

### Build falla en Vercel
- Verifica que **Root Directory** esté configurado como `frontend`
- Verifica que `package.json` esté en `frontend/`
- Revisa los logs de build en Vercel

---

## 📝 Notas Importantes

- **Root Directory en Vercel:** Debe ser `frontend` si tu repo tiene frontend/ y backend/
- **ADMIN_PASSWORD es opcional:** Si no lo configuras, el proxy funcionará sin autenticación
- **El proxy NO expone ADMIN_PASSWORD:** Solo se usa server-side en Vercel
- **Historial local:** El historial del chat se guarda en `localStorage` del navegador
