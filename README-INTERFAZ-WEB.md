# 🌐 Interfaz Web con OpenAI - WhatsApp Reminders

## 🎯 Descripción

Interfaz web intuitiva accesible desde una URL que permite gestionar recordatorios de WhatsApp usando **lenguaje natural** con integración de **OpenAI**.

## 🚀 Características

- ✅ **Chat intuitivo** tipo conversación
- ✅ **Lenguaje natural** - Escribe como si hablaras con una persona
- ✅ **OpenAI Integration** - Comprende intenciones y ejecuta acciones
- ✅ **Gestión completa** - Crear, listar, cancelar recordatorios
- ✅ **Contactos** - Resuelve nombres a números de WhatsApp
- ✅ **Seguridad básica** - Protección con password
- ✅ **Responsive** - Funciona en móvil y desktop

## 📋 Requisitos

### Variables de Entorno

Agrega estas variables en Render (o tu archivo `.env`):

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Seguridad
ADMIN_PASSWORD=tu_password_seguro

# Frontend (opcional, para desarrollo)
NEXT_PUBLIC_API_URL=https://whatsapp-reminders-mzex.onrender.com
```

## 🏗️ Arquitectura

```
/frontend (Next.js) → /api/ai (Backend Express) → OpenAI → Prisma → PostgreSQL
```

- **Frontend:** Next.js 14 con App Router
- **Backend:** Express endpoint `/api/ai`
- **OpenAI:** GPT-4o-mini con tool calling
- **Base de datos:** PostgreSQL con Prisma

## 🎮 Cómo Usar

### 1. Acceder a la Interfaz

Ve a: `https://tu-dominio.com/chat`

### 2. Autenticación

Ingresa tu contraseña (configurada en `ADMIN_PASSWORD`)

### 3. Escribir Instrucciones

Ejemplos de frases válidas:

#### **Crear Recordatorios:**

```
"Enviar un mensaje a Juan todos los días a las 5 pm"
"Recuérdame todos los meses el día 15 pagar el recibo de la luz"
"Enviar 'Hola, cómo estás' mañana a las 10 am"
"Programar mensaje 'Reunión importante' en 2 horas"
```

#### **Listar Recordatorios:**

```
"¿Qué recordatorios tengo activos?"
"Muéstrame mis recordatorios"
"¿Qué mensajes tengo programados?"
```

#### **Cancelar Recordatorios:**

```
"Cancela el recordatorio de Juan"
"Elimina el recordatorio de pagar el recibo"
"Detén el recordatorio de mañana"
```

#### **Gestionar Contactos:**

```
"Guarda Juan con el número whatsapp:+573024002656"
"Agregar contacto María al whatsapp:+573001234567"
```

## 🔧 Funcionalidades Técnicas

### **OpenAI Tool Calling**

El backend usa **tool calling** de OpenAI para ejecutar acciones reales:

1. **create_reminder** - Crea un nuevo recordatorio
2. **list_reminders** - Lista recordatorios activos
3. **cancel_reminder** - Cancela un recordatorio
4. **create_contact** - Guarda un contacto

### **Resolución de Contactos**

Si mencionas un nombre (ej: "Juan"), el sistema:
1. Busca en la base de datos de contactos
2. Si existe, usa su número de WhatsApp
3. Si no existe, pregunta: "¿Qué número de WhatsApp tiene Juan?"

### **Procesamiento de Tiempo**

El sistema entiende expresiones relativas:
- "mañana" → Día siguiente a las 9am
- "hoy" → Hoy a las 9am (o mañana si ya pasó)
- "en 2 horas" → Hora actual + 2 horas
- "en 3 días" → Fecha actual + 3 días
- "5 pm" → 17:00
- "5:30 pm" → 17:30

### **Timezone**

Por defecto: `America/Bogota` (configurable en `APP_TIMEZONE`)

## 📁 Estructura de Archivos

```
/
├── app/
│   ├── chat/
│   │   └── page.tsx          # Interfaz de chat
│   ├── layout.tsx            # Layout principal
│   └── globals.css           # Estilos globales
├── src/
│   ├── routes/
│   │   └── ai.ts             # Endpoint /api/ai
│   ├── middleware/
│   │   └── auth.ts           # Autenticación
│   └── server.ts             # Servidor Express
├── prisma/
│   └── schema.prisma         # Schema con modelo Contact
└── next.config.js            # Configuración Next.js
```

## 🔐 Seguridad

### **Autenticación**

- Middleware `requireAuth` en `/api/ai`
- Validación de password desde `ADMIN_PASSWORD`
- Header: `Authorization: Bearer {password}`

### **Rate Limiting**

- 50 requests por 15 minutos
- Protección contra abuso

## 🚀 Despliegue

### **Render.com**

1. **Variables de entorno:**
   - `OPENAI_API_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_API_URL` (opcional, se detecta automáticamente)

2. **Build Command:**
   ```bash
   npm run render-build
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

### **Desarrollo Local**

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev:next

# O ambos a la vez:
npm run dev:all
```

Accede a: `http://localhost:3001/chat` (Next.js por defecto usa puerto 3000, pero el backend ya lo usa)

## 📝 Ejemplos de Uso

### **Ejemplo 1: Recordatorio Diario**

**Usuario:** "Enviar un mensaje a Juan todos los días a las 5 pm"

**Sistema:**
1. Resuelve "Juan" → `whatsapp:+573024002656` (si existe contacto)
2. Crea recordatorio con `scheduleType: "daily"`, `hour: 17`, `minute: 0`
3. Responde: "Listo, enviaré el mensaje a Juan todos los días a las 5:00 pm."

### **Ejemplo 2: Recordatorio Mensual**

**Usuario:** "Recuérdame todos los meses el día 15 pagar el recibo de la luz"

**Sistema:**
1. Crea recordatorio con `scheduleType: "monthly"`, `dayOfMonth: 15`
2. Pregunta hora si no se especifica
3. Responde: "Listo, te recordaré todos los meses el día 15 a las [hora] pagar el recibo de la luz."

### **Ejemplo 3: Listar Recordatorios**

**Usuario:** "¿Qué recordatorios tengo activos?"

**Sistema:**
1. Consulta recordatorios activos
2. Responde: "Tienes 3 recordatorios activos:
   - Enviar mensaje a Juan todos los días a las 5:00 pm
   - Recordatorio mensual el día 15
   - Mensaje único mañana a las 10:00 am"

## 🐛 Troubleshooting

### **Error: "No autorizado"**

- Verifica que `ADMIN_PASSWORD` esté configurado
- Verifica que el frontend envíe el header `Authorization: Bearer {password}`

### **Error: "OpenAI API key not found"**

- Verifica que `OPENAI_API_KEY` esté configurado en Render

### **Error: "Contact not found"**

- El sistema preguntará por el número si el contacto no existe
- Puedes crear contactos diciendo: "Guarda Juan con el número whatsapp:+573024002656"

## 📚 Documentación Adicional

- [DESCRIPCION-IMPLEMENTACION-COMPLETA.md](./DESCRIPCION-IMPLEMENTACION-COMPLETA.md) - Arquitectura completa
- [COMO-FUNCIONA-ENVIO-MENSAJES.md](./COMO-FUNCIONA-ENVIO-MENSAJES.md) - Cómo funciona el envío

---

**¡Disfruta gestionando tus recordatorios con lenguaje natural! 🚀**
