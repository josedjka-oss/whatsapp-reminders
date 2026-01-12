# 📅 Guía Paso a Paso: Configurar Cloud Scheduler

## Objetivo
Configurar Cloud Scheduler para que ejecute automáticamente la función `checkAndSendMessages` cada 15 minutos y envíe los mensajes programados.

---

## Paso 1: Acceder a Google Cloud Console

1. **Abre tu navegador** (Chrome recomendado)
2. Ve a: **https://console.cloud.google.com/**
3. **Inicia sesión** con tu cuenta de Google (la misma que usaste en Firebase)

---

## Paso 2: Seleccionar el Proyecto Correcto

1. En la parte superior de la página, verás un **selector de proyectos** (dropdown)
2. Haz clic en el selector
3. Busca y selecciona: **`whatsapp-scheduler-2105b`**
   - Si no lo ves, escribe "whatsapp" en el buscador
4. Espera a que se cargue el proyecto

---

## Paso 3: Navegar a Cloud Scheduler

**Opción A: Desde el menú de navegación**
1. En el menú lateral izquierdo (☰), busca **"Cloud Scheduler"**
2. Si no lo ves, haz clic en **"Más productos"** o **"More products"**
3. Busca **"Cloud Scheduler"** en la lista
4. Haz clic en él

**Opción B: Desde la barra de búsqueda**
1. En la barra de búsqueda superior, escribe: **"Cloud Scheduler"**
2. Selecciona **"Cloud Scheduler"** de los resultados

**Opción C: URL directa**
1. Ve directamente a: **https://console.cloud.google.com/cloudscheduler?project=whatsapp-scheduler-2105b**

---

## Paso 4: Habilitar Cloud Scheduler API (si es necesario)

Si es la primera vez que usas Cloud Scheduler:

1. Verás un mensaje: **"API no habilitada"** o **"API not enabled"**
2. Haz clic en **"Habilitar API"** o **"Enable API"**
3. Espera unos segundos mientras se habilita

---

## Paso 5: Crear Nuevo Job

1. En la página de Cloud Scheduler, verás un botón:
   - **"Crear trabajo"** (español) o
   - **"Create Job"** (inglés)
2. Haz clic en ese botón

---

## Paso 6: Configurar el Job

Se abrirá un formulario. Completa cada sección:

### 6.1 Información Básica

**Nombre:**
- Escribe: `check-whatsapp-messages`
- (Solo letras minúsculas, números y guiones)

**Descripción (Opcional):**
- Escribe: `Verifica y envía mensajes programados de WhatsApp cada 15 minutos`

**Región:**
- Selecciona: **`us-central1`** (Iowa)
- O la región donde desplegaste tus Functions

---

### 6.2 Frecuencia de Ejecución

**Frecuencia:**
- Selecciona: **"Personalizado"** o **"Custom"**
- En el campo de texto, escribe exactamente:
  ```
  */15 * * * *
  ```
- Esto significa: cada 15 minutos

**Zona horaria:**
- Selecciona tu zona horaria, por ejemplo:
  - `America/Mexico_City` (México)
  - `America/New_York` (Este de EE.UU.)
  - `America/Los_Angeles` (Oeste de EE.UU.)
  - O busca la tuya en la lista

---

### 6.3 Target (Destino)

**Tipo de destino:**
- Selecciona: **"Cloud Function"** o **"Cloud Function (HTTP)"**

**URL:**
- Haz clic en **"Seleccionar"** o **"Select"**
- Se abrirá un dropdown con tus Functions
- Selecciona: **`checkAndSendMessages`**
- Si no aparece, escribe: `checkAndSendMessages`

**Región:**
- Selecciona: **`us-central1`** (o la región donde desplegaste)

**Método HTTP:**
- Deja el valor por defecto: **"GET"** o **"POST"**

---

### 6.4 Configuración Avanzada (Opcional)

Puedes dejar estos campos con sus valores por defecto:
- **Timeout**: 60 segundos
- **Retry configuration**: Por defecto

---

## Paso 7: Crear el Job

1. Revisa toda la configuración
2. Haz clic en el botón **"Crear"** o **"Create"** (abajo a la derecha)
3. Espera unos segundos mientras se crea el job

---

## Paso 8: Verificar que Funciona

Después de crear el job, deberías ver:

1. **Lista de Jobs:**
   - Verás `check-whatsapp-messages` en la lista
   - Estado: **"Habilitado"** o **"Enabled"** (debería estar verde)

2. **Detalles del Job:**
   - Haz clic en el nombre del job para ver detalles
   - Verás:
     - **Última ejecución**: Se actualizará después de la primera ejecución
     - **Próxima ejecución**: En los próximos 15 minutos
     - **Frecuencia**: `*/15 * * * *`

---

## Paso 9: Probar Manualmente (Opcional)

Para probar que funciona sin esperar 15 minutos:

1. En la lista de jobs, haz clic en los **3 puntos (⋮)** al lado de `check-whatsapp-messages`
2. Selecciona **"Ejecutar ahora"** o **"Run now"**
3. Espera unos segundos
4. Verifica en **"Última ejecución"** que se ejecutó correctamente

---

## ✅ Verificación Final

Para asegurarte de que todo funciona:

1. **Cloud Scheduler:**
   - ✅ Job `check-whatsapp-messages` creado
   - ✅ Estado: Habilitado
   - ✅ Frecuencia: `*/15 * * * *`

2. **Firebase Functions:**
   - ✅ Función `checkAndSendMessages` desplegada
   - ✅ Puedes verla en Firebase Console → Functions

3. **Aplicación:**
   - ✅ Abre: https://whatsapp-scheduler-2105b.web.app
   - ✅ Conecta WhatsApp
   - ✅ Crea un mensaje programado
   - ✅ El mensaje se enviará automáticamente cuando llegue la hora

---

## 🔍 Solución de Problemas

### "No veo Cloud Scheduler en el menú"
- Usa la barra de búsqueda superior
- O ve directamente a: https://console.cloud.google.com/cloudscheduler

### "No aparece la función checkAndSendMessages"
- Verifica que las Functions estén desplegadas en Firebase Console
- Asegúrate de seleccionar la región correcta (`us-central1`)

### "El job no se ejecuta"
- Verifica que el estado sea "Habilitado"
- Revisa los logs: Firebase Console → Functions → checkAndSendMessages → Logs

### "Error al ejecutar"
- Revisa que WhatsApp esté conectado en la aplicación
- Verifica los logs de la función para ver el error específico

---

## 📝 Notas Importantes

- ⏰ Los mensajes se verifican **cada 15 minutos**
- ⚠️ Puede haber un retraso de hasta 15 minutos desde la hora programada
- 🔄 Si un mensaje falla, se marcará como "error" y podrás ver el motivo
- 📱 Los mensajes recurrentes mensuales se crean automáticamente para el siguiente mes

---

## 🎉 ¡Listo!

Una vez configurado Cloud Scheduler, tu aplicación funcionará completamente de forma automática. Los mensajes se enviarán sin intervención manual.
