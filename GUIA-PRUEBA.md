# 🧪 Guía de Prueba - WhatsApp Scheduler

## Paso 1: Abrir la Aplicación

1. Abre tu navegador (Chrome recomendado)
2. Ve a: **https://whatsapp-scheduler-2105b.web.app**
3. Deberías ver la interfaz de la aplicación

---

## Paso 2: Conectar WhatsApp

1. En la parte superior de la página, verás un componente **"Conectar WhatsApp"**
2. Haz clic en el botón **"Generar código QR"**
3. Espera unos segundos mientras se genera el código QR
4. Verás un código QR en la pantalla

### Escanear el QR con WhatsApp:

1. Abre **WhatsApp** en tu teléfono
2. Ve a **Configuración** (ícono de engranaje, esquina superior derecha)
3. Toca **"Dispositivos vinculados"**
4. Toca **"Vincular un dispositivo"**
5. Escanea el código QR que aparece en la pantalla de tu computadora
6. Espera a que se vincule

### Verificar Conexión:

- En la aplicación web, deberías ver: **"✓ WhatsApp conectado"** (en verde)
- Si ves esto, WhatsApp está conectado correctamente

---

## Paso 3: Crear un Mensaje de Prueba

1. Haz clic en el botón **"+ Nuevo Mensaje"** (arriba a la derecha)

2. Completa el formulario:

   **Número de teléfono:**
   - Escribe un número de prueba (puede ser el tuyo)
   - **IMPORTANTE**: Debe incluir código de país con +
   - Ejemplo: `+521234567890` (México)
   - Ejemplo: `+1234567890` (EE.UU.)
   - Ejemplo: `+34612345678` (España)

   **Mensaje:**
   - Escribe un mensaje de prueba, por ejemplo:
     ```
     Mensaje de prueba desde WhatsApp Scheduler
     ```

   **Fecha:**
   - Selecciona **HOY** (la fecha actual)

   **Hora:**
   - Selecciona una hora que sea **2-3 minutos en el futuro**
   - Por ejemplo, si son las 3:00 PM, programa para las 3:02 PM o 3:03 PM
   - Esto te permitirá ver el resultado rápidamente

   **Tipo de mensaje:**
   - Selecciona **"Único (se envía una vez)"**

3. Haz clic en **"Programar Mensaje"**

4. Deberías ver el mensaje en la lista principal con estado **"Pendiente"**

---

## Paso 4: Esperar y Verificar

1. Vuelve a la página principal
2. Verás tu mensaje en la lista con estado **"Pendiente"**
3. Espera 2-3 minutos (o hasta que llegue la hora programada + máximo 15 minutos)
4. El sistema verifica cada 15 minutos, así que puede haber un pequeño retraso

### Verificar que se Envió:

1. **En la aplicación:**
   - Refresca la página (F5)
   - El estado del mensaje debería cambiar a **"Enviado"** (en verde)
   - Verás la fecha y hora de envío

2. **En tu teléfono:**
   - Revisa WhatsApp
   - Deberías haber recibido el mensaje programado

---

## Paso 5: Verificar Logs (Opcional)

Si quieres ver los detalles técnicos:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `whatsapp-scheduler-2105b`
3. Ve a **Functions**
4. Haz clic en **`checkAndSendMessages`**
5. Ve a la pestaña **"Logs"**
6. Verás las ejecuciones y si el mensaje se envió correctamente

---

## ✅ Prueba Exitosa

Si el mensaje:
- ✅ Aparece como "Enviado" en la aplicación
- ✅ Llegó a WhatsApp en tu teléfono
- ✅ Se envió en la hora programada (o cerca)

**¡La prueba fue exitosa!** 🎉

---

## 🔍 Solución de Problemas

### El QR no se genera
- Verifica que las Functions estén desplegadas
- Revisa la consola del navegador (F12) para ver errores

### WhatsApp no se conecta
- Asegúrate de escanear el QR dentro de los primeros minutos
- Si expira, genera un nuevo QR

### El mensaje no se envía
- Verifica que WhatsApp esté conectado (debe decir "✓ WhatsApp conectado")
- Revisa los logs de Functions en Firebase Console
- Verifica que Cloud Scheduler esté ejecutándose

### Error en el número de teléfono
- Asegúrate de incluir el código de país con +
- El formato correcto es: `+[código país][número]`
- Ejemplo: `+521234567890`

---

## 🎯 Próximos Pasos

Una vez que la prueba funcione:
- Puedes programar mensajes reales
- Configurar mensajes recurrentes mensuales
- Usar la aplicación normalmente

¡Buena suerte con la prueba! 🚀
