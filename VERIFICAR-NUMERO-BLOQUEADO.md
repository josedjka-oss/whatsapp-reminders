# 🔍 Cómo Verificar si un Número de WhatsApp Está Bloqueado

## 🎯 Objetivo

Verificar si el número `+573043577875` está bloqueado, restringido o tiene problemas por usarlo en Facebook/Meta en lugar de WhatsApp Business API.

---

## 🔍 Método 1: Verificar en Twilio Console

### Paso 1: Revisar Estado del Sender

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el número: `+573043577875`
3. Revisa:

**Estado del Sender:**
- ✅ **Online** = Activo, no bloqueado
- ⚠️ **Pending** = Pendiente de verificación
- ❌ **Blocked** = Bloqueado
- ❌ **Locked** = Bloqueado (error 63051)
- ❌ **Unavailable** = No disponible

**Quality Rating:**
- ✅ **Green** = Buen rating, no bloqueado
- ⚠️ **Yellow** = Rating medio, puede tener restricciones
- ❌ **Red** = Rating bajo, puede estar bloqueado
- ❌ **Unavailable** = No disponible (puede indicar problema)

**Throughput:**
- ✅ Si muestra un límite (ej: 80 MPS) = Funciona
- ❌ Si muestra 0 o "N/A" = Puede estar bloqueado

### Paso 2: Revisar Mensajes Recientes

1. Ve a: **Monitor** → **Logs** → **Messaging**
   - O: https://console.twilio.com/us1/monitor/logs/messaging
2. Filtra por:
   - **From**: `whatsapp:+573043577875`
3. Revisa los últimos mensajes:
   - **Status**: ¿Qué estados tienen? (delivered, undelivered, failed)
   - **Error Code**: ¿Hay errores? (63051, 21608, etc.)
   - **Error Message**: ¿Qué dice?

---

## 📱 Método 2: Verificar en Meta WhatsApp Business Manager

### Paso 1: Revisar Estado del Número

1. Ve a: **https://business.facebook.com/whatsapp**
2. Busca el número `+573043577875` en todas las cuentas
3. Revisa:

**Estado del Número:**
- ✅ **Verified** = Verificado, no bloqueado
- ⚠️ **Pending** = Pendiente de verificación
- ❌ **Blocked** = Bloqueado
- ❌ **Restricted** = Restringido
- ❌ **Suspended** = Suspendido

### Paso 2: Revisar Restricciones

1. Si encuentras el número, haz clic en él
2. Revisa:
   - **Status**: Estado actual
   - **Restrictions**: ¿Hay restricciones?
   - **Quality Rating**: Rating de calidad
   - **Complaints**: ¿Hay quejas?

---

## 🔍 Método 3: Usar el Endpoint de la API

### Verificar Estado del Número

```bash
# Verificar el número específico
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/573043577875
```

**Respuesta esperada:**
```json
{
  "number": "whatsapp:+573043577875",
  "status": "locked",  // ← Estado del número
  "lastMessageStatus": "undelivered",
  "lastError": {
    "code": 63051,  // ← Código de error
    "message": "WhatsApp Business Account is Locked"  // ← Mensaje de error
  },
  "statistics": {
    "totalMessages": 10,
    "successCount": 0,
    "errorCount": 5  // ← Cantidad de errores
  }
}
```

**Interpretación:**
- `status: "locked"` = Número bloqueado
- `status: "verified"` = Número verificado y funcionando
- `errorCode: 63051` = Cuenta bloqueada
- `errorCount > 0` = Hay problemas

### Ver Últimos Mensajes

```bash
# Ver últimos mensajes del número
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=10
```

Busca mensajes con:
- `from: "whatsapp:+573043577875"`
- `status: "undelivered"` o `"failed"`
- `errorCode: 63051` u otros códigos de error

---

## 🚨 Método 4: Verificar Códigos de Error Específicos

### Códigos de Error Comunes:

**63051 - WhatsApp Business Account is Locked**
- ❌ **Significado**: Cuenta bloqueada
- 🔍 **Causa**: Puede ser por uso en Facebook/Meta incorrecto
- 🔧 **Solución**: Contactar soporte de Twilio

**21608 - Number not verified (Sandbox mode)**
- ⚠️ **Significado**: Número no verificado
- 🔍 **Causa**: Número no está en WhatsApp Business API
- 🔧 **Solución**: Verificar el número en Meta

