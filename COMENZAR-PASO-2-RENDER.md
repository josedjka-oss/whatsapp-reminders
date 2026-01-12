# 🚀 PASO 2: Crear Servicio Web en Render

## ✅ PASO 1 COMPLETADO
- ✅ Base de datos PostgreSQL creada: `whatsapp-reminders-db`
- ✅ Estado: Live

## 📋 PASO 2: CREAR SERVICIO WEB

### **2.1. Iniciar Creación de Servicio Web**

1. **En Render Dashboard**, haz clic en **"New +"** (arriba a la derecha)
2. **Selecciona**: **"Web Service"** (de la lista de opciones)
   - Puede estar en "Services" o directamente en la lista principal

### **2.2. Conectar Repositorio GitHub**

**Si es la primera vez que conectas GitHub a Render:**

1. Render te mostrará opciones para conectar tu repositorio:
   - **Opción A**: "Connect GitHub" (botón grande)
   - **Opción B**: "Connect account" o "Authorize Render"
   - **Opción C**: Ya verás una lista de repositorios si ya conectaste antes

2. **Haz clic en "Connect GitHub"** o el botón de autorización

3. **Se abrirá una ventana de GitHub**:
   - Te pedirá autorizar a Render
   - Puedes autorizar **todos los repositorios** o **solo repositorios específicos**
   - Para este proyecto, puedes autorizar solo este repositorio o todos
   - **Haz clic en "Authorize Render"** o "Install & Authorize"

4. **Después de autorizar**, volverás a Render y verás tus repositorios

**Buscar y Seleccionar tu Repositorio:**

1. **En la lista de repositorios**, busca: `josedjka-oss/recordatorios-de-whatsapp`
   - O escribe `recordatorios-de-whatsapp` en el buscador
   - Puede aparecer como `josedjka-oss/recordatorios-de-whatsapp`

2. **Haz clic en tu repositorio** para seleccionarlo:
   - `josedjka-oss/recordatorios-de-whatsapp`

3. **Verifica que esté seleccionado correctamente**
   - Deberías ver el nombre del repositorio resaltado o seleccionado

### **2.3. Configurar Servicio Web**

**Completa estos campos EXACTAMENTE:**

#### **Name** (Nombre del servicio):
```
whatsapp-reminders
```
- Este será el nombre de tu servicio web en Render
- Aparecerá en la URL: `https://whatsapp-reminders-xxxx.onrender.com`

#### **Region** (Región):
- Selecciona: **"Oregon (US West)"** 
- ⚠️ **IMPORTANTE**: Usa la misma región que la base de datos para mejor rendimiento

#### **Branch** (Rama del repositorio):
- Selecciona: **"main"** (o "master" si es tu rama principal)
- Verifica que la rama sea la correcta

#### **Root Directory** (Directorio raíz):
- **Déjalo vacío** (o escribe `/` si es necesario)
- Tu código está en la raíz del repositorio, así que no necesitas cambiar esto

#### **Runtime** (Entorno de ejecución):
- Selecciona: **"Node"**
- Render detectará automáticamente que es un proyecto Node.js
- Versión: Debería detectar Node 20 automáticamente (según tu `package.json`)

#### **Build Command** (Comando de construcción):
```
npm install && npm run build && npx prisma migrate deploy
```
- **Copia y pega EXACTAMENTE esto** (incluye los `&&`)
- Este comando:
  - Instala las dependencias (`npm install`)
  - Compila TypeScript (`npm run build`)
  - Ejecuta las migraciones de Prisma (`npx prisma migrate deploy`)

#### **Start Command** (Comando de inicio):
```
npm start
```
- **Copia y pega EXACTAMENTE esto**
- Este comando ejecuta: `node dist/server.js` (según tu `package.json`)

#### **Plan** (Plan de pago):
- ⚠️ **FREE**: Se duerme después de 15 min de inactividad (NO recomendado para producción 24/7)
- ✅ **STARTER ($7/mes)**: Recomendado para producción 24/7, siempre activo
- ✅ **STANDARD ($20/mes)**: Para mayor rendimiento

