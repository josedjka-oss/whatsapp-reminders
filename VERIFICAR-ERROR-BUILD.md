# 🔍 Verificar Error del Build

## El despliegue falló. Necesitamos ver los logs

### Opción 1: Ver logs en la consola web

1. Ve a este enlace (que aparece en el error):
   https://console.cloud.google.com/cloud-build/builds;region=us-central1/721d97e4-3c09-480a-aea5-cf26a26469c1?project=890959892342

2. O ve a: https://console.cloud.google.com/cloud-build/builds?project=whatsapp-scheduler-2105b

3. Haz clic en el build más reciente (el que falló)

4. Revisa los logs para ver qué error específico ocurrió

### Opción 2: Ver logs desde Cloud Shell

Ejecuta en Cloud Shell:

```bash
gcloud builds list --limit=1
```

Luego:

```bash
gcloud builds log [BUILD_ID]
```

## Posibles errores comunes:

1. **Error en el Dockerfile**: Puede que falte alguna línea
2. **Error en package.json**: Dependencias incorrectas
3. **Error en server.ts**: Código con errores de sintaxis

## Verificar archivos

Ejecuta en Cloud Shell para verificar que los archivos estén correctos:

```bash
cd ~/whatsapp-cloud-run
ls -la
ls -la src/
cat Dockerfile | tail -5
```

Esto mostrará si los archivos están completos.
