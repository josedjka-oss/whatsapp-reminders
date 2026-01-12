# 📋 Guía Visual Paso a Paso

## 🖥️ Paso 1: Abrir PowerShell

**Opción A:**
- Presiona `Windows + X`
- Selecciona "Windows PowerShell" o "Terminal"

**Opción B:**
- Presiona `Windows`
- Escribe "PowerShell"
- Haz clic en "Windows PowerShell"

---

## 📁 Paso 2: Ir al Directorio del Proyecto

En PowerShell, escribe y presiona Enter:

```
cd C:\Users\user\Desktop\WHATS
```

Deberías ver algo como:
```
PS C:\Users\user\Desktop\WHATS>
```

---

## 🔐 Paso 3: Login en Firebase

**Copia TODO este bloque** (las 2 líneas) y pégalo en PowerShell, luego presiona Enter:

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path
firebase login
```

**Qué pasará:**
1. Se abrirá tu navegador automáticamente
2. Inicia sesión con tu cuenta de Google
3. Autoriza Firebase CLI
4. Vuelve a PowerShell y verás: `✔ Success! Logged in as...`

---

## ⚙️ Paso 4: Inicializar Firebase

**Después de que `firebase login` termine**, copia y pega esto:

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path
firebase init
```

**Durante `firebase init`, sigue estas selecciones:**

### Pregunta 1: ¿Qué funciones de Firebase quieres configurar?
```
❯ ◯ Firestore
  ◯ Functions
  ◯ Hosting
```

**Acción:** 
- Presiona **Espacio** 3 veces para seleccionar todos
- Debería verse así:
```
❯ ◉ Firestore
  ◉ Functions
  ◉ Hosting
```
- Presiona **Enter**

### Pregunta 2: Selecciona un proyecto de Firebase
```
❯ whatsapp-scheduler-2105b
  [Crear un nuevo proyecto]
```

**Acción:** 
- Si ya ves `whatsapp-scheduler-2105b`, presiona **Enter**
- Si no, usa las flechas para seleccionarlo y presiona **Enter**

### Pregunta 3: Firestore - ¿Qué archivo de reglas?
```
Firestore Rules file (firestore.rules)
```

**Acción:** Presiona **Enter** (usa el existente)

### Pregunta 4: Firestore - ¿Qué archivo de índices?
```
Firestore indexes file (firestore.indexes.json)
```

**Acción:** Presiona **Enter** (usa el existente)

### Pregunta 5: Functions - ¿Qué lenguaje?
```
❯ JavaScript
  TypeScript
  Python
```

**Acción:** 
- Usa las flechas para seleccionar **TypeScript**
- Presiona **Enter**

### Pregunta 6: Functions - ¿Usar ESLint?
```
? Do you want to use ESLint? (Y/n)
```

**Acción:** Escribe **Y** y presiona **Enter**

### Pregunta 7: Functions - ¿Instalar dependencias?
```
? Do you want to install dependencies now? (Y/n)
```

**Acción:** Escribe **Y** y presiona **Enter**

### Pregunta 8: Hosting - ¿Qué directorio público?
```
? What do you want to use as your public directory? (public)
```

**Acción:** Escribe **out** y presiona **Enter**

### Pregunta 9: Hosting - ¿Configurar como SPA?
```
? Configure as a single-page app (rewrite all urls to /index.html)? (y/N)
```

**Acción:** Escribe **N** y presiona **Enter**

### Pregunta 10: Hosting - ¿Configurar GitHub?
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

---

## 🚀 Siguiente Paso

Una vez que `firebase init` termine, avísame y procederemos a construir y desplegar la aplicación.
