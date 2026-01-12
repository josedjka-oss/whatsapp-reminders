# 🚀 DESPLIEGUE RÁPIDO DESDE CLOUD SHELL

## Problema Actual

El servicio sigue usando **Baileys** (versión anterior) porque el build nuevo está fallando.

## Solución: Desplegar desde Cloud Shell

### Paso 1: Abre Cloud Shell

1. **Abre Cloud Shell:**
   ```
   https://shell.cloud.google.com/?project=whatsapp-scheduler-2105b
   ```

2. **O abre el Editor de Cloud Shell:**
   ```
   https://ssh.cloud.google.com/cloudshell/editor?project=whatsapp-scheduler-2105b
   ```

### Paso 2: Prepara el Directorio

En Cloud Shell, ejecuta:

```bash
# Crear directorio
mkdir -p ~/whatsapp-cloud-run/src
cd ~/whatsapp-cloud-run
```

### Paso 3: Usar el Editor para Crear Archivos

**En el Editor de Cloud Shell**, crea los archivos necesarios:

#### 1. `package.json`

Copia el contenido de `cloud-run/package.json` que ya está actualizado.

#### 2. `tsconfig.json`

Copia el contenido de `cloud-run/tsconfig.json`.

#### 3. `Dockerfile`

Copia el contenido de `cloud-run/Dockerfile`.

#### 4. `src/server.ts`

Copia el contenido de `cloud-run/src/server.ts`.

#### 5. `.dockerignore`

```
node_modules
npm-debug.log
dist
.git
*.md
.env
.env.local
```

### Paso 4: Desplegar

Una vez creados los archivos, ejecuta:

```bash
cd ~/whatsapp-cloud-run

# Desplegar
gcloud run deploy whatsapp-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 900 \
  --min-instances 1 \
  --max-instances 1 \
  --project whatsapp-scheduler-2105b
```

### Paso 5: Ver el Error del Build (Si Falla)

Si el build falla, **verás el error directamente en Cloud Shell**. Copia el error completo y compártelo conmigo.

El error aparecerá al final del output, buscando líneas que digan:
- `ERROR`
- `npm ERR`
- `error TS`
- `Build failed`

## ¿Necesitas Ayuda?

Si necesitas que te guíe paso a paso en Cloud Shell, dímelo y te doy instrucciones más específicas para crear cada archivo usando el editor.
