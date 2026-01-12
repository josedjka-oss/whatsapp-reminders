# 🧪 Instrucciones para Probar el Webhook

## ✅ Verificaciones Previas

### 1. Servidor debe estar corriendo

**Busca la terminal donde ejecutaste `npm run dev`**. Deberías ver:

```
✅ Conectado a la base de datos
✅ Scheduler iniciado correctamente
🚀 Servidor escuchando en puerto 3000
📍 Health check: http://localhost:3000/health
📍 API: http://localhost:3000/api/reminders
📍 Webhook: http://localhost:3000/webhooks/twilio/whatsapp
```

**Si NO está corriendo**, ejecuta en una terminal:
```bash
cd C:\Users\user\Desktop\WHATS
npm run dev
```

### 2. ngrok debe estar corriendo

**Busca la terminal donde ejecutaste `npx ngrok http 3000`**. Deberías ver:

```
Session Status                online
Account                       josedjka@gmail.com (Plan: Free)
Version                       3.34.1
Region                        United States (us)
Latency                       90ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://matchable-semiprovincial-yuonne.ngrok-free.dev -> http://localhost:3000
```

**Si NO está corriendo**, ejecuta en una NUEVA terminal:
```bash
cd C:\Users\user\Desktop\WHATS
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
npx ngrok http 3000
```

### 3. Webhook configurado en Twilio

**Verifica en Twilio Console**:
- Ve a: Messaging → Try it out → Send a WhatsApp message → Configuration
- Debería mostrar: `https://matchable-semiprovincial-yuonne.ngrok-free.dev/webhooks/twilio/whatsapp (POST o CORREO)`

---

## 🧪 PASO A PASO: Probar el Webhook

### Paso 1: Preparar para la Prueba

1. **Abre WhatsApp en tu teléfono** 📱
2. **Asegúrate de tener ambas terminales visibles**:
   - Terminal del servidor (`npm run dev`)
   - Terminal de ngrok (`npx ngrok http 3000`)

### Paso 2: Enviar Mensaje de Prueba

1. **En tu WhatsApp**, busca o inicia un chat nuevo con:
   ```
   +1 415 523 8886
   ```
   (Este es el número de Twilio Sandbox)

2. **Escribe cualquier mensaje** de prueba, por ejemplo:
   ```
   Hola, esto es una prueba del webhook
   ```

3. **Envía el mensaje** 📤

4. **Espera 5-10 segundos** (para que Twilio procese y envíe el webhook)

### Paso 3: Verificar en los Logs del Servidor

**Mira la terminal donde está corriendo `npm run dev`**. Deberías ver:

```
📩 Mensaje recibido de whatsapp:+573024002656: Hola, esto es una prueba del webhook
✅ Mensaje reenviado exitosamente a tu WhatsApp personal
```

**O algo como**:
```
POST /webhooks/twilio/whatsapp 200
📩 Mensaje recibido de whatsapp:+1 415 523 8886: Hola, esto es una prueba del webhook
```

### Paso 4: Verificar en tu WhatsApp Personal

**Abre tu WhatsApp personal** (el número `+573024002656`). Deberías recibir:

```
📩 Respuesta de whatsapp:+1 415 523 8886:

Hola, esto es una prueba del webhook
```

O similar, mostrando el mensaje que enviaste.

### Paso 5: Verificar en la Base de Datos (Opcional)

**Si quieres verificar que se guardó en la base de datos**, puedes ejecutar:

```bash
curl http://localhost:3000/api/messages
```

Deberías ver el mensaje en la lista de mensajes.

---

## ✅ Resultados Esperados

### Si TODO funciona correctamente:

1. **✅ Mensaje enviado desde tu WhatsApp al `+1 415 523 8886`**
2. **✅ Aparece en los logs del servidor**: `📩 Mensaje recibido de...`
3. **✅ Se reenvía a tu WhatsApp personal** (`+573024002656`)
4. **✅ Se guarda en la base de datos** (verificable con `/api/messages`)

---

## ❌ Si NO Funciona

### Problema: No aparece nada en los logs del servidor

**Posibles causas**:
1. **ngrok no está corriendo** → Inicia ngrok: `npx ngrok http 3000`
2. **URL incorrecta en Twilio** → Verifica que sea exactamente: `https://matchable-semiprovincial-yuonne.ngrok-free.dev/webhooks/twilio/whatsapp`
3. **Servidor no está corriendo** → Inicia el servidor: `npm run dev`
4. **Twilio no puede alcanzar ngrok** → Verifica que ngrok muestre "Session Status: online"

**Solución**:
- Verifica que ambos (servidor y ngrok) estén corriendo
- Verifica la URL en Twilio Console
- Intenta enviar el mensaje de nuevo

### Problema: Error en los logs del servidor

**Si ves un error**, compártelo aquí para diagnosticarlo.

Ejemplos de errores comunes:
- `Error validando firma de Twilio` → Verifica `TWILIO_AUTH_TOKEN` en `.env`
- `Connection refused` → ngrok no está corriendo
- `404 Not Found` → URL del webhook incorrecta

### Problema: No se reenvía a tu WhatsApp personal

**Posibles causas**:
1. `MY_WHATSAPP_NUMBER` incorrecto en `.env` → Verifica que sea `whatsapp:+573024002656`
2. Error al enviar con Twilio → Revisa los logs del servidor para ver el error específico
3. Credenciales de Twilio incorrectas → Verifica `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`

---

## 🎯 Siguientes Pasos Después de la Prueba

### Si la prueba funciona ✅:

1. **¡Felicidades! Tu aplicación está 100% funcional** 🎉
2. Puedes crear recordatorios usando la API
3. El scheduler enviará los recordatorios automáticamente
4. Los mensajes entrantes se reenviarán a tu WhatsApp personal

### Si la prueba NO funciona ❌:

1. Comparte el error que ves en los logs
2. Revisamos juntos qué puede estar mal
3. Corregimos el problema paso a paso

---

**¿Listo para probar?** Sigue los pasos de arriba y dime qué resultado obtienes.
