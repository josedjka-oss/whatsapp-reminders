# 🚀 Plan de Migración a Baileys

## ¿Por qué Baileys?

✅ **Elimina TODOS los problemas actuales:**
- No necesita Puppeteer/Chrome
- No más errores SIGPIPE
- No más problemas de memoria/timeout
- Más simple y confiable

✅ **Funciona perfectamente en Cloud Run:**
- Más ligero (no necesita Chrome)
- Inicia más rápido
- Usa menos memoria
- Más estable

✅ **Misma funcionalidad:**
- Genera QR para conectar
- Envía mensajes programados
- Mantiene sesión
- Todo lo que necesitas

---

## Plan de Implementación:

### Paso 1: Actualizar Cloud Run con Baileys
- Reemplazar `whatsapp-web.js` por `@whiskeysockets/baileys`
- Simplificar el código (sin Puppeteer)
- Mantener los mismos endpoints (/initialize, /status, /send-message)

### Paso 2: Actualizar dependencias
- Agregar `@whiskeysockets/baileys` y `qrcode`
- Remover `whatsapp-web.js` y `qrcode-terminal`
- Simplificar Dockerfile (no necesita Chrome)

### Paso 3: Probar y desplegar
- Probar localmente (opcional)
- Desplegar a Cloud Run
- Probar desde el frontend

**Tiempo estimado: 1-2 horas**

---

## ¿Procedo con la migración?

Si estás de acuerdo, haré:
1. ✅ Crear nuevo `server.ts` con Baileys
2. ✅ Actualizar `package.json` con las dependencias correctas
3. ✅ Simplificar `Dockerfile` (sin Chrome)
4. ✅ Mantener la misma estructura de endpoints
5. ✅ Todo funcionará igual pero sin problemas

**¿Quieres que proceda ahora?**
