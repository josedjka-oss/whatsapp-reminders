# 🚀 Desplegar desde la Consola Web (Alternativa)

Si el despliegue desde PowerShell está tardando mucho, puedes desplegar desde la consola web.

## Opción 1: Verificar si ya está desplegado

1. En la página de Cloud Run, busca en la lista de servicios
2. Si ves "whatsapp-service", haz clic en él
3. Copia la URL que aparece (algo como: `https://whatsapp-service-xxxxx-uc.a.run.app`)

## Opción 2: Desplegar desde la Consola Web

1. Haz clic en **"IMPLEMENTA UN SERVICIO WEB"** o **"DEPLOY A SERVICE"**
2. Selecciona **"Continuar"** o **"Deploy from source"**
3. Configura:
   - **Service name**: `whatsapp-service`
   - **Region**: `us-central1`
   - **Source**: Selecciona "Cloud Source Repositories" o "Upload from your computer"
   - **Memory**: `2 GiB`
   - **Timeout**: `900 seconds`
   - **Min instances**: `0`
   - **Max instances**: `1`
4. Haz clic en **"DEPLOY"** o **"DESPLEGAR"**

## ⚠️ Nota

Desplegar desde la consola web también puede tardar 5-10 minutos. Es más fácil ver el progreso visualmente.

## ✅ Recomendación

Si el despliegue desde PowerShell sigue ejecutándose, **déjalo correr**. Si lleva más de 15 minutos sin hacer nada, cancela y usa la consola web.
