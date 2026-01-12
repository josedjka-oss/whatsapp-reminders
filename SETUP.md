# Guía de Configuración - WhatsApp Scheduler

## Paso 1: Instalar Dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias de Firebase Functions
cd functions
npm install
cd ..
```

## Paso 2: Configurar Firebase

### 2.1 Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto"
3. Ingresa un nombre para tu proyecto (ej: `whatsapp-scheduler`)
4. Sigue los pasos del asistente

### 2.2 Habilitar Servicios

En tu proyecto de Firebase, habilita:

1. **Firestore Database**:
   - Ve a Firestore Database
   - Haz clic en "Crear base de datos"
   - Selecciona "Iniciar en modo de prueba" (luego actualiza las reglas)
   - Elige una ubicación (ej: `us-central1`)

2. **Cloud Functions**:
   - Ve a Functions
   - Haz clic en "Comenzar"
   - Sigue las instrucciones para habilitar la facturación (requerida para Functions)

3. **Cloud Scheduler** (opcional, se puede configurar después):
   - Ve a [Cloud Console](https://console.cloud.google.com/)
   - Habilita Cloud Scheduler API

### 2.3 Obtener Credenciales

1. En Firebase Console, ve a Configuración del proyecto (ícono de engranaje)
2. En "Tus aplicaciones", haz clic en el ícono web `</>`
3. Registra la app con un nombre (ej: "WhatsApp Scheduler Web")
4. Copia las credenciales que se muestran

### 2.4 Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## Paso 3: Inicializar Firebase CLI

```bash
# Instalar Firebase CLI globalmente (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar Firebase en el proyecto
firebase init
```

Durante `firebase init`, selecciona:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting

**Para Firestore:**
- Usa las reglas existentes: `firestore.rules`
- Usa los índices existentes: `firestore.indexes.json`

**Para Functions:**
- Lenguaje: TypeScript
- ESLint: Sí
- Instalar dependencias: Sí

**Para Hosting:**
- Directorio público: `out`
- Configurar como SPA: No (Next.js maneja las rutas)
- Configurar GitHub: Opcional

## Paso 4: Desplegar

### 4.1 Construir el Frontend

```bash
npm run build
```

Esto generará la carpeta `out` con los archivos estáticos.

### 4.2 Desplegar Functions

```bash
cd functions
npm run deploy
cd ..
```

O desde la raíz:

```bash
firebase deploy --only functions
```

### 4.3 Desplegar Hosting

```bash
firebase deploy --only hosting
```

O usar el script combinado:

```bash
npm run build:firebase
```

## Paso 5: Configurar Cloud Scheduler

Después de desplegar las Functions, configura Cloud Scheduler:

1. Ve a [Cloud Console](https://console.cloud.google.com/)
2. Navega a **Cloud Scheduler**
3. Haz clic en **Crear trabajo**
4. Configura:
   - **Nombre**: `check-whatsapp-messages`
   - **Región**: La misma donde desplegaste Functions (ej: `us-central1`)
   - **Frecuencia**: `*/15 * * * *` (cada 15 minutos)
   - **Zona horaria**: Tu zona horaria
   - **Target**: Cloud Function
   - **Function**: `checkAndSendMessages`
   - **Region**: La misma región de Functions

## Paso 6: Usar la Aplicación

1. Abre la URL de tu aplicación (se mostrará después del deploy)
2. Verás un componente para conectar WhatsApp
3. Haz clic en "Generar código QR"
4. Escanea el QR con WhatsApp desde tu teléfono:
   - Abre WhatsApp
   - Ve a Configuración → Dispositivos vinculados
   - Toca "Vincular un dispositivo"
   - Escanea el código QR
5. Una vez conectado, puedes crear mensajes programados

## Solución de Problemas

### Error: "Functions failed to deploy"

- Verifica que tengas la facturación habilitada en Firebase
- Asegúrate de tener Node.js 18 instalado
- Revisa los logs: `firebase functions:log`

### Error: "WhatsApp no se conecta"

- Verifica que el QR se genere correctamente
- Asegúrate de escanear el QR dentro de los primeros minutos
- Si expira, genera un nuevo QR

### Error: "Mensajes no se envían"

- Verifica que Cloud Scheduler esté configurado correctamente
- Revisa los logs de Functions: `firebase functions:log`
- Verifica que WhatsApp esté conectado en la interfaz

## Notas Importantes

- ⚠️ La sesión de WhatsApp se mantiene en el servidor
- ⚠️ Si desvinculas WhatsApp, necesitarás escanear el QR nuevamente
- ⚠️ Para producción, actualiza las reglas de Firestore para agregar autenticación
- ⚠️ WhatsApp puede limitar envíos masivos

## Desarrollo Local

```bash
# Frontend (puerto 3000)
npm run dev

# Functions (en otra terminal)
cd functions
npm run serve
```

Las Functions locales estarán disponibles en `http://localhost:5001`
