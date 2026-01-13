# 🔄 Rotar Credenciales de Twilio

**⚠️ IMPORTANTE:** Asumir que el Account SID y Auth Token están comprometidos después de estar en el historial de Git.

---

## 📋 Paso 1: Rotar Auth Token en Twilio

### Pasos en Twilio Console:

1. **Iniciar sesión en Twilio Console:**
   - Ve a: https://console.twilio.com/
   - Inicia sesión con tus credenciales

2. **Navegar a Configuración:**
   - En el menú lateral, haz clic en **Settings** (Configuración)
   - O ve directamente a: https://console.twilio.com/us1/account/settings/general

3. **Regenerar Auth Token:**
   - Busca la sección **"Auth Token"**
   - Haz clic en el botón **"Regenerate"** o **"Regenerar"**
   - ⚠️ **ADVERTENCIA:** Esto invalidará el token anterior inmediatamente
   - Copia el nuevo token (solo se muestra una vez)

4. **Guardar el nuevo token de forma segura:**
   - Usa un gestor de contraseñas (1Password, LastPass, etc.)
   - NO lo guardes en texto plano
   - NO lo compartas por email o chat

---

## 📋 Paso 2: Actualizar Auth Token en Render

### Pasos en Render Dashboard:

1. **Ir a tu servicio:**
   - Ve a: https://dashboard.render.com/
   - Selecciona tu servicio de WhatsApp Reminders

2. **Ir a Environment Variables:**
   - En el menú lateral, haz clic en **Environment**
   - O ve directamente a la sección de variables de entorno

3. **Actualizar TWILIO_AUTH_TOKEN:**
   - Busca la variable `TWILIO_AUTH_TOKEN`
   - Haz clic en el botón de editar (lápiz o "Edit")
   - Pega el nuevo token que copiaste de Twilio
   - Marca como **SECRET** (si no está marcado)
   - Haz clic en **Save** o **Guardar**

4. **Redesplegar el servicio:**
   - Render debería redesplegar automáticamente
   - O haz clic en **Manual Deploy** → **Deploy latest commit**

5. **Verificar que funciona:**
   - Espera a que el despliegue termine
   - Verifica los logs del servicio
   - Prueba enviar un mensaje de prueba

---

## 📋 Paso 3: Verificar Account SID

### ⚠️ Nota Importante:

**El Account SID NO se puede rotar.** Es un identificador permanente de tu cuenta de Twilio.

Sin embargo:
- El Account SID por sí solo NO es suficiente para acceder a tu cuenta
- Necesitas el Auth Token para autenticarte
- Como ya rotaste el Auth Token, el Account SID expuesto no es crítico

### Verificar Account SID en Render:

1. **Ir a Environment Variables en Render**
2. **Verificar que `TWILIO_ACCOUNT_SID` está configurado**
3. **NO es necesario cambiarlo** (es permanente)

---

## 📋 Paso 4: Verificar que Todo Funciona

### Prueba 1: Health Check
```bash
curl https://tu-backend.onrender.com/health
```

### Prueba 2: Crear Recordatorio de Prueba
```bash
curl -X POST https://tu-backend.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-admin-password" \
  -d '{
    "to": "whatsapp:+57xxxxxxxxxx",
    "body": "Prueba después de rotar token",
    "scheduleType": "once",
    "sendAt": "2025-01-15T10:00:00",
    "timezone": "America/Bogota"
  }'
```

### Prueba 3: Verificar Logs
- Revisa los logs de Render
- No debe haber errores de autenticación de Twilio
- Los mensajes deben enviarse correctamente

---

## ✅ Checklist

- [ ] Auth Token regenerado en Twilio Console
- [ ] Nuevo Auth Token guardado de forma segura
- [ ] `TWILIO_AUTH_TOKEN` actualizado en Render
- [ ] Servicio redesplegado en Render
- [ ] Health check funciona
- [ ] Recordatorio de prueba creado exitosamente
- [ ] Logs sin errores de autenticación
- [ ] Mensajes se envían correctamente

---

## 🚨 Advertencias

1. **El token anterior está invalidado:** Cualquier servicio que use el token anterior dejará de funcionar
2. **Actualizar en todos los lugares:** Si usas Twilio en otros servicios, actualiza el token allí también
3. **No compartir el nuevo token:** Mantén el nuevo token seguro y no lo compartas

---

## 📝 Notas

- El Account SID no se puede rotar, pero no es crítico si solo se expuso el ejemplo
- El Auth Token es lo más importante y ya fue rotado
- Render redesplegará automáticamente cuando actualices las variables de entorno
