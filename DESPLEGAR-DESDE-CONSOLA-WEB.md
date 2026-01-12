# 🚀 Desplegar desde la Consola Web - Paso a Paso

## Paso 1: Crear el Servicio

1. En la página de Cloud Run, haz clic en **"CREAR SERVICIO"** o **"CREATE SERVICE"**

## Paso 2: Configurar el Servicio

### Pestaña "General"
- **Service name**: `whatsapp-service`
- **Region**: Selecciona `us-central1`
- **Authentication**: Marca **"Allow unauthenticated invocations"** (Permitir invocaciones no autenticadas)

### Pestaña "Container"
- **Container image URL**: Dejar en blanco por ahora (vamos a usar "Deploy from source")

### Pestaña "Deploy from source" o "Source"
- Haz clic en **"Deploy from source"** o **"Continuar"**
- **Source**: Necesitarás conectar un repositorio o subir el código

## ⚠️ Problema: Necesitamos el código en un repositorio

Para desplegar desde la consola web, necesitas el código en:
- Cloud Source Repositories
- GitHub
- GitLab
- O subir un archivo ZIP

## ✅ Alternativa: Usar Cloud Shell

La forma más fácil es usar Cloud Shell desde la consola web:

1. Haz clic en el ícono de **Cloud Shell** (arriba a la derecha, parece un símbolo `>_`)
2. Se abrirá una terminal en el navegador
3. Ejecuta estos comandos:

```bash
# Clonar o subir el código
# (Necesitarás subir los archivos de cloud-run)
```

## 🎯 Mejor Opción: Volver a PowerShell

Si el despliegue desde PowerShell falló, podemos:
1. Verificar qué error ocurrió
2. Corregirlo
3. Reintentar

¿Qué prefieres hacer?
