# 📸 Configurar imgbb para Reenvío de Imágenes

## 🎯 Objetivo

Configurar imgbb para subir imágenes descargadas de Twilio y obtener URLs públicas que funcionen para reenvío en WhatsApp.

---

## 📋 Paso 1: Obtener API Key de imgbb

### 1.1. Crear Cuenta en imgbb

1. **Ve a:** https://api.imgbb.com/
2. **Haz clic en:** "Get API Key" o "Sign Up"
3. **Crea una cuenta** (es gratis)
4. **Inicia sesión**

### 1.2. Obtener API Key

1. **Ve a:** https://api.imgbb.com/
2. **Haz clic en:** "Get API Key" o ve a tu dashboard
3. **Copia tu API Key**
   - Formato: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32 caracteres)

---

## 📋 Paso 2: Configurar en Render

### 2.1. Agregar Variable de Entorno

1. **Ve a Render Dashboard:**
   - https://dashboard.render.com/
   - Selecciona tu servicio (backend)

2. **Ve a Environment Variables:**
   - Haz clic en **"Environment"** o **"Add Environment Variable"**

3. **Agrega la variable:**
   - **Key:** `IMGBB_API_KEY`
   - **Value:** Tu API key de imgbb (ej: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Haz clic en:** "Save Changes"

### 2.2. Reiniciar el Servicio

1. **Render reiniciará automáticamente** cuando guardes las variables
2. **O reinicia manualmente:**
   - Ve a tu servicio → "Manual Deploy"

---

## ✅ Verificación

### Verificar en Logs

1. **Ve a Render Dashboard → Logs**
2. **Busca mensajes como:**
   ```
   [IMGBB] Subiendo imagen a imgbb...
   [IMGBB] ✅ Imagen subida exitosamente. URL pública: https://i.ibb.co/...
   ```

### Probar

1. **Envía un mensaje con foto** al número Business (`+573242145488`)
2. **Espera 1-2 segundos**
3. **Deberías recibir** el mensaje reenviado con la imagen en tu WhatsApp personal

---

## 🔍 Cómo Funciona

### Flujo Completo

1. **Alguien envía foto** → Número Business (`+573242145488`)
2. **Twilio recibe** → Webhook al backend
3. **Backend descarga** la imagen desde Twilio
4. **Backend sube** la imagen a imgbb
5. **imgbb retorna** URL pública
6. **Backend reenvía** el mensaje con la URL pública de imgbb
7. **Recibes** el mensaje con la imagen en tu WhatsApp personal

---

## ⚠️ Limitaciones de imgbb

### Plan Gratuito

- ✅ **32 MB por imagen**
- ✅ **Sin límite de imágenes** (pero con rate limits)
- ✅ **URLs permanentes** (no expiran)
- ⚠️ **Rate limit:** ~1000 requests/día

### Si Excedes el Límite

- El código enviará solo el texto con una nota
- Revisa los logs para ver el error específico

---

## 🚨 Solución de Problemas

### Error: "IMGBB_API_KEY no está configurado"

**Solución:**
1. Verifica que la variable esté en Render
2. Nombre exacto: `IMGBB_API_KEY` (mayúsculas)
3. Reinicia el servicio

### Error: "Error subiendo a imgbb"

**Posibles causas:**
1. API key inválida
2. Imagen muy grande (>32 MB)
3. Rate limit excedido
4. Error de red

**Solución:**
- Revisa los logs para el error específico
- Verifica que la API key sea correcta
- Si la imagen es muy grande, se enviará solo el texto

### Las Imágenes No Aparecen

**Verificar:**
1. Logs muestran: `[IMGBB] ✅ Imagen subida exitosamente`
2. URL pública es accesible (abre en navegador)
3. No hay errores en los logs de Twilio

---

## 📋 Checklist

- [ ] Cuenta creada en imgbb
- [ ] API key obtenida
- [ ] `IMGBB_API_KEY` configurada en Render
- [ ] Servicio reiniciado
- [ ] Logs muestran: `[IMGBB] ✅ Imagen subida exitosamente`
- [ ] Mensaje de prueba enviado
- [ ] Imagen recibida en WhatsApp personal

---

## ✅ Conclusión

**Después de configurar imgbb:**
- ✅ Las imágenes se subirán automáticamente a imgbb
- ✅ Se obtendrán URLs públicas accesibles
- ✅ Los mensajes se reenviarán con las imágenes correctamente
- ✅ Verás las imágenes en tu WhatsApp personal

**¿Necesitas ayuda con algún paso?**
