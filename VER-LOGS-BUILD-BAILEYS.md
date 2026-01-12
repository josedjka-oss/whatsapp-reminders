# 🔍 Ver Logs del Build Fallido

## El despliegue falló durante el build

Necesitamos ver los logs para entender qué salió mal.

## Opción 1: Ver logs desde PowerShell

```powershell
# Obtener el último build ID
$buildId = gcloud builds list --limit=1 --format="value(id)" --project=whatsapp-scheduler-2105b

# Ver logs del build
gcloud builds log $buildId --project=whatsapp-scheduler-2105b
```

## Opción 2: Ver logs desde la consola web

1. Ve a: https://console.cloud.google.com/cloud-build/builds?project=whatsapp-scheduler-2105b
2. Haz clic en el build más reciente (el que falló)
3. Revisa los logs para ver el error

## Posibles causas:

1. **Error de compilación TypeScript** - Puede faltar algún tipo
2. **Dependencias faltantes** - Alguna dependencia no se instaló correctamente
3. **Error en server-baileys.ts** - Algún problema de sintaxis

## Después de ver los logs:

Comparte el error que veas y lo corregiremos.
