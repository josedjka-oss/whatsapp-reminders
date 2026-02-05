# ✅ Verificar Configuración Final - Checklist

## 🎉 Despliegue Exitoso

**Estado del servicio:**
- ✅ Build exitoso
- ✅ Servidor corriendo en puerto 10000
- ✅ Scheduler iniciado correctamente
- ✅ Health checks funcionando
- ✅ Base de datos conectada

---

## 📋 Checklist de Configuración

### Paso 1: Verificar Variables de Entorno en Render

**Ve a**: **Render** → Tu servicio → **Environment**

**Verifica que estas variables estén configuradas:**

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=[El Auth Token de la subcuenta]
TWILIO_WHATSAPP_FROM=whatsapp:+573242145488
MY_WHATSAPP_NUMBER=whatsapp:+573242145488
```

**Importante:**
- ⚠️ El `TWILIO_ACCOUNT_SID` debe ser de la **subcuenta**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ⚠️ El `TWILIO_AUTH_TOKEN` debe ser de la **subcuenta** (no el de la cuenta principal)
- ⚠️ El `TWILIO_WHATSAPP_FROM` debe ser: `whatsapp:+573242145488`

**Si NO están configuradas:**
1. Agrega cada variable
2. Guarda los cambios
3. Reinicia el servicio

---

### Paso 2: Verificar que el Código Esté Actualizado

**El Content SID debe ser:**
```typescript
const WHATSAPP_TEMPLATE_CONTENT_SID = "HXce444bd2a556f0b2372943243e8485ff";
```

**Ya está actualizado en el código** ✅

---

### Paso 3: Verificar el Sender en Twilio

**Ve a**: **Twilio Console** → **Messaging** → **Senders** → **WhatsApp senders**

**Verifica que:**
- ✅ El sender `+573242145488` esté **"Online"**
- ✅ El **WhatsApp Business Account ID** sea: `1281121247401247`
- ✅ El **Quality rating** esté disponible o mejorando

---

### Paso 4: Verificar el Template en Twilio

**Ve a**: **Twilio Console** → **Messaging** → **Content Template Builder**

**Verifica que:**
- ✅ El template `recordatorio` esté **"Approved"**
- ✅ El **Content SID** sea: `HXce444bd2a556f0b2372943243e8485ff`
- ✅ El **WhatsApp Category** sea: `Utility`

---

## 🧪 Paso 5: Probar Enviar un Mensaje

### Opción 1: Desde el Frontend

1. **Ve a**: Tu aplicación frontend (Vercel)
2. **Crea un recordatorio** de prueba:
   - Fecha: Hoy o mañana
   - Hora: Cualquier hora cercana
   - Mensaje: "Prueba de recordatorio"
   - Número destino: Tu número de WhatsApp personal
3. **Envía** el recordatorio
4. **Verifica** que recibas el mensaje en WhatsApp

### Opción 2: Desde la API Directamente

**Puedes probar con curl:**

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Recuérdame mañana a las 5pm pagar la luz"
  }'
```

**O crear un recordatorio manual:**

```bash
curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/reminders \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: [TU_ADMIN_PASSWORD]" \
  -d '{
    "phoneNumber": "+573024002656",
    "reminderText": "Prueba de recordatorio",
    "scheduledDate": "2026-02-06T17:00:00.000Z",
    "frequency": "once"
  }'
```

---

## 📋 Paso 6: Verificar los Logs

### En Render:

1. **Ve a**: **Render** → Tu servicio → **Logs**

2. **Busca** mensajes relacionados con:
   - `[TWILIO]` - Logs de Twilio
   - `[SCHEDULER]` - Logs del scheduler
   - Errores o advertencias

3. **Verifica** que:
   - ✅ No haya errores de autenticación
   - ✅ Los mensajes se estén enviando correctamente
   - ✅ El Content SID se esté usando correctamente

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: "Template not found" o "Content SID invalid"

**Síntoma:**
- Error en los logs: "Template not found"

**Solución:**
- ✅ Verifica que el Content SID sea: `HXce444bd2a556f0b2372943243e8485ff`
- ✅ Verifica que el template esté aprobado en Twilio
- ✅ Verifica que estés usando la subcuenta correcta

### Error 2: "Number not authorized" o "Sender not found"

**Síntoma:**
- Error: "Number not authorized"

**Solución:**
- ✅ Verifica que el sender esté "Online" en Twilio
- ✅ Verifica que el número `+573242145488` esté correctamente configurado
- ✅ Verifica las variables de entorno en Render

### Error 3: "Account SID or Auth Token invalid"

**Síntoma:**
- Error de autenticación en Twilio

**Solución:**
- ✅ Verifica que `TWILIO_ACCOUNT_SID` sea de la subcuenta: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ✅ Verifica que `TWILIO_AUTH_TOKEN` sea de la subcuenta
- ✅ Reinicia el servicio en Render

---

## 📋 Checklist Completo

- [ ] Servicio desplegado correctamente ✅
- [ ] Variables de entorno configuradas en Render:
  - [ ] `TWILIO_ACCOUNT_SID` = `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - [ ] `TWILIO_AUTH_TOKEN` = (Auth Token de la subcuenta)
  - [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+573242145488`
  - [ ] `MY_WHATSAPP_NUMBER` = `whatsapp:+573242145488`
- [ ] Servicio reiniciado después de actualizar variables
- [ ] Sender verificado en Twilio (estado "Online")
- [ ] Template verificado en Twilio (estado "Approved")
- [ ] Content SID verificado: `HXce444bd2a556f0b2372943243e8485ff`
- [ ] Probé enviar un mensaje de prueba
- [ ] Verifiqué que recibí el mensaje en WhatsApp
- [ ] Revisé los logs en Render
- [ ] Verifiqué que no haya errores

---

## 🎯 Resumen

**Estado actual:**
- ✅ Servicio desplegado y funcionando
- ✅ Scheduler iniciado correctamente
- ✅ Health checks funcionando
- ⏳ Pendiente: Verificar variables de entorno y probar envío

**Próximos pasos:**
1. Verificar variables de entorno en Render
2. Reiniciar el servicio si es necesario
3. Probar enviar un mensaje
4. Verificar que recibas el mensaje en WhatsApp

---

## ✅ Próximos Pasos Inmediatos

1. **Verifica** las variables de entorno en Render
2. **Reinicia** el servicio si actualizaste las variables
3. **Prueba** enviar un mensaje desde tu aplicación
4. **Verifica** que recibas el mensaje en WhatsApp
5. **Revisa** los logs en Render para verificar que todo funcione

**¿Necesitas ayuda con algún paso específico?** Puedo guiarte en verificar las variables de entorno o probar el envío de mensajes.
