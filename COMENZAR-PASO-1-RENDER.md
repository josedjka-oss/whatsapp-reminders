# 🚀 PASO 1: Crear Base de Datos PostgreSQL en Render

## 📋 INSTRUCCIONES PASO A PASO

### **1.1. Ir a Render Dashboard**

1. **Abre tu navegador** (Chrome, Edge, Firefox, etc.)
2. **Ve a**: https://dashboard.render.com
3. **Inicia sesión** con tu cuenta de Render
   - Si no tienes cuenta, haz clic en **"Get Started"** o **"Sign Up"**
   - Puedes usar GitHub, Google, o Email para registrarte

### **1.2. Crear Base de Datos PostgreSQL**

1. **Una vez dentro de Render Dashboard**, busca el botón **"New +"** (arriba a la derecha)
   - Puede ser verde, azul, o tener un icono de "+"
2. **Haz clic en "New +"**
3. **De la lista de opciones**, selecciona: **"PostgreSQL"**
   - Si no ves PostgreSQL, busca en "Databases" o "Managed Databases"

### **1.3. Llenar Formulario de Base de Datos**

**Completa estos campos EXACTAMENTE como se muestra:**

#### **Name** (Nombre del servicio):
```
whatsapp-reminders-db
```
- Este es el nombre del servicio en Render
- Puede ser cualquier nombre, pero usa este para consistencia

#### **Database** (Nombre de la base de datos):
```
whatsapp_reminders
```
- Este es el nombre de la base de datos dentro de PostgreSQL
- Debe estar en minúsculas, sin espacios, usar guiones bajos si es necesario

#### **User** (Usuario de la base de datos):
```
whatsapp_reminders_user
```
- Usuario que se conectará a la base de datos
- Debe estar en minúsculas, sin espacios

#### **Region** (Región):
- Selecciona: **"Oregon (US West)"**
- O la región más cercana a ti si prefieres
- Recomendado: Oregon para mejor disponibilidad

#### **PostgreSQL Version** (Versión de PostgreSQL):
- Selecciona: **"16"** (la más reciente disponible)
- O la versión que te recomiende Render

#### **Plan** (Plan de pago):
- ⚠️ **FREE**: Se duerme después de 90 días de inactividad (NO recomendado)
- ✅ **STARTER ($7/mes)**: Recomendado para producción 24/7
- ✅ **STANDARD ($20/mes)**: Para mayor rendimiento

**Para producción 24/7, elige: STARTER ($7/mes)**

### **1.4. Crear Base de Datos**

1. **Revisa que todos los campos estén correctos**:
   - [ ] Name: `whatsapp-reminders-db`
   - [ ] Database: `whatsapp_reminders`
   - [ ] User: `whatsapp_reminders_user`
   - [ ] Region: `Oregon (US West)` (o la que elegiste)
   - [ ] PostgreSQL Version: `16` (o la más reciente)
   - [ ] Plan: `STARTER ($7/mes)` (o el que elegiste)

2. **Haz clic en el botón "Create Database"** (verde o azul, abajo a la derecha)

3. **Render comenzará a crear la base de datos**
   - Verás un indicador de progreso: "Creating..." → "Live"
   - Esto puede tardar 1-2 minutos

### **1.5. Esperar a que se Cree**

**Mientras Render crea la base de datos:**
- Verás un indicador de progreso
- Puedes ver los logs si los hay
- Espera hasta que el estado cambie a "Live" (verde)

**Cuando termine:**
- Verás una página con información de tu base de datos
- El estado será "Live" (verde)
- Verás las URLs de conexión (Internal Database URL, External Database URL)

### **1.6. Guardar Información (Opcional)**

**Render te mostrará:**
- **Internal Database URL**: (Para conexión desde otros servicios de Render)
- **External Database URL**: (Para conexión desde fuera de Render)

**⚠️ IMPORTANTE:**
- **NO necesitas copiar estas URLs manualmente** si vas a vincular la base de datos al servicio web (lo haremos en el PASO 2)
- Render las configurará automáticamente
- Pero **guarda estas URLs** por si necesitas conectarte manualmente en el futuro

---

## ✅ VERIFICACIÓN DEL PASO 1

**Después de crear la base de datos, verifica:**

- [ ] La base de datos está en estado "Live" (verde)
- [ ] Puedes ver las URLs de conexión (Internal y External)
- [ ] El nombre del servicio es `whatsapp-reminders-db`

---

## 🎯 SIGUIENTE PASO

**Una vez que la base de datos esté creada y en estado "Live":**

✅ **Avísame y continuamos con el PASO 2: Crear Servicio Web**

O si prefieres, puedes continuar leyendo: `PASO-A-PASO-RENDER-COMPLETO.md` en la sección "PASO 2"

---

## 🆘 ¿PROBLEMAS?

### **Error: "Payment method required"**

**Solución:**
- Render requiere un método de pago incluso para planes gratuitos
- Ve a Settings → Billing y agrega una tarjeta de crédito
- No se te cobrará hasta que uses un plan de pago

### **Error: "Name already in use"**

**Solución:**
- Cambia el nombre a: `whatsapp-reminders-db-2` o similar
- O elimina la base de datos anterior si existe

### **No ves el botón "New +"**

**Solución:**
- Asegúrate de estar en https://dashboard.render.com
- Verifica que hayas iniciado sesión correctamente
- Si es la primera vez, completa el proceso de registro

---

**¿Necesitas ayuda con algún paso específico? Avísame y te guío. 🚀**
