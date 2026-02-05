# ➕ Cómo Agregar un Número de WhatsApp Business - Paso a Paso

## ✅ Situación Confirmada

- ✅ Negocio: **Verificado**
- ✅ Cuenta: **Aprobada**
- ❌ **Números de teléfono: 0** (No hay números agregados)

**Esto explica por qué el número anterior estaba bloqueado.** Necesitas agregar un número.

---

## 🎯 Paso 1: Decidir Qué Número Usar

Tienes estas opciones:

### Opción A: Usar el Teléfono del Negocio
- **Número**: `+576017294750`
- **Ventaja**: Ya está asociado al negocio verificado
- **Desventaja**: Necesitas verificar que sea un número de WhatsApp Business válido

### Opción B: Usar el Número Anterior (si está disponible)
- **Número**: `+573043577875`
- **Ventaja**: Ya estaba configurado en Twilio
- **Desventaja**: Estaba bloqueado, puede necesitar desbloqueo

### Opción C: Solicitar un Nuevo Número en Twilio
- **Ventaja**: Número nuevo, sin problemas previos
- **Desventaja**: Requiere comprar/registrar en Twilio

**Recomendación**: Usa **+576017294750** (teléfono del negocio) si es un número de WhatsApp Business válido.

---

## 📱 Paso 2: Agregar el Número en WhatsApp Business Manager

### Método 1: Desde la Página de Detalles

1. En la página de detalles de "ultralents", busca la sección: **"Números de teléfono"**
2. Deberías ver un botón o enlace que diga:
   - **"Agregar número"** o **"Add Phone Number"**
   - **"Conectar número"** o **"Connect Phone Number"**
   - **"Registrar número"** o **"Register Phone Number"**
   - O simplemente un botón **"+"** o **"Agregar"**

3. Haz clic en ese botón
4. Sigue el proceso que aparezca

### Método 2: Desde el Menú Principal

Si no ves el botón en los detalles:

1. Vuelve a la lista de cuentas
2. Haz clic directamente en el nombre **"ultralents"** (no en "Details")
3. Busca la sección **"Números de teléfono"**
4. Haz clic en **"Agregar"** o **"Add"**

### Método 3: Desde Configuración

1. Ve a: **https://business.facebook.com/settings/whatsapp-business**
2. Busca la cuenta **"ultralents"**
3. Haz clic en **"Agregar número"**

---

## 🔄 Paso 3: Proceso de Agregar Número

Cuando hagas clic en "Agregar número", el proceso típicamente incluye:

1. **Ingresar el número:**
   - Formato: `+576017294750` (con código de país)
   - O seleccionar de una lista si ya está en Meta

2. **Verificar el número:**
   - Puede pedirte un código de verificación por SMS
   - O puede verificar automáticamente si ya está en Meta

3. **Conectar con el negocio:**
   - Asociar el número con el negocio verificado
   - Confirmar permisos

4. **Aprobar templates:**
   - Puede pedirte aprobar templates para ese número

---

## ⚠️ Si No Ves el Botón "Agregar Número"

Si no encuentras el botón para agregar números:

### Verificar Permisos

1. Asegúrate de tener **"Control total"** de la cuenta
2. Verifica que seas administrador del portfolio "ultralents"
3. Si no tienes permisos, contacta al administrador principal

### Alternativa: Desde Twilio

Si no puedes agregar desde Meta, puedes:

1. **Registrar el número en Twilio primero:**
   - Ve a: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
   - Registra el número allí

2. **Luego conectar con Meta:**
   - En Twilio, busca la opción para conectar con Meta Business Suite
   - Sigue el proceso de conexión

---

## ✅ Paso 4: Verificar que se Agregó

Después de agregar el número:

1. **Vuelve a la página de detalles** de "ultralents"
2. **Busca "Números de teléfono"**
3. **Deberías ver:**
   - El número agregado (ej: +576017294750)
   - Estado: "Verificado" o "Pendiente"
   - Fecha de verificación

---

## 🔧 Paso 5: Verificar en Twilio Console

Una vez agregado en Meta, verifica en Twilio:

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el número que agregaste
3. Verifica que:
   - ✅ Esté listado
   - ✅ Estado sea "Verified" o "Active"
   - ❌ NO esté "Locked" o "Blocked"

---

## 📝 Paso 6: Actualizar Configuración en Render

Una vez que el número esté verificado:

1. Ve a: **Render Dashboard** → Tu servicio → **Environment**
2. Busca: `TWILIO_WHATSAPP_FROM`
3. Actualiza a: `whatsapp:+576017294750` (o el número que agregaste)
4. Guarda los cambios
5. Render reiniciará automáticamente

---

## 🧪 Paso 7: Probar el Nuevo Número

Después de actualizar:

1. **Verifica el estado:**
   ```bash
   curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
   ```

2. **Crea un recordatorio de prueba:**
   - Ve a: https://whatsapp-reminders.vercel.app/chat
   - Escribe: "Recuérdame en 5 minutos probar el nuevo número"
   - Verifica que llegue al WhatsApp

---

## 🚨 Problemas Comunes

### "No puedo agregar números"

**Solución:**
- Verifica que tengas "Control total" de la cuenta
- Asegúrate de ser administrador del portfolio
- Contacta al administrador principal si es necesario

### "El número ya está en uso"

**Solución:**
- El número puede estar en otra cuenta de Meta
- Busca en todas las cuentas de WhatsApp Business Manager
- O contacta soporte de Meta para transferirlo

### "El número no es válido para WhatsApp Business"

**Solución:**
- Verifica que el número tenga WhatsApp activo
- Puede necesitar ser un número de WhatsApp Business
- Considera solicitar un nuevo número en Twilio

---

## 📞 Si Necesitas Ayuda

Comparte:
- ¿Ves el botón "Agregar número"?
- ¿Qué mensaje aparece cuando intentas agregar?
- ¿Qué número quieres usar? (+576017294750 u otro)

---

## ✅ Checklist

- [ ] Decidí qué número usar (+576017294750 u otro)
- [ ] Encontré el botón "Agregar número" en WhatsApp Business Manager
- [ ] Agregué el número siguiendo el proceso
- [ ] Verifiqué que el número aparezca en "Números de teléfono"
- [ ] Verifiqué el estado del número en Twilio Console
- [ ] Actualicé `TWILIO_WHATSAPP_FROM` en Render
- [ ] Probé enviando un mensaje de prueba

---

## 🎯 Resumen

**Acción inmediata:**
1. En la página de detalles de "ultralents", busca **"Números de teléfono"**
2. Busca un botón **"Agregar"** o **"Add Phone Number"**
3. Haz clic y sigue el proceso
4. Ingresa el número: **+576017294750** (o el que decidas usar)
5. Completa la verificación
6. Actualiza la configuración en Render

¿Ves el botón para agregar números? Si no lo ves, comparte una captura de pantalla o describe qué opciones aparecen en la sección "Números de teléfono".
