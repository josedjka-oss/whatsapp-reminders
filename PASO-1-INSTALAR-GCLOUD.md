# Paso 1: Instalar Google Cloud SDK

## Opción A: Instalación Automática (Recomendada)

1. Ejecuta este comando en PowerShell (como Administrador):
```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-gcloud.ps1
```

2. En el instalador que se abre:
   - ✅ **IMPORTANTE**: Marca la casilla "Add to PATH"
   - Sigue los pasos del instalador
   - Completa la instalación

3. **Cierra y vuelve a abrir PowerShell** para que los cambios surtan efecto

## Opción B: Instalación Manual

1. Descarga el instalador desde:
   https://cloud.google.com/sdk/docs/install

2. Ejecuta el instalador

3. **IMPORTANTE**: Durante la instalación, asegúrate de marcar "Add to PATH"

4. Cierra y vuelve a abrir PowerShell

## Verificar Instalación

Después de cerrar y abrir PowerShell de nuevo, ejecuta:
```powershell
gcloud --version
```

Deberías ver algo como:
```
Google Cloud SDK 450.0.0
```

## ¿Listo?

Una vez instalado, avísame y continuamos con el siguiente paso.