**Para producción 24/7, elige: STARTER ($7/mes)**

### **2.4. Vincular Base de Datos**

**IMPORTANTE: Hacer esto ANTES de crear el servicio**

1. **Desplázate hacia abajo** en el formulario
2. **Busca la sección "Add Database"** o "Database" o "Linked Resources"
   - Puede estar en "Advanced" o directamente visible
3. **Haz clic en "Add Database"** o el botón para agregar una base de datos
4. **Selecciona la base de datos** que creaste: `whatsapp-reminders-db`
   - Debería aparecer en la lista de bases de datos disponibles
5. **Verifica que esté seleccionada**
6. **Render automáticamente configurará la variable `DATABASE_URL`** para ti
   - Verás que `DATABASE_URL` aparece en la lista de variables de entorno (puede estar abajo del formulario)

**⚠️ IMPORTANTE:**
- Si no vinculas la base de datos ahora, tendrás que hacerlo manualmente después
- Render automáticamente creará la variable `DATABASE_URL` con la URL correcta
- Esto evita tener que copiar y pegar la URL manualmente

### **2.5. Revisar Configuración Antes de Crear**

**Verifica que todos los campos estén correctos:**

- [ ] **Name**: `whatsapp-reminders`
- [ ] **Region**: `Oregon (US West)` (misma que la DB)
- [ ] **Branch**: `main` (o `master`)
- [ ] **Root Directory**: (vacío o `/`)
- [ ] **Runtime**: `Node`
- [ ] **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: `STARTER ($7/mes)` (o el que elegiste)
- [ ] **Database vinculada**: `whatsapp-reminders-db` (debería aparecer en "Linked Resources" o similar)
- [ ] **DATABASE_URL**: (debería aparecer automáticamente en variables de entorno)

---

## ⚠️ IMPORTANTE: NO CREAR AÚN

**NO hagas clic en "Create Web Service" todavía.**

Primero necesitamos configurar las variables de entorno en el PASO 3.

---

## ✅ VERIFICACIÓN DEL PASO 2

**Después de completar la configuración (PERO ANTES DE CREAR), verifica:**

- [ ] Repositorio conectado: `josedjka-oss/recordatorios-de-whatsapp`
- [ ] Todos los campos están completos correctamente
- [ ] Base de datos `whatsapp-reminders-db` está vinculada
- [ ] `DATABASE_URL` aparece en variables de entorno (configurado automáticamente)

---

## 🎯 SIGUIENTE PASO

**NO hagas clic en "Create Web Service" todavía.**

**Siguiente paso**: PASO 3 - Configurar Variables de Entorno

Continuaremos configurando las variables de entorno antes de crear el servicio.

---

## 🆘 ¿PROBLEMAS?

### **Error: "Repository not found"**

**Solución:**
- Verifica que hayas autorizado a Render a acceder a tus repositorios
- Verifica que el repositorio exista en GitHub
- Intenta desconectar y volver a conectar GitHub

### **Error: "Branch not found"**

**Solución:**
- Verifica que la rama `main` o `master` exista en tu repositorio
- Verifica que hayas hecho push al repositorio
- Selecciona la rama correcta de la lista desplegable

### **No veo la opción "Add Database"**

**Solución:**
- Desplázate hacia abajo en el formulario
- Busca en "Advanced" o "Linked Resources"
- Si no aparece, puedes vincularla después de crear el servicio (menos conveniente)

### **No veo DATABASE_URL en variables de entorno**

**Solución:**
- No es crítico ahora, lo configuraremos manualmente en el PASO 3 si es necesario
- Render debería configurarlo automáticamente cuando vinculas la DB

---

**¿Ya completaste la configuración del servicio web? Avísame y continuamos con el PASO 3: Configurar Variables de Entorno. 🚀**
