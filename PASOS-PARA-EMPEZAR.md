# 📋 Guía Paso a Paso - WhatsApp Reminders

## 🎯 Objetivo
Configurar y ejecutar la aplicación de recordatorios WhatsApp con Twilio desde cero.

---

## PASO 1: Verificar Node.js

### 1.1. Verificar si tienes Node.js instalado

```bash
node --version
```

**Debe mostrar**: `v20.x.x` o superior

### 1.2. Si NO tienes Node.js instalado:

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS (Long Term Support)**
3. Instala siguiendo el asistente
4. Reinicia tu terminal/PowerShell

### 1.3. Verificar npm

```bash
npm --version
```

**Debe mostrar**: `10.x.x` o superior

---

## PASO 2: Instalar Dependencias del Proyecto

### 2.1. Abre PowerShell o Terminal en la carpeta del proyecto

```bash
cd C:\Users\user\Desktop\WHATS
```

### 2.2. Instalar todas las dependencias

```bash
npm install
```

**Esto tomará 2-3 minutos**. Deberías ver:
```
added 250 packages in 2m
```

### 2.3. Verificar que se instaló correctamente

```bash
npm list --depth=0
```

**Debes ver** las dependencias principales:
- express
- twilio
- @prisma/client
- node-cron
- etc.

---

## PASO 3: Configurar Variables de Entorno

### 3.1. Crear archivo .env

```bash
# Copiar .env.example a .env
Copy-Item .env.example .env
```

O manualmente:
1. Abre `.env.example` en tu editor
2. Copia todo el contenido
3. Crea un nuevo archivo llamado `.env` (sin `.example`)
4. Pega el contenido

### 3.2. Editar archivo .env

Abre `.env` y completa las siguientes variables:

```env
PORT=3000
APP_TIMEZONE=America/Bogota
DATABASE_URL="file:./dev.db"

# Twilio Credentials (las obtendrás en el siguiente paso)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# Twilio WhatsApp Number (Sandbox)
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Tu número de WhatsApp personal (formato: whatsapp:+57xxxxxxxxxx)
MY_WHATSAPP_NUMBER=whatsapp:+57xxxxxxxxxx

# URL pública (la configurarás después con ngrok)
PUBLIC_BASE_URL=https://your-ngrok-url.ngrok.io

# Ruta del webhook
TWILIO_WEBHOOK_PATH=/webhooks/twilio/whatsapp
```

**Por ahora**, deja las variables de Twilio como están. Las configurarás después.

---

## PASO 4: Configurar Base de Datos

### 4.1. Generar cliente Prisma

```bash
npm run db:generate
```

**Deberías ver**:
```
✔ Generated Prisma Client
```

### 4.2. Crear la base de datos (migraciones)

```bash
npm run db:migrate
```

**Te preguntará**:
```
? Enter a name for the new migration: ›
```

**Escribe**: `init` y presiona Enter

**Deberías ver**:
```
✔ Generated Prisma Client
✔ Applied migration `init`
```

### 4.3. Verificar que se creó la base de datos

Debería aparecer un archivo: `prisma/dev.db`

---

## PASO 5: Crear Cuenta en Twilio

### 5.1. Ir a Twilio Console

1. Ve a: https://www.twilio.com/try-twilio
2. **Crea una cuenta gratuita** (o inicia sesión si ya tienes una)
3. Verifica tu email y teléfono

### 5.2. Obtener Credenciales

Una vez dentro del **Twilio Console**:

1. Ve al **Dashboard**
2. Encontrarás:
   - **ACCOUNT SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **AUTH TOKEN**: (haz clic en "View" para verlo)

### 5.3. Copiar Credenciales a .env

Abre tu archivo `.env` y reemplaza:

```env
TWILIO_ACCOUNT_SID=ACxxxxx...  # Pega tu ACCOUNT SID aquí
TWILIO_AUTH_TOKEN=xxxxx...     # Pega tu AUTH TOKEN aquí
```

**⚠️ IMPORTANTE**: Guarda estas credenciales de forma segura. No las compartas.

---

## PASO 6: Configurar WhatsApp Sandbox en Twilio

### 6.1. Activar WhatsApp Sandbox

1. En Twilio Console, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. O directamente: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### 6.2. Ver Información del Sandbox

Verás:
- **Número de Twilio**: `+1 415 523 8886`
- **Código de unión** (join code): Una palabra como `airplane`, `book`, etc.

**Ejemplo**:
```
Join the Sandbox by sending a WhatsApp message with the code:
join airplane
to:
+1 415 523 8886
```

### 6.3. Unir tu WhatsApp al Sandbox

