# Plan: whatsapp-web.js Mejorado con Instancia Persistente

## Objetivo
Usar tu número personal de WhatsApp con whatsapp-web.js de forma confiable en Cloud Run.

## Cambios Necesarios

### 1. Migrar de Baileys a whatsapp-web.js
- Eliminar dependencias de Baileys
- Instalar whatsapp-web.js y Puppeteer
- Reimplementar lógica de conexión

### 2. Persistencia de Sesión en Cloud Storage
- **Problema actual:** /tmp se borra al reiniciar
- **Solución:** Usar Cloud Storage para guardar sesión
- Subir sesión a Cloud Storage cuando se actualice
- Descargar sesión de Cloud Storage al iniciar

### 3. Cloud Run con Instancia Persistente
- Configurar `min-instances: 1` para mantener instancia siempre activa
- Esto evita cold starts y mantiene la sesión viva
- Costo: ~$10-15/mes pero necesario para mantener conexión

### 4. Reconexión Automática Robusta
- Detectar desconexiones
- Reconectar automáticamente
- Si necesita QR, generar nuevo QR automáticamente

### 5. Dockerfile Mejorado
- Instalar Chrome/Chromium para Puppeteer
- Optimizar tamaño de imagen
- Configurar Puppeteer correctamente

## Estructura de Archivos

```
cloud-run/
├── src/
│   └── server.ts (whatsapp-web.js implementation)
├── package.json (con whatsapp-web.js)
├── Dockerfile (con Chrome)
└── .env (con credenciales de Cloud Storage)
```

## Implementación Paso a Paso

### Paso 1: Actualizar package.json
```json
{
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "puppeteer": "^21.0.0",
    "qrcode-terminal": "^0.12.0",
    "@google-cloud/storage": "^6.0.0",
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

### Paso 2: Actualizar server.ts
- Usar whatsapp-web.js en lugar de Baileys
- Integrar Cloud Storage para persistencia
- Manejar QR code y reconexión

### Paso 3: Actualizar Dockerfile
- Instalar Chrome/Chromium
- Configurar Puppeteer

### Paso 4: Desplegar con min-instances=1
```bash
gcloud run deploy whatsapp-service \
  --min-instances 1 \
  --max-instances 1 \
  ...
```

### Paso 5: Configurar permisos de Cloud Storage
- Crear bucket para sesiones
- Dar permisos a Cloud Run service account

## Ventajas de Esta Solución

✅ Usa tu número personal de WhatsApp
✅ Más estable que Baileys (whatsapp-web.js es más maduro)
✅ Sesión persistente en Cloud Storage
✅ Instancia siempre activa (sin cold starts)
✅ Reconexión automática

## Consideraciones

⚠️ Costo: ~$10-15/mes (instancia siempre activa)
⚠️ Requiere monitoreo de conexiones
⚠️ WhatsApp puede desconectar ocasionalmente (reconexión automática)

## Tiempo Estimado

4-6 horas de implementación