**21614 - Number does not have WhatsApp**
- ❌ **Significado**: Número no tiene WhatsApp
- 🔍 **Causa**: Número no es de WhatsApp
- 🔧 **Solución**: Usar otro número

**21211 - Invalid number**
- ❌ **Significado**: Número inválido
- 🔍 **Causa**: Formato incorrecto
- 🔧 **Solución**: Verificar formato

---

## 🔍 Método 5: Verificar en Meta Business Suite

### Paso 1: Revisar Estado del Negocio

1. Ve a: **https://business.facebook.com/settings**
2. Selecciona el portfolio donde está el número
3. Ve a: **"Verificación del negocio"**
4. Revisa:
   - **Estado**: ¿Verificado, En revisión, Rechazado?
   - **Restricciones**: ¿Hay restricciones?

### Paso 2: Revisar Alertas

1. Ve a: **https://business.facebook.com/notifications**
2. Busca alertas relacionadas con:
   - WhatsApp Business
   - Restricciones
   - Bloqueos
   - Verificaciones

---

## 📊 Método 6: Verificar en los Logs del Backend

### Revisar Logs en Render

1. Ve a: **Render Dashboard** → Tu servicio → **Logs**
2. Busca líneas que contengan:
   - `[TWILIO] ❌ Error`
   - `errorCode: 63051`
   - `WhatsApp Business Account is Locked`
   - `undelivered`

**Ejemplo de log:**
```
[TWILIO] ❌ Error enviando mensaje: Error: Twilio error: 63051 - WhatsApp Business Account is Locked
```

---

## ✅ Checklist de Verificación

Usa esta lista para verificar el estado:

- [ ] **Twilio Console:**
  - [ ] Estado del sender: ¿Online, Blocked, Locked?
  - [ ] Quality rating: ¿Green, Yellow, Red, Unavailable?
  - [ ] Throughput: ¿Tiene límite o es 0?

- [ ] **Meta WhatsApp Business Manager:**
  - [ ] ¿El número está listado?
  - [ ] Estado: ¿Verified, Blocked, Restricted?
  - [ ] ¿Hay restricciones o quejas?

- [ ] **API Endpoint:**
  - [ ] Status: ¿locked, verified, error?
  - [ ] Error code: ¿63051 u otro?
  - [ ] Error count: ¿Cuántos errores hay?

- [ ] **Logs del Backend:**
  - [ ] ¿Hay errores relacionados?
  - [ ] ¿Qué códigos de error aparecen?

---

## 🎯 Interpretación de Resultados

### Si el Número Está Bloqueado:

**Indicadores:**
- ❌ Estado: "Locked" o "Blocked" en Twilio
- ❌ Error code: 63051
- ❌ Quality rating: "Unavailable" o "Red"
- ❌ Error count > 0 en los mensajes

**Causas Posibles:**
- Uso incorrecto en Facebook/Meta
- Violación de políticas de WhatsApp
- Número usado en múltiples plataformas
- Verificación incompleta

**Solución:**
- Contactar soporte de Twilio
- Verificar en Meta Business Suite
- Considerar usar otro número

### Si el Número NO Está Bloqueado:

**Indicadores:**
- ✅ Estado: "Online" o "Verified"
- ✅ Quality rating: "Green" o válido
- ✅ Throughput: Tiene límite
- ✅ No hay errores recientes

**Entonces:**
- El número está funcionando
- El problema puede ser otra cosa (configuración, templates, etc.)

---

## 📋 Resumen

**Para verificar si el número está bloqueado:**

1. **Revisa Twilio Console** → Estado del sender y quality rating
2. **Revisa Meta WhatsApp Business Manager** → Estado del número
3. **Usa el endpoint de la API** → Status y error codes
4. **Revisa los logs** → Errores recientes

**Si encuentras:**
- Estado "Locked" o "Blocked"
- Error code 63051
- Quality rating "Unavailable"

**Entonces el número está bloqueado** y necesitas contactar soporte o usar otro número.

---

## 🔧 Próximos Pasos

**Si el número está bloqueado:**
1. Contacta soporte de Twilio
2. O usa el otro número que mencionaste
3. O espera 24 horas y usa `+573043577875` cuando se libere

**¿Quieres que te ayude a verificar el estado del número ahora?** Puedo guiarte paso a paso para revisar cada método.
