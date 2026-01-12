# 🔍 Ver Logs del Build - Métodos Alternativos

## Método 1: Listar todos los builds

```bash
gcloud builds list --limit=5
```

Esto mostrará los últimos 5 builds con sus IDs.

## Método 2: Ver en la consola web (Más fácil)

1. Ve a: https://console.cloud.google.com/cloud-build/builds?project=whatsapp-scheduler-2105b
2. Haz clic en el build más reciente (el que tiene el estado "Failed" o "Error")
3. Revisa los logs para ver el error específico

## Método 3: Verificar archivos

Antes de ver los logs, verifica que todos los archivos estén correctos:

```bash
cd ~/whatsapp-cloud-run
ls -la
ls -la src/
cat src/server.ts | head -20
```

Esto verificará que los archivos existan y tengan contenido.

## Posibles problemas comunes:

1. **server.ts está vacío o incompleto**
2. **Falta alguna dependencia en package.json**
3. **Error de sintaxis en TypeScript**
