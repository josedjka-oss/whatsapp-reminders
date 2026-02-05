# 📋 Paso a Paso: Verificar Content SID y Desplegar

## 📋 Paso 1: Verificar Content SID en Twilio

### Proceso:

1. **Ve a**: **https://console.twilio.com/**

2. **Asegúrate de estar en la subcuenta** "Ultralents Nueva"
   - Verifica en la parte superior que diga "Ultralents Nueva" y "Subaccount"

3. **Ve a**: **Messaging** → **Content Template Builder**
   - O directamente: **https://console.twilio.com/us1/develop/sms/content-template-builder**

4. **Busca** el template llamado `recordatorio`

5. **Haz clic** en el template `recordatorio`

6. **Verifica** que aparezca:
   - **Content template SID**: `HXce444bd2a556f0b2372943243e8485ff`
   - **WhatsApp approval status**: `Approved`
   - **Body**: `Recordatorio: {{1}}. Por favor, enviar evidencia de la tarea realizada.`

7. **Copia** el Content SID si es diferente (aunque debería ser el mismo)

---

## 📋 Paso 2: Verificar Content SID en el Código

### Proceso:

1. **Abre** el archivo: `src/services/twilio.ts`

2. **Busca** la línea que dice:
   ```typescript
   const WHATSAPP_TEMPLATE_CONTENT_SID = "HXce444bd2a556f0b2372943243e8485ff";
   ```

3. **Verifica** que el Content SID sea exactamente: `HXce444bd2a556f0b2372943243e8485ff`

4. **Si es diferente**, actualízalo:
   ```typescript
   const WHATSAPP_TEMPLATE_CONTENT_SID = "HXce444bd2a556f0b2372943243e8485ff";
   ```

5. **Guarda** el archivo

---

## 📋 Paso 3: Hacer Commit y Push de los Cambios

### Si usas Git:

1. **Abre** tu terminal o línea de comandos

2. **Navega** a la carpeta del proyecto:
   ```bash
   cd C:\Users\user\Desktop\WHATS
   ```

3. **Verifica** los cambios:
   ```bash
   git status
   ```

4. **Agrega** los archivos modificados:
   ```bash
   git add .
   ```

5. **Haz commit** de los cambios:
   ```bash
   git commit -m "Actualizar Content SID y corregir formato de contentVariables"
   ```

6. **Haz push** a tu repositorio:
   ```bash
   git push
   ```

**Si NO usas Git:**
- Render debería detectar los cambios automáticamente si tienes auto-deploy configurado
- O puedes hacer el deploy manual desde Render

---

## 📋 Paso 4: Desplegar en Render

### Opción A: Auto-Deploy (Si está configurado)

1. **Render detectará** los cambios automáticamente
2. **Iniciará** el build automáticamente
3. **Desplegará** los cambios cuando termine

**Solo necesitas esperar** a que Render termine el proceso.

### Opción B: Deploy Manual

1. **Ve a**: **https://dashboard.render.com/**

2. **Selecciona** tu servicio (el backend de WhatsApp)

3. **Haz clic en**: **"Manual Deploy"** o **"Deploy latest commit"**

4. **Espera** a que termine el build y deploy

5. **Verifica** que el servicio esté "Live"

---

## 📋 Paso 5: Verificar el Deploy

### Proceso:

1. **Ve a**: **Render** → Tu servicio → **Logs**

2. **Busca** mensajes como:
   - `Build successful`
   - `Deploying...`
   - `Your service is live`

3. **Verifica** que no haya errores

4. **Espera** unos minutos para que el servicio se reinicie completamente

---

## 📋 Paso 6: Probar Enviar un Mensaje

### Proceso:

1. **Ve a** tu aplicación frontend (Vercel) o usa la API directamente

2. **Crea un recordatorio** de prueba:
   - Fecha: Hoy o mañana
   - Hora: Cualquier hora cercana
   - Mensaje: `"Pagar el recibo del agua"` (solo el texto, sin "Recordatorio: ")
   - Número destino: Tu número de WhatsApp personal

3. **Envía** el recordatorio

4. **Verifica** que recibas el mensaje en WhatsApp con el formato:
   ```
   Recordatorio: Pagar el recibo del agua. Por favor, enviar evidencia de la tarea realizada.
   ```

---

## 📋 Paso 7: Verificar los Logs

### Proceso:

1. **Ve a**: **Render** → Tu servicio → **Logs**

2. **Busca** mensajes relacionados con:
   - `[TWILIO] ContentVariables JSON: ...`
   - `[TWILIO] ✅ Mensaje creado en Twilio`
   - `[TWILIO] Estado del mensaje: ...`

3. **Verifica** que:
   - ✅ No haya errores
   - ✅ El JSON de contentVariables se vea correcto
   - ✅ El mensaje se haya enviado correctamente

---

## ⚠️ Si Hay Errores

### Error: "Template not found"

**Solución:**
- Verifica que el Content SID sea correcto
- Verifica que estés en la subcuenta correcta
- Verifica que el template esté aprobado

### Error: "ContentVariables Parameter is invalid"

**Solución:**
- Verifica que el JSON se vea correcto en los logs
- Verifica que el reminderText no tenga caracteres problemáticos
- Verifica que el formato sea: `{"1": "texto"}`

### Error: "Number not authorized"

**Solución:**
- Verifica que el sender esté "Online" en Twilio
- Verifica las variables de entorno en Render
- Verifica que el número sea correcto

---

## 📋 Checklist Completo

- [ ] Verifiqué el Content SID en Twilio: `HXce444bd2a556f0b2372943243e8485ff`
- [ ] Verifiqué el Content SID en el código
- [ ] Hice commit y push de los cambios (si uso Git)
- [ ] Desplegué los cambios en Render
- [ ] Verifiqué que el deploy fue exitoso
- [ ] Probé enviar un mensaje de prueba
- [ ] Verifiqué que recibí el mensaje en WhatsApp
- [ ] Revisé los logs en Render
- [ ] Verifiqué que no haya errores

---

## 🎯 Resumen

**Pasos:**
1. ✅ Verificar Content SID en Twilio
2. ✅ Verificar Content SID en el código
3. ✅ Hacer commit y push (si usas Git)
4. ✅ Desplegar en Render
5. ✅ Verificar el deploy
6. ✅ Probar enviar un mensaje
7. ✅ Verificar los logs

**¿Necesitas ayuda con algún paso específico?** Puedo guiarte en cualquier parte del proceso.
