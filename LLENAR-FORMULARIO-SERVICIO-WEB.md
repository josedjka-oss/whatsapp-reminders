# 📝 Cómo Llenar el Formulario de Servicio Web en Render

## 🎯 Paso 1: Conectar Código (Opciones)

### Opción Más Rápida: Usar GitHub (Te Guío Ahora)

**Si quieres que funcione automáticamente, necesitas GitHub:**

1. Ve a [github.com](https://github.com) y crea una cuenta (si no tienes)
2. Crea un nuevo repositorio:
   - Haz clic en **"+"** → **"New repository"**
   - Nombre: `whatsapp-reminders`
   - Haz clic en **"Create repository"** (sin inicializar)
3. Luego volvemos a Render y conectamos GitHub

**O si prefieres avanzar ahora:**

1. En Render, haz clic en **"Conectar el proveedor de Git"**
2. Selecciona **"GitHub"**
3. Autoriza a Render a acceder a tus repositorios
4. Si aún no tienes código en GitHub, puedes crear el servicio ahora y subirlo después

**O la más rápida para continuar ahora:**

1. Selecciona **"Repositorio público de Git"**
2. Deja un repositorio temporal o crea uno rápido
3. Render creará el servicio
4. Después podemos actualizar el código

---

## 📋 Paso 2: Llenar el Formulario

### 2.1. Código Fuente (Por Ahora)

**Opción más rápida para continuar:**

1. Haz clic en **"Conectar el proveedor de Git"** → **"GitHub"**
2. Si no tienes cuenta GitHub o repositorio, crea uno rápido:
   - Ve a github.com (nueva pestaña)
   - Crea cuenta si no tienes
   - Crea repositorio: `whatsapp-reminders`
   - Vuelve a Render y conéctalo

**O para avanzar ahora sin Git:**

1. Selecciona **"Repositorio público de Git"**
2. Puedes poner cualquier URL temporal por ahora (ej: `https://github.com/usuario/repo-temporal`)
3. Render creará el servicio
4. Después actualizamos el código real

**MEJOR OPCIÓN: Te preparo un script para subir tu código a GitHub ahora mismo**

---

### 2.2. Nombre del Servicio

```
whatsapp-reminders
```

### 2.3. Proyecto (Opcional)

Deja **vacío** o **"Seleccione un proyecto..."** por ahora.

### 2.4. Ambiente

Deja **"Seleccione un entorno..."** o selecciona **"Production"** si está disponible.

### 2.5. Idioma

Ya está seleccionado: **"Nodo"** ✅ (Esto es correcto, es Node.js)

### 2.6. Rama

Ya está seleccionado: **"principal"** ✅ (Esto es correcto, es "main" branch)

### 2.7. Región

Ya está seleccionado: **"Oregón (oeste de EE. UU.)"** ✅ (Misma región que la base de datos)

### 2.8. Directorio Raíz (Opcional)

**Deja vacío** (no lo necesitas)

### 2.9. Comando de Construcción (MUY IMPORTANTE)

**Borra lo que haya y pega esto:**

```bash
npm install && npm run build && npx prisma migrate deploy
```

### 2.10. Comando de Inicio

**Borra lo que haya y pega esto:**

```bash
npm start
```

### 2.11. Tipo de Instancia (Para 24/7)

**Selecciona:**

```
Starter
$7 / mes
512 MB (RAM)
0.5 CPU
```

✅ Esto garantiza que **NUNCA se duerme** y funciona 24/7.

---

## 📋 Paso 3: Variables de Entorno

Haz clic en **"Agregar variable de entorno"** y agrega estas **UNA POR UNA**:

### 3.1. Variables del Servidor

1. **NOMBRE_DE_LA_VARIABLE:** `NODE_ENV`
   **valor:** `production`

2. **NOMBRE_DE_LA_VARIABLE:** `PORT`
   **valor:** `10000`

3. **NOMBRE_DE_LA_VARIABLE:** `APP_TIMEZONE`
   **valor:** `America/Bogota`

### 3.2. Base de Datos

**IMPORTANTE:** La base de datos la vincularemos después de crear el servicio, pero también puedes agregar:

4. **NOMBRE_DE_LA_VARIABLE:** `DATABASE_URL`
   **valor:** (Lo obtendremos de la base de datos después)

**Para obtener el DATABASE_URL:**
1. Ve a tu base de datos en Render: `whatsapp-reminders-db`
2. Pestaña **"Connections"**
3. Copia la **"Internal Database URL"**
4. Pégala en el valor de `DATABASE_URL`

### 3.3. Variables de Twilio

**Necesitas tus credenciales de Twilio:**

1. Ve a [console.twilio.com](https://console.twilio.com)
2. **Account** → **Account Info**
3. Copia Account SID y Auth Token

5. **NOMBRE_DE_LA_VARIABLE:** `TWILIO_ACCOUNT_SID`
   **valor:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

6. **NOMBRE_DE_LA_VARIABLE:** `TWILIO_AUTH_TOKEN`
   **valor:** `tu_auth_token_aqui`
   ⚠️ **IMPORTANTE:** Marca esta variable como **"Secret"** o **"Sensitive"**

7. **NOMBRE_DE_LA_VARIABLE:** `TWILIO_WHATSAPP_FROM`
   **valor:** `whatsapp:+14155238886` (Sandbox) o tu número verificado

### 3.4. Tu Número de WhatsApp

8. **NOMBRE_DE_LA_VARIABLE:** `MY_WHATSAPP_NUMBER`
   **valor:** `whatsapp:+57XXXXXXXXXX` (tu número)

### 3.5. Webhook

9. **NOMBRE_DE_LA_VARIABLE:** `TWILIO_WEBHOOK_PATH`
   **valor:** `/webhooks/twilio/whatsapp`

---

## 📋 Paso 4: Avanzado (Opcional pero Recomendado)

Haz clic en **"Avanzado"** y busca:

### 4.1. Health Check Path

- **Health Check Path:** `/health`
- Render verificará automáticamente este endpoint cada 5 minutos

### 4.2. Vincular Base de Datos (MUY IMPORTANTE)

Busca una sección que diga:
- **"Link Database"** o **"Add Database"**
- O **"Databases"**

**Si ves esta opción:**

1. Haz clic en **"Link Database"** o **"Add Database"**
2. Selecciona: **`whatsapp-reminders-db`** (la base de datos que creamos)
3. Render configurará automáticamente `DATABASE_URL`

**Si NO ves esta opción en "Avanzado":**
- No te preocupes, podemos vincularla después de crear el servicio
- En ese caso, agrega `DATABASE_URL` manualmente (copiando la Internal Database URL)

---

## ✅ Paso 5: Revisar Antes de Crear

Antes de hacer clic en **"Implementar servicio web"**, verifica:

- ✅ Nombre: `whatsapp-reminders`
- ✅ Idioma: Nodo (Node.js)
- ✅ Rama: principal
- ✅ Región: Oregón (oeste de EE. UU.)
- ✅ Comando de construcción: `npm install && npm run build && npx prisma migrate deploy`
- ✅ Comando de inicio: `npm start`
- ✅ Tipo de instancia: Starter ($7/mes)
- ✅ Health Check Path: `/health` (si está en Avanzado)
- ✅ Variables de entorno: Todas agregadas (o al menos las críticas)
- ✅ Base de datos vinculada (si es posible, o lo hacemos después)

---

## 🚀 Paso 6: Crear el Servicio

1. Una vez revisado todo
2. Haz clic en **"Implementar servicio web"** o **"Create Web Service"**
3. Render comenzará a construir y desplegar
4. Verás los logs en tiempo real

---

## ⚠️ IMPORTANTE: Sobre el Código Fuente

**Si no tienes código en GitHub aún:**

1. Puedes crear el servicio ahora con una URL temporal
2. Render creará el servicio (puede dar error en el build, pero el servicio se crea)
3. Después podemos actualizar el código real
4. O te preparo un script para subir tu código a GitHub ahora mismo

**¿Qué prefieres?**
- A) Crear el servicio ahora (puede fallar el build pero el servicio se crea) y luego subimos código
- B) Te preparo script para subir código a GitHub primero (10 minutos) y luego conectamos
- C) Usas Manual Deploy si Render lo permite

---

## 💡 Recomendación Rápida

**Para avanzar rápido ahora:**

1. En "Código fuente", selecciona **"Repositorio público de Git"**
2. Puedes poner cualquier URL temporal por ahora (por ejemplo: `https://github.com/usuario/temporal`)
3. Llena el resto del formulario como indico arriba
4. Crea el servicio
5. Después actualizamos el código real

**Render creará el servicio aunque el build falle (porque no hay código).**
**Luego podemos:**
- Subir tu código a GitHub
- O actualizar el repositorio en Render
- O usar Manual Deploy si Render permite

---

¡Dime qué opción prefieres y te guío paso a paso para llenar el formulario! 🚀
