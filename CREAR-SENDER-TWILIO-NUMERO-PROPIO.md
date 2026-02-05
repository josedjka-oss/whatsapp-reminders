# 📱 Crear Sender en Twilio con Tu Propio Número

## ✅ Situación

Estás en Twilio Console creando un nuevo sender para WhatsApp Business. Meta te está pidiendo que selecciones un número.

---

## 🎯 Paso 1: Seleccionar "My own phone number"

1. **Selecciona la opción**: **"My own phone number"** (Mi propio número de teléfono)
   - NO selecciones "Twilio phone number"
   - Selecciona "My own phone number"

---

## 📝 Paso 2: Ingresar el Número

1. **En el campo del número**, ingresa:
   ```
   +573242145488
   ```
   - Con el signo `+` al inicio
   - Sin espacios
   - Formato E.164

2. **Verifica** que el número esté correcto:
   - Debe empezar con `+57` (Colombia)
   - Debe tener 10 dígitos después del código de país
   - Total: `+573242145488`

---

## ⚠️ Advertencia de Meta

Meta te advierte:

> "If your phone number is already connected to the WhatsApp consumer or small business application, please disconnect it prior to continuing below."

**Esto significa:**
- ⚠️ Si el número está en WhatsApp personal o WhatsApp Business personal (app móvil), debes desconectarlo primero
- ⚠️ Si el número está en WhatsApp Business API con otro proveedor, debes abrir un ticket de soporte

**Como tu número es nuevo:**
- ✅ No deberías tener este problema
- ✅ Puedes continuar directamente

---

## ✅ Paso 3: Continuar

1. **Verifica** que el número esté correcto: `+573242145488`
2. **Haz clic en**: **"Continue"** (Continuar)

---

## 📞 Paso 4: Validación del Número

### Después de Hacer Clic en "Continue":

Meta te pedirá validar el número mediante:

#### Opción A: Validación por SMS
1. Meta enviará un código por SMS al número `+573242145488`
2. Ingresa el código en la siguiente pantalla
3. El número quedará verificado

#### Opción B: Validación por Llamada
1. Meta llamará al número
2. Te dará un código por voz
3. Ingresa el código en la siguiente pantalla
4. El número quedará verificado

**Como el número es nuevo:**
- ✅ Deberías poder recibir SMS o llamadas
- ✅ El proceso debería funcionar

---

## ⚠️ Importante: Número Debe Estar Activo

**Asegúrate de que:**
- ✅ El número esté activo con Tigo
- ✅ Pueda recibir SMS
- ✅ Pueda recibir llamadas

**Si el número NO está activo todavía:**
- ⚠️ No podrás recibir el código de validación
- ⚠️ Necesitas activarlo primero con Tigo
- ⚠️ O espera a que se active

---

## ✅ Paso 5: Después de la Validación

### Una Vez que Valides el Número:

1. **Meta verificará** el número
2. **Twilio creará el sender** con ese número
3. **El número quedará registrado** en WhatsApp Business API
4. **Podrás usarlo** para enviar mensajes programados

---

## 📋 Checklist

- [ ] Seleccioné "My own phone number" (NO "Twilio phone number")
- [ ] Ingresé el número: `+573242145488` (con + y sin espacios)
- [ ] Verifiqué que el número esté correcto
- [ ] Verifiqué que el número esté activo y pueda recibir SMS/llamadas
- [ ] Hice clic en "Continue"
- [ ] Esperé la validación (SMS o llamada)
- [ ] Ingresé el código de validación
- [ ] Verifiqué que el sender se creó correctamente

---

## 🎯 Resumen

**Proceso:**
1. ✅ **Selecciona**: "My own phone number"
2. ✅ **Ingresa**: `+573242145488`
3. ✅ **Haz clic**: "Continue"
4. ⏳ **Valida**: Recibe código por SMS o llamada
5. ✅ **Confirma**: Ingresa el código
6. ✅ **Completa**: El sender se creará en Twilio

**Importante:**
- El número debe estar activo y poder recibir SMS/llamadas
- Si es nuevo, puede necesitar activación con Tigo primero

---

## ⚠️ Si Tienes Problemas

### Si el Número NO Puede Recibir SMS/Llamadas:

1. **Activa el número con Tigo primero:**
   - Asegúrate de que el número esté activo
   - Verifica que pueda recibir SMS
   - Luego intenta la validación

2. **O considera usar el otro número:**
   - Usa `+573043577875` cuando se libere (24 horas)
   - Ya está todo configurado
   - Más rápido y fácil

---

## ✅ Próximos Pasos

1. **Selecciona "My own phone number"**
2. **Ingresa `+573242145488`**
3. **Haz clic en "Continue"**
4. **Espera la validación** (SMS o llamada)
5. **Ingresa el código**
6. **Completa el proceso**

**¿El número está activo y puede recibir SMS/llamadas?** Si sí, continúa con el proceso. Si no, actívalo primero con Tigo.
