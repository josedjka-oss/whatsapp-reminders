# 🔧 Solución: Error 500 en /api/chat

## 🔍 Diagnóstico

El error 500 puede deberse a:

1. **Variables de entorno no cargadas:** Next.js necesita reiniciarse después de crear `.env.local`
2. **Backend requiere autenticación:** El backend siempre requiere `ADMIN_PASSWORD`
3. **Backend no disponible:** El backend en Render puede estar caído o no responder

---

## ✅ Solución Paso a Paso

### 1. Verificar que `.env.local` existe

```bash
cd frontend
cat .env.local
```

Debe contener:
```
NEXT_PUBLIC_API_URL=https://whatsapp-reminders-mzex.onrender.com
ADMIN_PASSWORD=2023
```

### 2. Reiniciar el servidor de desarrollo

**IMPORTANTE:** Next.js solo carga `.env.local` al iniciar. Si lo creaste después de iniciar el servidor:

1. Detén el servidor (Ctrl+C)
2. Reinicia:
   ```bash
   npm run dev
   ```

### 3. Verificar que el backend está funcionando

```bash
curl https://whatsapp-reminders-mzex.onrender.com/health
```

O en el navegador: https://whatsapp-reminders-mzex.onrender.com/health

### 4. Probar el proxy directamente

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola"}'
```

### 5. Revisar los logs del servidor

En la terminal donde corre `npm run dev`, deberías ver:
```
[CHAT PROXY] Configuración: { hasBackendUrl: true, ... }
[CHAT PROXY] Llamando a: https://whatsapp-reminders-mzex.onrender.com/api/ai
```

---

## 🐛 Errores Comunes

### Error: "NEXT_PUBLIC_API_URL no configurado"
- **Causa:** `.env.local` no existe o Next.js no lo cargó
- **Solución:** Crea `.env.local` y reinicia el servidor

### Error: 401 Unauthorized
- **Causa:** `ADMIN_PASSWORD` incorrecto o no configurado
- **Solución:** Verifica que `ADMIN_PASSWORD=2023` en `.env.local`

### Error: "Failed to fetch" o "Network error"
- **Causa:** El backend en Render está caído o no responde
- **Solución:** Verifica que el backend esté funcionando en Render

### Error: 500 Internal Server Error
- **Causa:** Error en el backend (OpenAI, Prisma, etc.)
- **Solución:** Revisa los logs del backend en Render

---

## 📝 Checklist

- [ ] `.env.local` existe en `frontend/`
- [ ] `.env.local` contiene `NEXT_PUBLIC_API_URL`
- [ ] `.env.local` contiene `ADMIN_PASSWORD=2023`
- [ ] Servidor de Next.js reiniciado después de crear `.env.local`
- [ ] Backend en Render está funcionando
- [ ] Logs del servidor muestran la configuración correcta

---

## 🔄 Si el problema persiste

1. **Revisa la consola del navegador** (F12) para ver el error exacto
2. **Revisa los logs del servidor** de Next.js en la terminal
3. **Revisa los logs del backend** en Render Dashboard
4. **Prueba el backend directamente:**
   ```bash
   curl -X POST https://whatsapp-reminders-mzex.onrender.com/api/ai \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 2023" \
     -d '{"text": "Hola"}'
   ```
