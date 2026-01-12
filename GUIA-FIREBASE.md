# 🔥 Guía Paso a Paso: Crear Proyecto en Firebase

## Paso 1: Acceder a Firebase Console

1. Abre tu navegador (Chrome recomendado)
2. Ve a: **https://console.firebase.google.com/**
3. Inicia sesión con tu cuenta de Google (si no tienes una, créala primero)

---

## Paso 2: Crear Nuevo Proyecto

1. En la página principal de Firebase, haz clic en el botón **"Agregar proyecto"** o **"Crear un proyecto"**
   - (Puede aparecer como un botón grande en el centro o un "+" en la parte superior)

2. **Paso 2.1 - Nombre del proyecto:**
   - Ingresa un nombre, por ejemplo: `whatsapp-scheduler`
   - Haz clic en **"Continuar"**

3. **Paso 2.2 - Google Analytics (Opcional):**
   - Puedes desactivar Google Analytics si no lo necesitas
   - O dejarlo activado (no afecta la funcionalidad)
   - Haz clic en **"Continuar"**

4. **Paso 2.3 - Configurar Analytics (si lo activaste):**
   - Selecciona o crea una cuenta de Analytics
   - Haz clic en **"Crear proyecto"**

5. **Espera** a que se cree el proyecto (puede tardar 30-60 segundos)
6. Cuando veas "Tu proyecto está listo", haz clic en **"Continuar"**

---

## Paso 3: Habilitar Firestore Database

1. En el menú lateral izquierdo, busca y haz clic en **"Firestore Database"**
   - (Si no lo ves, puede estar en "Build" → "Firestore Database")

2. Haz clic en el botón **"Crear base de datos"**

3. **Selecciona el modo:**
   - Elige **"Iniciar en modo de prueba"** (podemos cambiar las reglas después)
   - Haz clic en **"Siguiente"**

4. **Selecciona la ubicación:**
   - Elige una ubicación cercana a ti (ej: `us-central1`, `southamerica-east1`)
   - **Importante:** Anota esta ubicación, la necesitarás para Cloud Functions
   - Haz clic en **"Habilitar"**

5. Espera a que se cree la base de datos (puede tardar unos minutos)

---

## Paso 4: Habilitar Cloud Functions

1. En el menú lateral izquierdo, busca y haz clic en **"Functions"**
   - (Puede estar en "Build" → "Functions")

2. Si es la primera vez, verás un botón **"Comenzar"** o **"Get started"**
   - Haz clic en él

3. **Habilitar facturación:**
   - Firebase te pedirá habilitar la facturación
   - **No te preocupes:** Firebase tiene un plan gratuito generoso
   - Haz clic en **"Seleccionar plan"** o **"Continuar"**
   - Selecciona el **plan Blaze (pago por uso)**
   - Confirma que entiendes que solo pagas por lo que uses
   - Completa el proceso de facturación (puede requerir tarjeta, pero no se cobrará si no excedes el plan gratuito)

4. Una vez habilitada la facturación, Functions estará disponible

---

## Paso 5: Obtener Credenciales de la App Web

1. En Firebase Console, haz clic en el **ícono de engranaje ⚙️** (arriba a la izquierda, al lado del nombre del proyecto)
   - O ve a **"Configuración del proyecto"**

2. Baja hasta la sección **"Tus aplicaciones"**

3. Si no hay ninguna app, verás el mensaje "Agregar app"
   - Haz clic en el ícono **`</>`** (ícono de web/HTML)

4. **Registrar app:**
   - **Apodo de la app:** `WhatsApp Scheduler Web`
   - **NO marques** la casilla "También configurar Firebase Hosting para esta app"
   - Haz clic en **"Registrar app"**

5. **¡IMPORTANTE! Copia las credenciales:**
   
   Verás algo como esto:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "whatsapp-scheduler.firebaseapp.com",
     projectId: "whatsapp-scheduler",
     storageBucket: "whatsapp-scheduler.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```

   **Copia estos valores** (los necesitarás para el archivo .env.local)

---

## Paso 6: Preparar Credenciales

Una vez que tengas las credenciales, necesitarás mapearlas así:

- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## ✅ Checklist de Verificación

Antes de continuar, verifica que tengas:

- [ ] Proyecto creado en Firebase
- [ ] Firestore Database habilitada
- [ ] Cloud Functions habilitada (con facturación configurada)
- [ ] App web registrada
- [ ] Credenciales copiadas

---

## 🆘 ¿Problemas?

**"No veo la opción de crear proyecto"**
- Asegúrate de estar en https://console.firebase.google.com/
- Inicia sesión con tu cuenta de Google

**"No puedo habilitar Functions"**
- Necesitas habilitar la facturación primero
- El plan gratuito es suficiente para empezar

**"No encuentro las credenciales"**
- Ve a Configuración del proyecto (ícono de engranaje)
- Baja hasta "Tus aplicaciones"
- Si no hay app, crea una nueva con el ícono `</>`

---

## 📝 Siguiente Paso

Una vez que tengas las credenciales, avísame y te ayudo a crear el archivo `.env.local` con tus datos.
