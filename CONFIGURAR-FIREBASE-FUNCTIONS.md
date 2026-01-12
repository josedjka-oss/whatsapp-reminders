# ✅ Configurar Firebase Functions

## Paso 1: Configurar la URL de Cloud Run en Firebase Functions

Ejecuta en PowerShell (en tu computadora local):

```powershell
cd C:\Users\user\Desktop\WHATS\functions
firebase functions:config:set cloud_run.url="https://whatsapp-service-890959892342.us-central1.run.app"
```

## Paso 2: Instalar axios

```powershell
npm install --save axios
```

## Paso 3: Compilar TypeScript

```powershell
npm run build
```

## Paso 4: Desplegar funciones

```powershell
cd ..
firebase deploy --only functions
```

## Paso 5: Probar

1. Abre: https://whatsapp-scheduler-2105b.web.app
2. Haz clic en "Generar código QR"
3. ¡Debería funcionar ahora! 🎉
