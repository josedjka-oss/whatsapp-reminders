# 🔧 Solución: No puedo escribir en el prompt

## Opción 1: Cancelar y usar valor por defecto

1. Presiona **Ctrl+C** para cancelar el proceso actual
2. El código ya tiene la URL como valor por defecto
3. Ejecuta de nuevo:

```powershell
firebase deploy --only functions
```

Si vuelve a pedir la URL, presiona **Enter** sin escribir nada (usará el valor por defecto).

## Opción 2: Configurar antes de desplegar

1. Presiona **Ctrl+C** para cancelar
2. Ejecuta:

```powershell
cd C:\Users\user\Desktop\WHATS\functions
firebase functions:secrets:set CLOUD_RUN_URL
```

Cuando te pida el valor, escribe:
```
https://whatsapp-service-890959892342.us-central1.run.app
```

3. Luego despliega:

```powershell
cd ..
firebase deploy --only functions
```

## Opción 3: Usar variable de entorno

1. Presiona **Ctrl+C** para cancelar
2. Ejecuta:

```powershell
$env:CLOUD_RUN_URL="https://whatsapp-service-890959892342.us-central1.run.app"
cd C:\Users\user\Desktop\WHATS
firebase deploy --only functions
```
