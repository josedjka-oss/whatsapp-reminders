# 🚀 Habilitar Servicios - Cloud Shell

## Ejecuta estos comandos en Cloud Shell:

```bash
# Habilitar Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Habilitar Cloud Run API
gcloud services enable run.googleapis.com

# Habilitar Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Habilitar Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com

# Verificar que se habilitaron
gcloud services list --enabled --filter="name:cloudbuild.googleapis.com OR name:run.googleapis.com OR name:artifactregistry.googleapis.com OR name:cloudresourcemanager.googleapis.com"
```

## Después de ejecutar:

1. Espera 1-2 minutos para que los servicios se activen
2. Vuelve a la página de permisos y verifica que ahora aparezcan como "habilitados"
3. Luego puedes redesplegar el servicio de Cloud Run
