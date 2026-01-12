# Instrucciones para firebase init

## ✅ Login Completado

Ahora vamos a inicializar Firebase en tu proyecto.

## Ejecuta este comando:

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" init
```

## Durante firebase init, sigue estas selecciones:

### 1. ¿Qué funciones de Firebase quieres configurar?
```
? Please select an option: (Use arrow keys)
❯ Firestore: Configure security rules and indexes files for Firestore
  Functions: Configure a Cloud Functions directory and files
  Hosting: Configure files for Firebase Hosting and optionally set up GitHub Action deploys
```

**Acción:**
- Presiona **Espacio** para seleccionar cada opción (marca todas las 3)
- Deberías ver ◉ (círculo lleno) en cada una
- Presiona **Enter** cuando las 3 estén seleccionadas

### 2. Selecciona un proyecto de Firebase
```
? Please select an option: (Use arrow keys)
❯ whatsapp-scheduler-2105b
  [don't setup a default project]
```

**Acción:**
- Si ya ves `whatsapp-scheduler-2105b` seleccionado, presiona **Enter**
- Si no, usa las flechas ↑↓ para seleccionarlo y presiona **Enter**

### 3. Firestore - ¿Qué archivo de reglas?
```
? What file should be used for Firestore Rules? (firestore.rules)
```

**Acción:** Presiona **Enter** (usa el existente)

### 4. Firestore - ¿Qué archivo de índices?
```
? What file should be used for Firestore indexes? (firestore.indexes.json)
```

**Acción:** Presiona **Enter** (usa el existente)

### 5. Functions - ¿Qué lenguaje?
```
? What language would you like to use to write Cloud Functions? (Use arrow keys)
  JavaScript
❯ TypeScript
  Python
```

**Acción:**
- Si TypeScript ya está seleccionado, presiona **Enter**
- Si no, usa las flechas para seleccionar **TypeScript** y presiona **Enter**

### 6. Functions - ¿Usar ESLint?
```
? Do you want to use ESLint to catch probable bugs and enforce style? (Y/n)
```

**Acción:** Escribe **Y** y presiona **Enter**

### 7. Functions - ¿Instalar dependencias?
```
? Do you want to install dependencies now? (Y/n)
```

**Acción:** Escribe **Y** y presiona **Enter**

### 8. Hosting - ¿Qué directorio público?
```
? What do you want to use as your public directory? (public)
```

**Acción:** Escribe **out** y presiona **Enter**

### 9. Hosting - ¿Configurar como SPA?
```
? Configure as a single-page app (rewrite all urls to /index.html)? (y/N)
```

**Acción:** Escribe **N** y presiona **Enter**

### 10. Hosting - ¿Configurar GitHub?
```
? Set up automatic builds and deploys with GitHub? (y/N)
```

**Acción:** Escribe **N** y presiona **Enter**

---

## ✅ Cuando Termine

Verás algo como:
```
✔ Firebase initialization complete!
```

Avísame cuando termine y procederemos a construir y desplegar.
