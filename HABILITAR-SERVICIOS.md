# 🔧 Habilitar Servicios de Google Cloud

## Los servicios necesarios están deshabilitados

Necesitamos habilitar estos servicios para que Cloud Run funcione correctamente.

## Opción 1: Habilitar desde la Consola Web

### 1. Ve a la página de APIs y Servicios:
https://console.cloud.google.com/apis/library?project=whatsapp-scheduler-2105b

### 2. Busca y habilita estos servicios (uno por uno):

**a) Cloud Build API**
- Busca: "Cloud Build API"
- Haz clic en "HABILITAR"

**b) Cloud Run API**
- Busca: "Cloud Run API"
- Haz clic en "HABILITAR"

**c) Artifact Registry API**
- Busca: "Artifact Registry API"
- Haz clic en "HABILITAR"

**d) Cloud Resource Manager API**
- Busca: "Cloud Resource Manager API"
- Haz clic en "HABILITAR"

## Opción 2: Habilitar desde Cloud Shell (Más rápido)

Ejecuta estos comandos en Cloud Shell:

```bash
# Habilitar Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Habilitar Cloud Run API
gcloud services enable run.googleapis.com

# Habilitar Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Habilitar Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com

# Verificar servicios habilitados
gcloud services list --enabled
```

## Después de habilitar:

1. Espera 1-2 minutos para que los servicios se activen
2. Intenta redesplegar el servicio de Cloud Run
3. Si aún hay problemas, verifica los permisos de la cuenta de servicio
