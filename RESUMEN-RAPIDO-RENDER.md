# ⚡ RESUMEN RÁPIDO: Desplegar en Render.com

## 🎯 7 PASOS PRINCIPALES

### **PASO 1: Crear Base de Datos PostgreSQL** (2 minutos)
1. Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Name: `whatsapp-reminders-db`
3. Database: `whatsapp_reminders`
4. Plan: **STARTER ($7/mes)** para 24/7
5. **"Create Database"**

---

### **PASO 2: Crear Servicio Web** (3 minutos)
1. Render Dashboard → **"New +"** → **"Web Service"**
2. Conectar repositorio: `josedjka-oss/recordatorios-de-whatsapp`
3. Configurar:
   - **Name**: `whatsapp-reminders`
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: **STARTER ($7/mes)** para 24/7
4. Vincular base de datos: `whatsapp-reminders-db`

---

### **PASO 3: Variables de Entorno** (5 minutos)

Agregar estas 10 variables:

| Key | Value | Secret |
|-----|-------|--------|
| `NODE_ENV` | `production` | ❌ |
| `PORT` | `10000` | ❌ |
| `APP_TIMEZONE` | `America/Bogota` | ❌ |
| `DATABASE_URL` | (automático) | ✅ |
| `TWILIO_ACCOUNT_SID` | (tu Account SID) | ❌ |
| `TWILIO_AUTH_TOKEN` | (tu Auth Token) | ✅ |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | ❌ |
| `MY_WHATSAPP_NUMBER` | `whatsapp:+57XXXXXXXXXX` | ❌ |
| `PUBLIC_BASE_URL` | (placeholder por ahora) | ❌ |
| `TWILIO_WEBHOOK_PATH` | `/webhooks/twilio/whatsapp` | ❌ |

---

### **PASO 4: Crear Servicio** (3-5 minutos)
1. **"Create Web Service"**
2. Esperar a que Render despliegue
3. Verificar logs que todo funcione

---

### **PASO 5: Obtener URL y Actualizar PUBLIC_BASE_URL** (1 minuto)
1. Copiar URL pública: `https://whatsapp-reminders-xxxx.onrender.com`
2. Ir a **Environment** en Render
3. Actualizar `PUBLIC_BASE_URL` con la URL real
4. Render reiniciará automáticamente

---

### **PASO 6: Configurar Webhook de Twilio** (2 minutos)
1. Twilio Console → **Messaging** → **Try it out** → **Configuration**
2. Webhook URL: `https://TU-URL-RENDER.onrender.com/webhooks/twilio/whatsapp`
3. Método: **POST**
4. **Save**

---

### **PASO 7: Verificar** (2 minutos)
1. Health check: `https://TU-URL-RENDER.onrender.com/health`
2. Ver logs en Render: Debe mostrar `[SERVER] 🚀 Servidor escuchando`
3. Probar crear recordatorio vía curl o Postman

---

## ✅ CHECKLIST RÁPIDO

- [ ] Base de datos PostgreSQL creada
- [ ] Servicio Web creado
- [ ] 10 variables de entorno configuradas
- [ ] `PUBLIC_BASE_URL` actualizada con URL real
- [ ] Webhook de Twilio configurado
- [ ] Health check responde OK
- [ ] Logs muestran servidor funcionando

---

## 📄 GUÍA COMPLETA

Para ver todos los detalles paso a paso, abre:
**`PASO-A-PASO-RENDER-COMPLETO.md`**

---

## 🚀 ¡LISTO!

Tu aplicación estará funcionando 24/7 en Render.com.

---

## 🔗 ENLACES RÁPIDOS

- **Render Dashboard**: https://dashboard.render.com
- **Twilio Console**: https://console.twilio.com/
- **Repositorio GitHub**: https://github.com/josedjka-oss/recordatorios-de-whatsapp
