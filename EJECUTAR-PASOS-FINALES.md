# ✅ Pasos Finales - Ejecutar en PowerShell Local

## Paso 1: Configurar PATH

```powershell
$env:Path += ";C:\Program Files\nodejs"
```

## Paso 2: Ir a la carpeta functions

```powershell
cd C:\Users\user\Desktop\WHATS\functions
```

## Paso 3: Instalar dependencias

```powershell
npm install
```

## Paso 4: Compilar TypeScript

```powershell
npm run build
```

## Paso 5: Desplegar funciones

```powershell
cd ..
firebase deploy --only functions
```

## Paso 6: Probar

1. Abre: https://whatsapp-scheduler-2105b.web.app
2. Haz clic en "Generar código QR"
3. ¡Debería funcionar ahora! 🎉

## ⚠️ Nota

El código ya tiene la URL de Cloud Run como valor por defecto, así que no necesitas configurar nada adicional. Solo instala, compila y despliega.
