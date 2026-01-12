# 🔄 Actualizar Cloud Run con Mejores Logs

## He mejorado el código para capturar mejor los errores

Necesitas actualizar el código en Cloud Shell y redesplegar.

## Pasos:

### 1. En Cloud Shell, actualiza el archivo server.ts

```bash
cd ~/whatsapp-cloud-run
```

Luego usa el editor de Cloud Shell (ícono de lápiz) para actualizar `src/server.ts` con el código mejorado, o copia el archivo actualizado desde tu computadora local.

### 2. O mejor: Actualiza desde tu computadora local

El archivo `cloud-run/src/server.ts` ya está actualizado en tu computadora. Puedes:
- Copiar el contenido completo del archivo
- Pegarlo en Cloud Shell usando el editor

### 3. Redesplegar

```bash
cd ~/whatsapp-cloud-run
gcloud run deploy whatsapp-service --source . --platform managed --region us-central1 --allow-unauthenticated --memory 2Gi --timeout 900 --min-instances 0 --max-instances 1
```

## Alternativa: Ver logs más antiguos

En la consola de Cloud Run:
1. Ve a LOGS
2. Cambia el filtro de tiempo a "Últimas 24 horas" o "Última semana"
3. Busca logs con "Error" o "error"
