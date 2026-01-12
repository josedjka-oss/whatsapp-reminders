# 🔄 Redesplegar en Render

## 🎯 FORZAR NUEVO DESPLIEGUE

### **OPCIÓN 1: Manual Deploy (Recomendado)**

1. **Ve a Render Dashboard:** https://dashboard.render.com/
2. **Haz clic en tu servicio:** `whatsapp-reminders`
3. **En la parte superior derecha**, busca el botón:
   - **"Manual Deploy"** o **"Desplegar manualmente"**
   - O **"Redeploy"** o **"Redesplegar"**
4. **Haz clic en el botón**
5. **Selecciona:** **"Deploy latest commit"** o **"Desplegar último commit"**
6. **Confirma** el despliegue
7. **Espera 3-5 minutos** mientras Render despliega

---

### **OPCIÓN 2: Desde Settings**

1. **Ve a Render Dashboard** → Tu servicio `whatsapp-reminders`
2. **Haz clic en "Settings"** (Configuración)
3. **Busca la sección "Manual Deploy"** o **"Deploy"**
4. **Haz clic en "Deploy latest commit"**
5. **Espera** a que termine el despliegue

---

### **OPCIÓN 3: Hacer un Cambio Menor y Push**

**Si no encuentras el botón de Manual Deploy:**

1. **Haz un cambio menor** en cualquier archivo (ej: agregar un comentario)
2. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Trigger redeploy"
   git push origin main
   ```
3. **Render detectará automáticamente** el cambio y desplegará

---

## 📊 VERIFICAR EL DESPLIEGUE

### **Durante el Despliegue:**

1. **Ve a la pestaña "Events"** o **"Eventos"** en Render
2. **Verás el progreso del build:**
   - ✅ "Building..."
   - ✅ "Deploying..."
   - ✅ "Live"

### **Después del Despliegue:**

1. **Ve a la pestaña "Logs"**
2. **Deberías ver:**
   ```
   [INIT] Conectando a la base de datos...
   [INIT] ✅ Conectado a la base de datos
   [INIT] ✅ Scheduler iniciado
   [INIT] ✅ Servidor escuchando en puerto 10000
   ```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

**Después del despliegue:**

1. **Verifica Health Check:**
   ```
   GET https://whatsapp-reminders-mzex.onrender.com/health
   ```
   Debe responder: `{"status":"ok",...}`

2. **Verifica que el scheduler esté funcionando:**
   - En los logs deberías ver cada minuto:
   ```
   [SCHEDULER] Verificando recordatorios activos...
   [SCHEDULER] Encontrados 0 recordatorios activos
   ```

3. **Prueba el webhook:**
   - Envía un mensaje desde WhatsApp a `+1 415 523 8886`
   - Verifica los logs que aparezca `[WEBHOOK] ========== WEBHOOK RECIBIDO ==========`

---

## 🆘 SI EL DESPLIEGUE FALLA

**Si ves errores en el build:**

1. **Revisa los logs de build** en Render
2. **Busca el error específico**
3. **Comparte el error** y te ayudo a solucionarlo

**Errores comunes:**
- ❌ Error de TypeScript → Verifica que el código compile
- ❌ Error de Prisma → Verifica que las migraciones estén correctas
- ❌ Error de variables de entorno → Verifica que todas estén configuradas

---

**¿Ya iniciaste el redeploy en Render? Avísame cuando termine y verificamos que todo funcione correctamente. 🚀**
