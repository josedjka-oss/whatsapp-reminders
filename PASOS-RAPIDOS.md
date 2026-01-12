# 🚀 Pasos Rápidos para Implementar

## ✅ Checklist de Instalación

Sigue estos pasos en orden:

### 1️⃣ Instalar Node.js
- [ ] Descargar desde [nodejs.org](https://nodejs.org/) (versión LTS)
- [ ] Instalar (marcar "Add to PATH" durante instalación)
- [ ] Reiniciar terminal/PowerShell
- [ ] Verificar: `node --version` y `npm --version`

### 2️⃣ Instalar Dependencias
```bash
npm install
cd functions
npm install
cd ..
```

### 3️⃣ Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 4️⃣ Crear Proyecto en Firebase
- [ ] Ir a [Firebase Console](https://console.firebase.google.com/)
- [ ] Crear nuevo proyecto
- [ ] Habilitar **Firestore Database** (modo de prueba)
- [ ] Habilitar **Cloud Functions** (requiere facturación, pero hay plan gratuito)
- [ ] Obtener credenciales (Configuración > Tus aplicaciones > Agregar app web)

### 5️⃣ Configurar Variables de Entorno
- [ ] Copiar `.env.local.example` a `.env.local`
- [ ] Completar con tus credenciales de Firebase

### 6️⃣ Inicializar Firebase
```bash
firebase login
firebase init
```
- Seleccionar: Firestore, Functions, Hosting
- Usar archivos existentes para reglas e índices
- Directorio público: `out`

### 7️⃣ Construir y Desplegar
```bash
# Construir frontend
npm run build

# Desplegar Functions
firebase deploy --only functions

# Desplegar Hosting
firebase deploy --only hosting
```

### 8️⃣ Configurar Cloud Scheduler
- [ ] Ir a [Cloud Console](https://console.cloud.google.com/)
- [ ] Cloud Scheduler > Crear trabajo
- [ ] Frecuencia: `*/15 * * * *`
- [ ] Target: Cloud Function `checkAndSendMessages`

### 9️⃣ Conectar WhatsApp
- [ ] Abrir la URL de tu app desplegada
- [ ] Generar código QR
- [ ] Escanear con WhatsApp (Configuración > Dispositivos vinculados)

---

## 🔍 Verificar Instalación

Ejecuta el script de verificación:
```powershell
.\verificar-instalacion.ps1
```

---

## 📚 Documentación Completa

- **INSTALACION.md** - Guía detallada paso a paso
- **SETUP.md** - Configuración técnica
- **README.md** - Documentación general

---

## ❓ ¿Problemas?

Si encuentras algún error, comparte:
1. El mensaje de error completo
2. En qué paso estás
3. Qué comando ejecutaste
