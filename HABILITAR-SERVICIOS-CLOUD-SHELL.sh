#!/bin/bash
# Script para habilitar servicios necesarios en Google Cloud

echo "🔧 Habilitando servicios de Google Cloud..."

# Habilitar Cloud Build API
echo "Habilitando Cloud Build API..."
gcloud services enable cloudbuild.googleapis.com

# Habilitar Cloud Run API
echo "Habilitando Cloud Run API..."
gcloud services enable run.googleapis.com

# Habilitar Artifact Registry API
echo "Habilitando Artifact Registry API..."
gcloud services enable artifactregistry.googleapis.com

# Habilitar Cloud Resource Manager API
echo "Habilitando Cloud Resource Manager API..."
gcloud services enable cloudresourcemanager.googleapis.com

# Verificar servicios habilitados
echo ""
echo "✅ Servicios habilitados:"
gcloud services list --enabled --filter="name:cloudbuild.googleapis.com OR name:run.googleapis.com OR name:artifactregistry.googleapis.com OR name:cloudresourcemanager.googleapis.com"

echo ""
echo "✅ Listo! Ahora puedes redesplegar el servicio."
