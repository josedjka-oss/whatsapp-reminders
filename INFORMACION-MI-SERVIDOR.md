# 🖥️ Información de Tu Servidor

## 📍 Ubicación de Tu Servidor

### Servidor Local
- **URL Local**: `http://localhost:3000`
- **Ubicación física**: `C:\Users\user\Desktop\WHATS`
- **Puerto**: `3000`

### Servidor Público (ngrok)
- **URL Pública**: `https://matchable-semiprovincial-yuonne.ngrok-free.dev`
- **Esta URL apunta a**: `http://localhost:3000`
- **Propósito**: Permite que Twilio envíe webhooks a tu servidor local

---

## 🔍 Cómo Verificar si Tu Servidor Está Corriendo

### Método 1: Abrir en Navegador

1. **Abre tu navegador** (Chrome, Firefox, Edge, etc.)
2. **Ve a**: `http://localhost:3000`
3. **Deberías ver** un JSON con información de la API

### Método 2: Health Check

1. **Abre tu navegador**
2. **Ve a**: `http://localhost:3000/health`
3. **Deberías ver**:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-10T...",
     "timezone": "America/Bogota"
   }
   ```

### Método 3: Ver Terminal

**Busca la terminal donde ejecutaste `npm run dev`**. Deberías ver:

```
✅ Conectado a la base de datos
✅ Scheduler iniciado correctamente
🚀 Servidor escuchando en puerto 3000
📍 Health check: http://localhost:3000/health
📍 API: http://localhost:3000/api/reminders
📍 Webhook: http://localhost:3000/webhooks/twilio/whatsapp
```

---

## 🌐 Endpoints Disponibles

Tu servidor tiene estos endpoints disponibles:

### 1. Página Principal
- **URL**: `http://localhost:3000`
- **Método**: GET
- **Descripción**: Muestra información de la API

### 2. Health Check
- **URL**: `http://localhost:3000/health`
- **Método**: GET
- **Descripción**: Verifica que el servidor está funcionando

### 3. API de Recordatorios
- **Crear**: `POST http://localhost:3000/api/reminders`
- **Listar**: `GET http://localhost:3000/api/reminders`
- **Actualizar**: `PATCH http://localhost:3000/api/reminders/:id`
- **Eliminar**: `DELETE http://localhost:3000/api/reminders/:id`

### 4. API de Mensajes
- **Listar**: `GET http://localhost:3000/api/messages`
- **Filtros**: `?from=...&to=...&direction=...`

### 5. Webhook de Twilio
- **URL**: `http://localhost:3000/webhooks/twilio/whatsapp`
- **URL Pública**: `https://matchable-semiprovincial-yuonne.ngrok-free.dev/webhooks/twilio/whatsapp`
- **Método**: POST
- **Descripción**: Recibe mensajes entrantes de Twilio

---

## 🚀 Cómo Iniciar el Servidor

Si el servidor **NO está corriendo**, para iniciarlo:

### Paso 1: Abrir Terminal

Abre PowerShell o Terminal en Windows.

### Paso 2: Navegar al Proyecto

```powershell
cd C:\Users\user\Desktop\WHATS
```

### Paso 3: Iniciar Servidor

```powershell
npm run dev
```

### Paso 4: Verificar

Deberías ver mensajes de inicio en la terminal. El servidor estará corriendo en `http://localhost:3000`.

---

## ⚠️ Importante

### Para que la aplicación funcione completamente, necesitas:

1. **✅ Servidor corriendo** (`npm run dev`)
   - Terminal 1: `npm run dev`
   - Debe mostrar: "Servidor escuchando en puerto 3000"

2. **✅ ngrok corriendo** (`npx ngrok http 3000`)
   - Terminal 2: `npx ngrok http 3000`
   - Debe mostrar: "Session Status: online"

3. **✅ NO cierres estas terminales** mientras uses la aplicación

---

## 🧪 Probar que el Servidor Funciona

### Prueba Rápida 1: Health Check

**Abre tu navegador y ve a**:
```
http://localhost:3000/health
```

**Deberías ver**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T17:...",
  "timezone": "America/Bogota"
}
```

### Prueba Rápida 2: Página Principal

**Abre tu navegador y ve a**:
```
http://localhost:3000
```

**Deberías ver**:
```json
{
  "message": "WhatsApp Reminders API",
  "version": "1.0.0",
  "endpoints": {
    "reminders": "/api/reminders",
    "messages": "/api/messages",
    "webhooks": "/webhooks/twilio/whatsapp",
    "health": "/health"
  }
}
```

---

## 📋 Resumen

**Tu servidor es**:
- **Local**: `http://localhost:3000` (solo accesible desde tu PC)
- **Público**: `https://matchable-semiprovincial-yuonne.ngrok-free.dev` (accesible desde internet)
- **Carpeta**: `C:\Users\user\Desktop\WHATS`
- **Puerto**: `3000`

**Para verificar que está corriendo**:
1. Abre `http://localhost:3000/health` en tu navegador
2. O revisa la terminal donde ejecutaste `npm run dev`

---

**¿Necesitas iniciar el servidor?** Si no está corriendo, ejecuta `npm run dev` en una terminal.
