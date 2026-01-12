# 🔍 Ver Logs del Error del Build

## El build falló. Necesitamos ver los logs específicos

### Opción 1: Ver en la consola web (Más fácil)

1. Ve a este enlace (del error):
   https://console.cloud.google.com/cloud-build/builds;region=us-central1/f6a3ce5e-31e4-490b-ad7f-ffa018813d47?project=890959892342

2. O ve a: https://console.cloud.google.com/cloud-build/builds?project=whatsapp-scheduler-2105b

3. Haz clic en el build más reciente (el que tiene estado "FAILED")

4. Revisa los logs para ver el error específico

### Opción 2: Ver desde Cloud Shell

Ejecuta:

```bash
gcloud builds log f6a3ce5e-31e4-490b-ad7f-ffa018813d47
```

O para ver el último build:

```bash
gcloud builds list --limit=1
```

Luego copia el ID y ejecuta:

```bash
gcloud builds log [ID]
```

## Posibles errores:

1. **Error de compilación TypeScript**: Puede que falte algo en server.ts
2. **Error en package.json**: Dependencias incorrectas
3. **Error en Dockerfile**: Problema con la instalación de Chrome

## Verificar archivo server.ts

Ejecuta para verificar que el archivo esté completo:

```bash
tail -20 ~/whatsapp-cloud-run/src/server.ts
```

Esto mostrará las últimas 20 líneas del archivo.
