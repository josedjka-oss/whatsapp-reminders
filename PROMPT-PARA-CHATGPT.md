# PROMPT: Implementación de WhatsApp Scheduler

## Contexto del Proyecto

Estoy implementando una aplicación web para programar y enviar mensajes de WhatsApp automáticamente. La aplicación debe:

1. **Funcionalidad Principal:**
   - Permitir programar mensajes de WhatsApp con fecha y hora específica
   - Soporte para diferentes tipos de recurrencia:
     - Único (una sola vez)
     - Diario (cada día)
     - Cada 2 semanas (biweekly)
     - Mensual (cada mes)
   - Enviar mensajes automáticamente cuando llegue la fecha/hora programada
   - Usar el número personal de WhatsApp del usuario (no una API de terceros)

2. **Arquitectura Técnica:**
   - **Frontend:** Next.js 14 (App Router) con React, TypeScript, TailwindCSS
   - **Backend:** 
     - Firebase Functions (como proxy)
     - Cloud Run (servicio con instancia persistente) para WhatsApp automation
   - **Base de Datos:** Firestore para almacenar mensajes programados
   - **Scheduling:** Cloud Scheduler para verificar mensajes pendientes cada 15 minutos
   - **WhatsApp Library:** whatsapp-web.js (requiere Puppeteer/Chrome)

3. **Problema Actual:**
   - Estamos migrando de Baileys a whatsapp-web.js
   - El build en Cloud Run está fallando constantemente
   - El servicio desplegado sigue usando Baileys (versión anterior)
   - No podemos ver el error específico del build desde PowerShell
   - Necesitamos usar el número personal de WhatsApp del usuario

4. **Configuración Actual:**
   - Proyecto Firebase: `whatsapp-scheduler-2105b`
   - Cloud Run Service: `whatsapp-service`
   - Región: `us-central1`
   - Instancia: Configurada con `min-instances: 1` para mantener sesión activa
   - Persistencia: Cloud Storage para guardar sesión de WhatsApp (`whatsapp-sessions-2105b`)

5. **Errores Encontrados:**
   - Build falla con "Build failed; check build logs for details"
   - No podemos ver el error específico desde línea de comandos de Windows
   - El servicio sigue corriendo versión anterior (Baileys) porque el build nuevo no se despliega
   - Logs muestran que el servicio usa: "useMultiFileAuthState", "makeWASocket" (Baileys)

6. **Cambios Realizados (Código Local):**
   - Migrado de `@whiskeysockets/baileys` a `whatsapp-web.js`
   - Implementada persistencia de sesión en Cloud Storage
   - Dockerfile actualizado con instalación de Chrome para Puppeteer
   - Tipos TypeScript corregidos
   - tsconfig.json relajado (`strict: false`)
   - Variables de entorno configuradas para Puppeteer

7. **Archivos Clave:**
   - `cloud-run/src/server.ts`: Servidor Express con whatsapp-web.js
   - `cloud-run/Dockerfile`: Imagen Docker con Chrome instalado
   - `cloud-run/package.json`: Dependencias actualizadas a whatsapp-web.js
   - `functions/src/index.ts`: Firebase Functions que llaman a Cloud Run

## Lo Que Necesito

**Ayúdame a diagnosticar y corregir el error del build en Cloud Run para que la nueva versión con whatsapp-web.js se despliegue correctamente.**

### Tareas Específicas:

1. **Diagnosticar el error del build:**
   - El build falla pero no vemos el error específico
   - Necesito identificar qué paso del Dockerfile está fallando:
     - ¿Instalación de dependencias del sistema?
     - ¿Instalación de Chrome?
     - ¿npm install?
     - ¿Compilación TypeScript?
     - ¿Timeout del build?

2. **Corregir el problema:**
   - Una vez identificado el error, aplicar la corrección específica
   - Asegurar que el build complete exitosamente
   - Verificar que el servicio se despliegue con whatsapp-web.js (no Baileys)

3. **Verificar que funciona:**
   - El servicio debe generar QR code correctamente
   - La sesión debe persistirse en Cloud Storage
   - Los mensajes deben enviarse correctamente

### Restricciones:

- **Debo usar el número personal de WhatsApp** (no Twilio ni otras APIs)
- **Debo usar instancia persistente** (`min-instances: 1`) para mantener sesión activa
- **Debo usar Cloud Storage** para persistir sesión (no /tmp)
- **No puedo depender de interacción manual** durante despliegue

### Estado Actual del Código:

El código local está actualizado con whatsapp-web.js, pero el build falla y no se despliega. El servicio sigue corriendo la versión anterior con Baileys.

---

**¿Puedes ayudarme a diagnosticar el error del build y corregirlo para que la aplicación funcione con whatsapp-web.js usando mi número personal de WhatsApp?**
