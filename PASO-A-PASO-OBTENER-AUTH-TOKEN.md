# 🔑 Paso a Paso: Obtener tu Auth Token de Twilio

## ⚠️ Importante

**Yo NO tengo acceso a tu Auth Token.** Es información sensible que solo tú puedes ver en tu cuenta de Twilio.

---

## 📋 Pasos Detallados

### **Paso 1: Iniciar Sesión en Twilio**

1. Ve a: **https://console.twilio.com**
2. Inicia sesión con tu cuenta de Twilio
3. Si no tienes cuenta, créala primero

### **Paso 2: Ir a Account Settings**

**Opción A: Desde el menú superior**
1. En la parte superior derecha, verás tu **nombre de usuario** o **icono de perfil**
2. Haz clic en él
3. Selecciona **"Account"** o **"Settings"**

**Opción B: URL directa**
1. Ve directamente a: **https://console.twilio.com/us1/account/settings/credentials**

### **Paso 3: Ver el Auth Token**

1. En la página de **Account Settings**, busca la sección **"Auth Token"**
2. Verás algo como:
   ```
   Auth Token
   ****************************** (oculto)
   [Show] [Regenerate]
   ```
3. Haz clic en el botón **"Show"** o el **icono del ojo 👁️**
4. El token se revelará (será una cadena larga de caracteres alfanuméricos)
5. **Copia el token completo** (Ctrl+C o Cmd+C)

### **Paso 4: Verificar el Account SID**

Mientras estás en la misma página, también verifica tu **Account SID**:
- Debe estar visible en la parte superior de la página
- Debe ser algo como: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔧 Actualizar en Render

Una vez que tengas el Auth Token:

1. **Ve a Render Dashboard:** https://dashboard.render.com
2. **Haz clic en tu servicio:** `whatsapp-reminders`
3. **Haz clic en "Environment"** (menú lateral)
4. **Busca `TWILIO_AUTH_TOKEN`**
5. **Haz clic en el lápiz ✏️** para editar
6. **Borra el valor actual**
7. **Pega el nuevo token** que copiaste de Twilio Console
8. **Asegúrate de:**
   - ✅ Está marcado como **"Secret"** 🔒 (debe tener un candado)
   - ✅ No tiene espacios al inicio o final
   - ✅ No tiene comillas
9. **Haz clic en "Save Changes"**

---

## 🚀 Después de Guardar

1. **Render redesplegará automáticamente** (verás un mensaje de "Deploying...")
2. **Espera 2-3 minutos** a que termine el despliegue
3. **Verifica en los logs** que el token cambió:
   - Debe ser diferente a `e1c3344101...`
   - Los primeros caracteres deberían coincidir con los del token que copiaste

---

## ⚠️ Si No Puedes Ver el Auth Token

Si no puedes ver el Auth Token en Twilio Console:

1. **Verifica que estés en la cuenta correcta** (la que tiene el Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
2. **Verifica que tengas permisos** para ver credenciales de cuenta
3. **Intenta regenerar el token:**
   - Haz clic en **"Regenerate"** junto al Auth Token
   - **⚠️ IMPORTANTE:** Si regeneras el token, el anterior dejará de funcionar
   - Copia el nuevo token y actualízalo en Render

---

## 🔍 Verificación Final

Después del redespliegue, envía un mensaje de prueba y verifica los logs. Deberías ver:

```
[TWILIO] TWILIO_AUTH_TOKEN: [PRIMEROS 10 CARACTERES DEL TOKEN]...
```

Si el token empieza con algo diferente a `e1c3344101...`, entonces está correcto.

---

## 📝 Nota sobre el Token Anterior

El token que mencionaste anteriormente (`20bc1efaed4966c3f221f48fd885aa69lo`) puede que:
- Ya no sea válido (fue regenerado)
- Sea de una cuenta diferente
- Tenga algún error de copia

**Por eso es importante obtenerlo directamente de Twilio Console ahora.**

---

**¿Ya obtuviste el Auth Token de Twilio Console? Una vez que lo tengas, actualízalo en Render y avísame cuando termine el redespliegue. 🚀**
