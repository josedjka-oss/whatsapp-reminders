# Instrucciones para Firebase Init

## ✅ Archivo .env.local creado

El archivo `.env.local` con tus credenciales ya está creado y configurado.

## Próximos Pasos

### 1. Iniciar Sesión en Firebase

Ejecuta en la terminal:
```bash
firebase login
```

Esto abrirá tu navegador para autenticarte. Una vez que inicies sesión, vuelve a la terminal.

### 2. Inicializar Firebase en el Proyecto

Ejecuta:
```bash
firebase init
```

**Durante la inicialización, selecciona:**

1. **¿Qué funciones de Firebase quieres configurar?**
   - Presiona **Espacio** para seleccionar:
     - ✅ **Firestore**
     - ✅ **Functions** 
     - ✅ **Hosting**
   - Presiona **Enter** cuando hayas seleccionado todo

2. **Selecciona un proyecto de Firebase:**
   - Usa las flechas para seleccionar: **whatsapp-scheduler-2105b**
   - Presiona **Enter**

3. **Para Firestore:**
   - ¿Qué archivo de reglas de seguridad de Firestore quieres usar?
     - Presiona **Enter** (usa `firestore.rules` existente)
   - ¿Qué archivo de índices de Firestore quieres usar?
     - Presiona **Enter** (usa `firestore.indexes.json` existente)

4. **Para Functions:**
   - ¿Qué lenguaje quieres usar?
     - Selecciona **TypeScript** (usa flechas y Enter)
   - ¿Quieres usar ESLint?
     - Escribe **Y** y Enter (Sí)
   - ¿Quieres instalar dependencias ahora?
     - Escribe **Y** y Enter (Sí)

5. **Para Hosting:**
   - ¿Qué directorio público quieres usar?
     - Escribe **out** y presiona Enter
   - ¿Configurar como aplicación de una sola página?
     - Escribe **N** y Enter (No)
   - ¿Configurar GitHub para despliegue automático?
     - Escribe **N** y Enter (No, opcional)

### 3. Verificar Configuración

Después de `firebase init`, deberías tener:
- ✅ Archivo `.firebaserc` creado
- ✅ Archivo `firebase.json` actualizado
- ✅ Carpeta `functions` configurada

## Siguiente Paso

Una vez completado `firebase init`, avísame y procederemos a construir y desplegar la aplicación.
