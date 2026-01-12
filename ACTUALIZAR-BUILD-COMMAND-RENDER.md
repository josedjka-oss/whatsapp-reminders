# ⚠️ IMPORTANTE: Actualizar Build Command en Render

## 🔧 PROBLEMA DETECTADO

El error `Error TS2688: No se puede encontrar el archivo de definición de tipo para 'node'` indica que los tipos de Node.js no se están encontrando durante el build en Render.

## ✅ SOLUCIÓN APLICADA

1. ✅ **Movido `@types/node` a dependencies** (para asegurar que se instale siempre)
2. ✅ **Movidos todos los `@types/*` a dependencies** (para asegurar instalación en producción)
3. ✅ **Corregido `tsconfig.json`** (eliminado typeRoots, TypeScript encontrará tipos automáticamente)

## 📋 ACTUALIZAR BUILD COMMAND EN RENDER

**IMPORTANTE:** El Build Command actual puede no estar instalando devDependencies correctamente.

### **Build Command ACTUAL (en Render):**
```
npm install && npm run build && npx prisma migrate deploy
```

### **Build Command CORREGIDO (debe ser):**
```
npm ci --include=dev && npm run build && npx prisma migrate deploy
```

**O mejor aún (más explícito):**
```
npm install --include=dev && prisma generate && tsc && npx prisma migrate deploy
```

---

## 🔧 PASOS PARA ACTUALIZAR EN RENDER

1. **Ve a Render Dashboard** → Tu servicio web `whatsapp-reminders`
2. **Haz clic en "Settings"** (Configuración) en la pestaña izquierda
3. **Busca la sección "Build & Deploy"** o "Build Command"
4. **Actualiza el Build Command a:**
   ```
   npm install --include=dev && prisma generate && tsc && npx prisma migrate deploy
   ```
5. **Guarda los cambios**
6. **Render reiniciará automáticamente** el despliegue

---

## 🔄 ALTERNATIVA: Actualizar Build Command desde el Dashboard

**Si no puedes editar el Build Command directamente:**

1. **En Render Dashboard**, ve a tu servicio web
2. **Haz clic en "Manual Deploy"** o **"Redeploy"**
3. **Antes de hacer deploy**, busca la opción de editar el Build Command
4. **O actualiza el Build Command en la configuración** y luego haz deploy manual

---

## ✅ VERIFICACIÓN

**Después de actualizar el Build Command, el build debería:**

1. ✅ `npm install --include=dev` instala todas las dependencias incluyendo @types
2. ✅ `prisma generate` genera los tipos de Prisma
3. ✅ `tsc` compila TypeScript **SIN ERRORES** (porque ahora tiene @types/node instalado)
4. ✅ `npx prisma migrate deploy` ejecuta las migraciones
5. ✅ `npm start` inicia el servidor

---

## 🆘 SI TODAVÍA HAY ERRORES

**Si después de actualizar el Build Command sigue habiendo errores:**

1. **Verifica en Render que el Build Command sea exactamente:**
   ```
   npm install --include=dev && prisma generate && tsc && npx prisma migrate deploy
   ```

2. **Verifica los logs de Render** para ver si `@types/node` se está instalando

3. **Si `@types/node` no se instala**, puedes forzar instalación agregando al Build Command:
   ```
   npm install --include=dev @types/node@^20.14.12 && prisma generate && tsc && npx prisma migrate deploy
   ```

---

**¿Ya actualizaste el Build Command en Render? Avísame y verificamos que el build pase correctamente. 🚀**
