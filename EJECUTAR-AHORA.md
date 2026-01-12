# 🚀 Ejecutar Migración Automática a Baileys

## ✅ Todo está listo para ejecutarse automáticamente

He creado un script de PowerShell que hace **TODO** automáticamente. Solo necesitas ejecutarlo una vez.

## 📋 Pasos:

### 1. Abre PowerShell en el directorio del proyecto

Asegúrate de estar en: `C:\Users\user\Desktop\WHATS`

### 2. Ejecuta el script:

```powershell
.\EJECUTAR-MIGRACION-BAILEYS.ps1
```

Si PowerShell te pide permiso, ejecuta primero:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\EJECUTAR-MIGRACION-BAILEYS.ps1
```

## 🎯 ¿Qué hace el script?

1. ✅ Actualiza `package.json` con dependencias de Baileys
2. ✅ Actualiza `Dockerfile` (simplificado, sin Chrome)
3. ✅ Verifica que `server-baileys.ts` existe
4. ✅ Despliega automáticamente a Cloud Run
5. ✅ Te muestra el resultado

**Tiempo estimado: 5-10 minutos** (solo el despliegue)

## ⚠️ Requisitos previos:

- ✅ Tener `gcloud` instalado y autenticado
- ✅ Estar en el directorio correcto (`WHATS`)
- ✅ Tener permisos de escritura

## 🎉 Después del despliegue:

El script te dirá cuando termine. Luego:

1. Ve a: https://whatsapp-scheduler-2105b.web.app
2. Haz clic en "Generar código QR"
3. Debería funcionar mucho mejor ahora (sin errores SIGPIPE, más rápido)

---

## 🔧 Si hay problemas:

Si el script falla, revisa:
1. ¿Estás en el directorio correcto? (`C:\Users\user\Desktop\WHATS`)
2. ¿Tienes gcloud instalado? (`gcloud --version`)
3. ¿Estás autenticado? (`gcloud auth list`)

Si necesitas ayuda, comparte el mensaje de error que aparece.
