# ✅ Configurar Parámetros de Firebase Functions

## Paso 1: Instalar dependencias actualizadas

Ejecuta en PowerShell:

```powershell
cd C:\Users\user\Desktop\WHATS\functions
npm install
```

## Paso 2: Configurar el parámetro CLOUD_RUN_URL

```powershell
firebase functions:secrets:set CLOUD_RUN_URL
```

Cuando te pregunte el valor, pega:
```
https://whatsapp-service-890959892342.us-central1.run.app
```

O usa el comando directo:

```powershell
echo "https://whatsapp-service-890959892342.us-central1.run.app" | firebase functions:secrets:set CLOUD_RUN_URL
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