1. **Abre WhatsApp en tu teléfono**
2. **Envía un mensaje** al número: `+1 415 523 8886`
3. **Escribe el código**: `join [código]` (ejemplo: `join airplane`)
4. **Envía el mensaje**
5. **Recibirás confirmación**: "Your WhatsApp number is now registered with Twilio"

### 6.4. Actualizar .env con tu número personal

Una vez unido, actualiza tu `.env`:

```env
MY_WHATSAPP_NUMBER=whatsapp:+57xxxxxxxxxx  # Tu número en formato internacional
```

**Formato del número**:
- Debe incluir código de país (ej: `+57` para Colombia)
- Sin espacios ni guiones
- Ejemplo: `whatsapp:+573001234567`

---

## PASO 7: Instalar ngrok (para desarrollo local)

### 7.1. Descargar ngrok

**Opción A: Descargar desde web** (Recomendado)
1. Ve a: https://ngrok.com/download
2. Descarga para Windows
3. Extrae el archivo `ngrok.exe`
4. Mueve `ngrok.exe` a una carpeta en tu PATH (ej: `C:\Users\user\AppData\Local\Microsoft\WindowsApps`)

**Opción B: Instalar con npm** (Alternativa)
```bash
npm install -g ngrok
```

### 7.2. Verificar instalación

```bash
ngrok version
```

**Debe mostrar**: `ngrok version 3.x.x`

### 7.3. (Opcional) Crear cuenta gratuita en ngrok

1. Ve a: https://dashboard.ngrok.com/signup
2. Crea cuenta gratuita
3. Obtén tu authtoken
4. Configura:
   ```bash
   ngrok config add-authtoken TU_TOKEN_AQUI
   ```

**Nota**: Puedes usar ngrok sin cuenta, pero tendrás límites.

---

## PASO 8: Iniciar el Servidor

### 8.1. Iniciar servidor en modo desarrollo

```bash
npm run dev
```

**Deberías ver**:
```
✅ Conectado a la base de datos
✅ Scheduler iniciado correctamente
🚀 Servidor escuchando en puerto 3000
📍 Health check: http://localhost:3000/health
📍 API: http://localhost:3000/api/reminders
📍 Webhook: http://localhost:3000/webhooks/twilio/whatsapp
```

### 8.2. Verificar que funciona

Abre tu navegador y ve a:
- http://localhost:3000
- http://localhost:3000/health

**Debes ver** respuestas JSON del servidor.

**⚠️ NO CIERRES ESTA TERMINAL**. Déjala corriendo.

---

## PASO 9: Configurar ngrok (en otra terminal)

### 9.1. Abre una NUEVA terminal/PowerShell

### 9.2. Iniciar ngrok

```bash
ngrok http 3000
```

**Verás algo como**:
```
Session Status                online
Account                       Tu Nombre
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 9.3. Copiar la URL de ngrok

Copia la URL **Forwarding** (ejemplo: `https://abc123.ngrok.io`)

### 9.4. Actualizar .env con la URL de ngrok

Edita tu `.env` y actualiza:

```env
PUBLIC_BASE_URL=https://abc123.ngrok.io  # Pega la URL de ngrok aquí
```

### 9.5. Reiniciar el servidor (si es necesario)

Si ya estaba corriendo, deténlo (Ctrl+C) y vuelve a iniciarlo:

```bash
npm run dev
```

**⚠️ IMPORTANTE**: Cada vez que reinicies ngrok, obtendrás una URL nueva. Deberás actualizar `.env` y el webhook en Twilio.

---

## PASO 10: Configurar Webhook en Twilio

### 10.1. Ir a Twilio Console

1. Ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Haz clic en **Configuration** o **Configure**

### 10.2. Configurar Webhook URL

En **WHEN A MESSAGE COMES IN**:

1. Pega la URL de tu webhook:
   ```
   https://TU-URL-NGROK.ngrok.io/webhooks/twilio/whatsapp
   ```

   **Ejemplo**:
   ```
   https://abc123.ngrok.io/webhooks/twilio/whatsapp
   ```

2. Asegúrate de que el método sea **HTTP POST**

3. Haz clic en **Save**

### 10.3. Verificar configuración

Tu webhook debería estar configurado como:
```
https://TU-URL-NGROK.ngrok.io/webhooks/twilio/whatsapp (POST)
```

---

## PASO 11: Probar la Aplicación

### 11.1. Crear un Recordatorio de Prueba (Once)

