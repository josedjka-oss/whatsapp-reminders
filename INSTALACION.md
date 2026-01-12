# Guía de Instalación Completa - WhatsApp Scheduler

## Paso 1: Instalar Node.js

### Windows:

1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión LTS (Long Term Support) - recomendada
3. Ejecuta el instalador
4. Durante la instalación, asegúrate de marcar la opción "Add to PATH"
5. Reinicia tu terminal/PowerShell después de instalar

### Verificar instalación:

Abre una nueva terminal y ejecuta:
```bash
node --version
npm --version
```

Deberías ver números de versión (ej: v18.17.0 y 9.6.7)

---

## Paso 2: Instalar Dependencias del Proyecto

Una vez que Node.js esté instalado, ejecuta en la raíz del proyecto:

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias de Firebase Functions
cd functions
npm install
cd ..
```

---

## Paso 3: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### Verificar instalación:
```bash
firebase --version
```

---

## Paso 4: Configurar Firebase

### 4.1 Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Crear un proyecto"
3. Ingresa un nombre (ej: `whatsapp-scheduler`)
4. Desactiva Google Analytics (opcional, puedes activarlo después)
5. Haz clic en "Crear proyecto"
6. Espera a que se cree (puede tardar unos segundos)

### 4.2 Habilitar Firestore Database

1. En el menú lateral, haz clic en "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de prueba" (podemos cambiar las reglas después)
4. Elige una ubicación (recomendado: `us-central1` o la más cercana a ti)
5. Haz clic en "Habilitar"

### 4.3 Habilitar Cloud Functions

1. En el menú lateral, haz clic en "Functions"
2. Si es la primera vez, haz clic en "Comenzar"
3. Sigue las instrucciones para:
   - Habilitar la facturación (requerida para Functions, pero hay plan gratuito)
   - Instalar Firebase CLI (ya lo hicimos)
   - Inicializar Functions (lo haremos después)

### 4.4 Obtener Credenciales de Firebase

1. En Firebase Console, haz clic en el ícono de engranaje ⚙️ (Configuración del proyecto)
2. Baja hasta "Tus aplicaciones"
3. Haz clic en el ícono web `</>` (Agregar app)
4. Registra la app:
   - Apodo: `WhatsApp Scheduler Web`
   - No marques "También configura Firebase Hosting" (lo haremos después)
   - Haz clic en "Registrar app"
5. **Copia las credenciales** que aparecen (las necesitarás para el archivo .env.local)

---

## Paso 5: Crear Archivo de Variables de Entorno

En la raíz del proyecto, crea un archivo llamado `.env.local` con el siguiente contenido:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

**Reemplaza los valores** con las credenciales que copiaste en el Paso 4.4

---

## Paso 6: Inicializar Firebase en el Proyecto

Ejecuta en la raíz del proyecto:

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte. Luego:

```bash
firebase init
```

### Durante `firebase init`, selecciona:

1. **¿Qué funciones de Firebase quieres configurar?**
   - ✅ Firestore (presiona Espacio para seleccionar, Enter para continuar)
   - ✅ Functions
   - ✅ Hosting
   - Presiona Enter cuando hayas seleccionado todo

2. **Selecciona un proyecto de Firebase:**
   - Selecciona el proyecto que creaste (ej: `whatsapp-scheduler`)

3. **Para Firestore:**
   - ¿Qué archivo de reglas de seguridad de Firestore quieres usar? → `firestore.rules` (presiona Enter)
   - ¿Qué archivo de índices de Firestore quieres usar? → `firestore.indexes.json` (presiona Enter)

4. **Para Functions:**
   - ¿Qué lenguaje quieres usar? → **TypeScript** (usa las flechas y Enter)
   - ¿Quieres usar ESLint? → **Sí** (Y)
   - ¿Quieres instalar dependencias ahora? → **Sí** (Y)

5. **Para Hosting:**
   - ¿Qué directorio público quieres usar? → `out` (escribe `out` y Enter)
   - ¿Configurar como aplicación de una sola página? → **No** (N)
   - ¿Configurar GitHub para despliegue automático? → **No** (N, opcional)

---

## Paso 7: Probar Localmente (Opcional)

### Frontend:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador

### Functions (en otra terminal):
```bash
cd functions
npm run serve
```

---

## Paso 8: Desplegar a Firebase

### 8.1 Construir el Frontend

```bash
npm run build
```

Esto creará la carpeta `out` con los archivos estáticos.

### 8.2 Desplegar Functions

```bash
firebase deploy --only functions
```

Esto puede tardar varios minutos la primera vez.

### 8.3 Desplegar Hosting

```bash
firebase deploy --only hosting
```

Después del despliegue, verás una URL como: `https://tu-proyecto.web.app`

---

## Paso 9: Configurar Cloud Scheduler

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Asegúrate de que el proyecto correcto esté seleccionado
3. Ve a **Cloud Scheduler** (busca en el menú o en la barra de búsqueda)
4. Haz clic en **Crear trabajo**
5. Configura:
   - **Nombre**: `check-whatsapp-messages`
   - **Región**: La misma donde desplegaste Functions (ej: `us-central1`)
   - **Descripción**: `Verifica y envía mensajes programados de WhatsApp`
   - **Frecuencia**: `*/15 * * * *` (cada 15 minutos)
   - **Zona horaria**: Tu zona horaria
   - **Target**: Cloud Function
   - **Function**: Selecciona `checkAndSendMessages` del dropdown
   - **Region**: La misma región de Functions
6. Haz clic en **Crear**

---

## Paso 10: Usar la Aplicación

1. Abre la URL de tu aplicación desplegada
2. Verás el componente para conectar WhatsApp
3. Haz clic en "Generar código QR"
4. Escanea el QR con WhatsApp:
   - Abre WhatsApp en tu teléfono
   - Ve a **Configuración** → **Dispositivos vinculados**
   - Toca **"Vincular un dispositivo"**
   - Escanea el código QR que aparece en la pantalla
5. Una vez conectado (verás "✓ WhatsApp conectado"), puedes crear mensajes programados

---

## Solución de Problemas

### Error: "npm no se reconoce"
- Asegúrate de haber instalado Node.js
- Reinicia tu terminal después de instalar Node.js
- Verifica que Node.js esté en el PATH

### Error: "firebase no se reconoce"
- Ejecuta: `npm install -g firebase-tools`
- Reinicia tu terminal

### Error: "Functions failed to deploy"
- Verifica que tengas la facturación habilitada en Firebase
- Asegúrate de tener Node.js 18 o superior
- Revisa los logs: `firebase functions:log`

### Error: Variables de entorno no funcionan
- Asegúrate de que el archivo se llame exactamente `.env.local` (con el punto al inicio)
- Reinicia el servidor de desarrollo después de crear/modificar `.env.local`
- Verifica que las variables empiecen con `NEXT_PUBLIC_`

---

## ¿Necesitas Ayuda?

Si encuentras algún problema durante la instalación, comparte el error específico y te ayudaré a resolverlo.
