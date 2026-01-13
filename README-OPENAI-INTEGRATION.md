# 🤖 Integración OpenAI - Chat de Recordatorios

Guía completa para configurar y usar el chat con OpenAI para gestionar recordatorios de WhatsApp.

---

## 📋 Requisitos

1. **Backend desplegado en Render** con todas las variables de entorno configuradas
2. **Frontend desplegado en Vercel** (o localmente)
3. **OPENAI_API_KEY** configurada en Render

---

## 🔧 Configuración en Render

### 1. Agregar OPENAI_API_KEY

1. Ve a tu servicio en Render Dashboard
2. **Settings → Environment**
3. Agrega nueva variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (tu API key de OpenAI)
   - **Mark as Secret:** ✅ Sí
4. **Save Changes**
5. **Manual Deploy** para aplicar cambios

### 2. Verificar Variables de Entorno

Asegúrate de tener estas variables configuradas:

```env
# Backend (Render)
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
MY_WHATSAPP_NUMBER=whatsapp:+57...
APP_TIMEZONE=America/Bogota
OPENAI_API_KEY=sk-...  # ← NUEVA
ADMIN_PASSWORD=2023
FRONTEND_URL=https://tu-app.vercel.app  # Opcional, para CORS
```

### 3. Verificar CORS

El backend ya está configurado para permitir:
- `*.vercel.app` (todos los subdominios de Vercel)
- `FRONTEND_URL` (si está configurada)
- `localhost:3000` y `localhost:3001` (desarrollo)

---

## 🎨 Configuración en Vercel

### 1. Variable de Entorno

En Vercel Dashboard:
1. Ve a tu proyecto
2. **Settings → Environment Variables**
3. Agrega:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://tu-backend.onrender.com`
   - **Environment:** Production, Preview, Development
4. **Save**
5. **Redeploy** si es necesario

---

## 💬 Uso del Chat

### Acceder al Chat

1. Abre: `https://tu-app.vercel.app/chat`
2. Ingresa password: `2023`
3. ¡Listo! Ya puedes usar el chat

### Ejemplos de Frases Válidas

#### Crear Recordatorios

```
"Enviar mensaje a Juan todos los días a las 5 pm"
"Recuérdame pagar la luz el 15 de cada mes"
"Envía 'Hola' a +573001234567 mañana a las 10 am"
"Programa un mensaje para María todos los días a las 8:30 am"
```

#### Listar Recordatorios

```
"¿Qué recordatorios tengo activos?"
"Muéstrame mis recordatorios"
"Lista todos los recordatorios"
```

#### Cancelar Recordatorios

```
"Cancela el recordatorio de Juan"
"Elimina el recordatorio de pagar la luz"
"Detén el recordatorio para María"
```

#### Modificar Recordatorios

```
"Cambia la hora del recordatorio de Juan a las 6 pm"
"Actualiza el mensaje del recordatorio de la luz"
```

---

## 🏗️ Arquitectura

### Backend (`src/services/openai.ts`)

- **Servicio OpenAI:** Maneja toda la lógica de OpenAI
- **Tools:** `create_reminder`, `update_reminder`, `cancel_reminder`, `list_reminders`
- **Tool Loop:** Ejecuta tools y obtiene respuesta final
- **Timezone:** `America/Bogota` por defecto
- **Fechas Relativas:** Soporta "hoy", "mañana", "en X horas"

### Backend (`src/routes/ai.ts`)

- **Endpoint:** `POST /api/ai`
- **Autenticación:** Requiere `ADMIN_PASSWORD` (header `Authorization: Bearer 2023`)
- **Rate Limit:** 50 requests por 15 minutos
- **Validación:** Verifica `OPENAI_API_KEY` antes de procesar

### Frontend (`frontend/app/chat/page.tsx`)

- **UI:** Chat intuitivo con mensajes diferenciados
- **Estados:** "Pensando...", errores, acciones
- **Conexión:** Botón para probar conexión con backend
- **Autenticación:** Password guardado en localStorage

---

## 🔍 Troubleshooting

### Error: "OPENAI_API_KEY no configurado"

**Solución:**
1. Verifica que `OPENAI_API_KEY` esté en Render
2. Asegúrate de que esté marcada como **Secret**
3. Haz **Manual Deploy** después de agregarla

### Error: "No autorizado" (401/403)

**Solución:**
1. Verifica que el password sea `2023`
2. Revisa que el header `Authorization: Bearer 2023` se esté enviando
3. Verifica que `ADMIN_PASSWORD` esté configurada en Render

### Error CORS

**Solución:**
1. Verifica que `FRONTEND_URL` en Render sea exactamente la URL de Vercel
2. Asegúrate de que el backend permita `*.vercel.app`
3. Revisa los logs de Render para ver qué origin está bloqueando

### El chat no responde

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa errores en Network tab
3. Verifica que `NEXT_PUBLIC_API_URL` esté configurada en Vercel
4. Prueba la conexión con el botón "✅" en el header

### OpenAI no entiende las instrucciones

**Solución:**
1. Sé más específico: "Enviar mensaje a Juan todos los días a las 5 pm"
2. Si falta información, el asistente preguntará
3. Usa números de teléfono completos si no hay contacto guardado

---

## 📊 Monitoreo

### Logs en Render

```bash
# Ver logs en tiempo real
# Render Dashboard → Logs
```

Busca:
- `[OPENAI]` - Logs del servicio OpenAI
- `[AI]` - Logs del endpoint `/api/ai`
- `[CORS]` - Logs de CORS

### Verificar Funcionamiento

1. **Health Check:**
   ```
   GET https://tu-backend.onrender.com/health
   ```

2. **Probar Endpoint AI:**
   ```bash
   curl -X POST https://tu-backend.onrender.com/api/ai \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 2023" \
     -d '{"text": "¿Qué recordatorios tengo activos?"}'
   ```

---

## 🎯 Resultado Final

Una URL `/chat` donde puedes:
- ✅ Escribir instrucciones en español natural
- ✅ Crear recordatorios automáticamente
- ✅ Listar recordatorios activos
- ✅ Cancelar recordatorios
- ✅ Modificar recordatorios
- ✅ Ver confirmaciones visuales

**Todo sin formularios complejos, solo lenguaje natural.** 🚀