Abre una **nueva terminal** y ejecuta:

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Prueba de recordatorio\",\"scheduleType\":\"once\",\"sendAt\":\"2025-01-15T10:00:00\",\"timezone\":\"America/Bogota\"}"
```

**⚠️ IMPORTANTE**: Reemplaza `+573001234567` con tu número personal.

**⚠️ IMPORTANTE**: Cambia la fecha `2025-01-15T10:00:00` por una fecha/hora futura cercana (ej: 5 minutos desde ahora).

**Formato de fecha**: `YYYY-MM-DDTHH:mm:ss`
- Ejemplo para 5 minutos desde ahora: `2025-01-09T15:05:00` (ajusta según tu hora actual)

**Deberías recibir** una respuesta JSON con el recordatorio creado:
```json
{
  "id": "uuid-aqui",
  "to": "whatsapp:+573001234567",
  "body": "Prueba de recordatorio",
  "scheduleType": "once",
  "sendAt": "2025-01-15T10:00:00",
  ...
}
```

### 11.2. Verificar Recordatorios Creados

```bash
curl http://localhost:3000/api/reminders
```

**Deberías ver** una lista con tu recordatorio.

### 11.3. Esperar el Envío

1. **Espera** hasta que llegue la hora programada
2. **Revisa los logs** del servidor (deberías ver: "Enviando recordatorio...")
3. **Revisa tu WhatsApp** - deberías recibir el mensaje

### 11.4. Crear un Recordatorio Diario

```bash
curl -X POST http://localhost:3000/api/reminders `
  -H "Content-Type: application/json" `
  -d "{\"to\":\"whatsapp:+573001234567\",\"body\":\"Recordatorio diario: Tomar medicamento\",\"scheduleType\":\"daily\",\"hour\":9,\"minute\":0,\"timezone\":\"America/Bogota\"}"
```

Este recordatorio se enviará **cada día a las 9:00 AM** (zona horaria America/Bogota).

### 11.5. Probar Webhook (Recibir Mensaje)

1. **Envía un mensaje** al número de Twilio desde tu WhatsApp: `+1 415 523 8886`
2. **Escribe cualquier mensaje** (ejemplo: "Hola, esto es una prueba")
3. **Envía el mensaje**
4. **Revisa los logs** del servidor (deberías ver: "Mensaje recibido de...")
5. **Revisa tu WhatsApp personal** - deberías recibir:
   ```
   📩 Respuesta de whatsapp:+1 415 523 8886:
   
   Hola, esto es una prueba
   ```

---

## PASO 12: Verificar Mensajes en Base de Datos

### 12.1. Abrir Prisma Studio (opcional)

```bash
npm run db:studio
```

Esto abrirá una interfaz web en: http://localhost:5555

Aquí puedes ver:
- Todos los recordatorios
- Todos los mensajes enviados/recibidos

---

## 🎉 ¡Listo! Tu Aplicación Está Funcionando

### ✅ Lo que has logrado:

1. ✅ Servidor corriendo en `http://localhost:3000`
2. ✅ Base de datos configurada (SQLite)
3. ✅ Twilio WhatsApp Sandbox configurado
4. ✅ Webhook funcionando (ngrok)
5. ✅ Recordatorios funcionando
6. ✅ Reenvío de mensajes funcionando

### 📋 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor en modo desarrollo

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:studio        # Abrir interfaz visual (opcional)

# Producción
npm run build            # Compilar TypeScript
npm start                # Iniciar servidor compilado
```

### 🔧 Troubleshooting

#### Error: "Twilio credentials are required"
- Verifica que `.env` tenga `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`
- Reinicia el servidor después de cambiar `.env`

#### Error: "Port 3000 already in use"
- Cierra otros programas usando el puerto 3000
- O cambia el puerto en `.env`: `PORT=3001`

#### Webhook no recibe mensajes
- Verifica que ngrok esté corriendo
- Verifica que la URL en Twilio sea correcta
- Verifica que `PUBLIC_BASE_URL` en `.env` sea correcta

#### Recordatorio no se envía
- Verifica que `isActive: true` en el recordatorio
- Verifica la hora/fecha programada
- Revisa los logs del servidor

---

## 📚 Próximos Pasos

### Crear Más Recordatorios

Puedes crear recordatorios desde código, desde una interfaz web (si la implementas), o usando curl.

### Desplegar a Producción

Cuando estés listo para usar en producción, puedes desplegar en:
- **Render.com** (gratis para empezar)
- **Railway.app** (gratis para empezar)
- **DigitalOcean** (desde $5/mes)
- **Tu propio VPS**

Ver `README.md` para instrucciones de despliegue.

---

**¡Disfruta tu aplicación de recordatorios WhatsApp! 🎉**
