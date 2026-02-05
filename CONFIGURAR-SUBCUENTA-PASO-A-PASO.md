# ✅ Configurar Subcuenta - Paso a Paso

## 🎯 Estado Actual

**Subcuenta creada:**
- ✅ Nombre: "Ultralents Nueva"
- ✅ Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ✅ Auth Token: (necesitas mostrarlo y guardarlo)

---

## 📋 Paso 1: Obtener el Auth Token Completo

### Proceso:

1. **En la página actual**, busca el botón: **"Show"** junto al Auth Token
2. **Haz clic en "Show"** para ver el token completo
3. **Copia el token completo** y guárdalo en un lugar seguro
4. **NO lo compartas** con nadie

**Importante:**
- ⚠️ Este token es diferente al de tu cuenta principal
- ⚠️ Guárdalo bien, lo necesitarás para actualizar Render

---

## 📋 Paso 2: Agregar el Número de Teléfono

### Opción A: Si Ya Tienes el Número `+573242145488`

1. **Ve a**: **Phone Numbers** → **Manage** → **Active numbers**
2. **Busca** si el número `+573242145488` está disponible
3. **Si NO está**, necesitas comprarlo o transferirlo

### Opción B: Comprar un Número Nuevo

1. **Ve a**: **Phone Numbers** → **Manage** → **Buy a number**
2. **Selecciona**:
   - **Country**: Colombia
   - **Capabilities**: SMS, Voice (si lo necesitas)
3. **Busca** números disponibles
4. **Compra** el número que necesites

### Opción C: Usar el Número `+573242145488` (Si Ya Lo Tienes)

**Si el número ya está en tu cuenta principal:**
- ⚠️ Puede que necesites transferirlo a la subcuenta
- ⚠️ O comprar uno nuevo para la subcuenta

**Recomendación:**
- Si tienes el número `+573242145488`, úsalo
- Si no, compra uno nuevo o transfiere el que tengas

---

## 📋 Paso 3: Crear el Sender de WhatsApp

### Proceso:

1. **Ve a**: **Messaging** → **Senders** → **WhatsApp senders**
   - O: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**

2. **Haz clic en**: **"Create new sender"**

3. **Selecciona**: **"My own phone number"**

4. **Ingresa el número**: `+573242145488`
   - Formato: `+573242145488` (sin espacios)

5. **Haz clic en**: **"Continue"**

---

## 📋 Paso 4: Vincular con Meta (CRÍTICO)

### Cuando Meta Te Muestre las Cuentas:

**IMPORTANTE:**
- ⚠️ **DEBES** seleccionar la cuenta con ID: `1281121247401247` (tu cuenta actual)
- ⚠️ **NO selecciones** la cuenta con ID `1592931571896789` (la antigua)
- ⚠️ Si Meta muestra ambas, selecciona la correcta

### Proceso:

1. **Haz clic en**: **"Continue with Facebook"**

2. **En la ventana emergente**, revisa todas las cuentas disponibles

3. **Busca la cuenta con ID**: `1281121247401247`
   - Puede aparecer como "ultralents" o similar
   - Verifica el ID cuidadosamente

4. **Selecciona** esa cuenta (NO la otra)

5. **Confirma** la vinculación

6. **Completa** el proceso

---

## 📋 Paso 5: Verificar el Sender

### Después de Crear el Sender:

1. **Ve a**: **Messaging** → **Senders** → **WhatsApp senders**

2. **Verifica** que el sender aparezca con:
   - **WhatsApp number**: `+573242145488`
   - **Business display name**: "ultralents" (o el que configuraste)
   - **Sender status**: "Online" o "Pending"
   - **Quality rating**: Debería mejorar (no "Unavailable")

3. **Verifica** que el **WhatsApp Business Account ID** sea: `1281121247401247`
   - (Debería aparecer en la configuración del sender)

---

## 📋 Paso 6: Solicitar Aprobación de Templates

### Proceso:

1. **Ve a**: **Messaging** → **Content Template Builder**
   - O: **https://console.twilio.com/us1/develop/sms/content-template-builder**

2. **Haz clic en**: **"Create Template"** o **"Crear template"**

3. **Crea el template** similar al que tenías:
   - **Name**: "recordatorio" o similar
   - **Category**: "UTILITY"
   - **Language**: "es" (Español)
   - **Body**: Usa `{{1}}` para la variable del mensaje
   - Ejemplo: `{{1}}`

4. **Envía para aprobación**

5. **Espera** la aprobación (puede tardar días)

**Nota:** Mientras esperas la aprobación, puedes continuar con los siguientes pasos.

---

## 📋 Paso 7: Actualizar Variables de Entorno en Render

### Proceso:

1. **Ve a**: **Render** → Tu servicio → **Environment**

2. **Actualiza** las siguientes variables:

   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=[El Auth Token que obtuviste en el Paso 1]
   TWILIO_WHATSAPP_FROM=whatsapp:+573242145488
   MY_WHATSAPP_NUMBER=whatsapp:+573242145488
   ```

3. **Guarda** los cambios

4. **Reinicia** el servicio en Render

---

## 📋 Paso 8: Actualizar Content SID en el Código

### Una Vez que el Template Esté Aprobado:

1. **Ve a**: **Messaging** → **Content Template Builder**

2. **Busca** el template aprobado

3. **Copia** el **Content SID** (formato: `HX...`)

4. **Actualiza** en el código:
   - Busca el archivo donde está `WHATSAPP_TEMPLATE_CONTENT_SID`
   - Actualiza con el nuevo Content SID

5. **Despliega** los cambios

---

## 📋 Checklist Completo

- [ ] Obtuve el Auth Token completo de la subcuenta
- [ ] Agregué/compré el número `+573242145488` en la subcuenta
- [ ] Creé el sender de WhatsApp para `+573242145488`
- [ ] Cuando Meta mostró las cuentas, seleccioné la correcta (ID: `1281121247401247`)
- [ ] Verifiqué que el sender se creó correctamente
- [ ] Verifiqué que el WhatsApp Business Account ID es `1281121247401247`
- [ ] Solicité aprobación del template
- [ ] Actualicé variables de entorno en Render
- [ ] Reinicié el servicio en Render
- [ ] Actualicé Content SID en el código (una vez aprobado el template)
- [ ] Probé enviar un mensaje

---

## 🎯 Resumen

**Estado actual:**
- ✅ Subcuenta creada
- ✅ Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ⏳ Pendiente: Obtener Auth Token, configurar número, crear sender

**Próximos pasos:**
1. Obtener Auth Token completo
2. Agregar/comprar número `+573242145488`
3. Crear sender de WhatsApp
4. Vincular con Meta (ID: `1281121247401247`)
5. Solicitar aprobación de templates
6. Actualizar variables de entorno en Render
7. Actualizar Content SID en el código

---

## ✅ Próximos Pasos Inmediatos

1. **Haz clic en "Show"** para ver el Auth Token completo
2. **Copia y guarda** el Auth Token
3. **Ve a Phone Numbers** para agregar/comprar el número `+573242145488`
4. **Crea el sender** de WhatsApp
5. **Vincula con Meta** seleccionando la cuenta correcta (ID: `1281121247401247`)

**¿Necesitas ayuda con algún paso específico?** Puedo guiarte en cada paso del proceso.
