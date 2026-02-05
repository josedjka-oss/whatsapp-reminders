# 🔍 Cómo Verificar Qué Número y Negocio Están Verificados en Meta

## 🎯 Objetivo
Identificar qué número de WhatsApp Business está verificado en Meta y en qué cuenta/portfolio.

---

## 📋 Método 1: Verificar en Meta Business Suite (Recomendado)

### Paso 1: Acceder a Meta Business Suite

1. Ve a: **https://business.facebook.com/**
2. Inicia sesión con tu cuenta de Facebook/Meta
3. Si tienes múltiples cuentas, selecciona la correcta

### Paso 2: Ver Todos los Portfolios

1. En la parte superior izquierda, verás el nombre del portfolio actual
2. Haz clic en el nombre del portfolio (ej: "ultralents")
3. Verás un menú desplegable con **todos tus portfolios**
4. Anota todos los portfolios que veas

### Paso 3: Verificar Estado de Verificación por Portfolio

Para cada portfolio:

1. **Selecciona el portfolio** desde el menú desplegable
2. Ve a: **Configuración** (ícono de engranaje ⚙️ en la parte superior)
3. Baja hasta la sección: **"Verificación del negocio"**
4. Verás:
   - **Nombre del negocio**: Ej: "DISTRIBUIDORA ULTRALENTS SAS"
   - **Estado**: ✅ Verificado / ⚠️ Pendiente / ❌ No verificado
   - **Fecha de verificación**: Cuándo se verificó
   - **Número de teléfono**: Si está visible

### Paso 4: Ver Números de WhatsApp Business

1. En el mismo portfolio, ve a: **Configuración** → **WhatsApp Business**
2. O directamente: **https://business.facebook.com/settings/whatsapp-business**
3. Verás:
   - **Números conectados**: Lista de números de WhatsApp Business
   - **Estado de cada número**: Activo, Pendiente, etc.
   - **Cuenta de WhatsApp Business**: Nombre asociado

### Paso 5: Ver Detalles del Número

1. Haz clic en el número que quieres verificar
2. Verás información detallada:
   - **Número completo**: +57XXXXXXXXXX
   - **Estado**: Verificado, Pendiente, etc.
   - **Fecha de verificación**
   - **Cuenta de negocio asociada**
   - **Templates aprobados**

---

## 📱 Método 2: Verificar en WhatsApp Business Manager

### Paso 1: Acceder a WhatsApp Business Manager

1. Ve a: **https://business.facebook.com/whatsapp**
2. O desde Meta Business Suite: **Herramientas** → **WhatsApp Business Manager**

### Paso 2: Ver Todas las Cuentas

1. En el menú lateral, busca: **"Cuentas"** o **"Accounts"**
2. Verás todas las cuentas de WhatsApp Business asociadas
3. Cada cuenta mostrará:
   - **Nombre de la cuenta**
   - **Número de teléfono**
   - **Estado de verificación**
   - **Portfolio asociado**

### Paso 3: Ver Números por Cuenta

1. Haz clic en una cuenta
2. Ve a: **"Números de teléfono"** o **"Phone Numbers"**
3. Verás todos los números asociados a esa cuenta
4. Revisa el estado de cada uno

---

## 🔍 Método 3: Verificar en Configuración de Negocio

### Paso 1: Acceder a Configuración

1. Ve a: **https://business.facebook.com/settings**
2. O desde Meta Business Suite: **Configuración** → **Configuración de negocio**

### Paso 2: Ver Información de Verificación

1. Busca la sección: **"Verificación del negocio"**
2. Verás una lista de todos los negocios verificados
3. Para cada negocio:
   - **Nombre**: Ej: "DISTRIBUIDORA ULTRALENTS SAS"
   - **Estado**: ✅ Verificado
   - **Fecha**: Cuándo se verificó
   - **Número**: Si está visible

### Paso 3: Ver Números Asociados

1. Haz clic en un negocio verificado
2. Verás detalles:
   - **Números de teléfono asociados**
   - **Estado de cada número**
   - **Cuentas de WhatsApp Business conectadas**

---

## 📊 Método 4: Usar la API de Meta (Avanzado)

Si tienes acceso a la API de Meta, puedes verificar programáticamente:

```bash
# Necesitas un Access Token de Meta
curl -X GET "https://graph.facebook.com/v18.0/me/businesses" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Nota**: Esto requiere configuración avanzada y tokens de acceso.

---

## ✅ Checklist para Identificar el Número Correcto

Usa esta lista para verificar:

- [ ] ¿Qué portfolios tienes en Meta Business Suite?
- [ ] ¿Cuál portfolio tiene el negocio verificado?
- [ ] ¿Qué número de teléfono está asociado al negocio verificado?
- [ ] ¿El número está en formato: +57XXXXXXXXXX?
- [ ] ¿El estado del número es "Verificado" ✅?
- [ ] ¿La fecha de verificación es reciente?
- [ ] ¿Hay templates aprobados para ese número?

---

## 🔧 Cómo Conectar el Nuevo Número con Twilio

Una vez que identifiques el número verificado:

### Paso 1: Verificar en Twilio

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Busca el número verificado (ej: +573043577875)
3. Verifica que esté listado y con estado correcto

### Paso 2: Actualizar Variables de Entorno

Si el número es diferente al actual, actualiza en Render:

1. Ve a: **Render Dashboard** → Tu servicio
2. Ve a: **Environment** → **Environment Variables**
3. Actualiza: `TWILIO_WHATSAPP_FROM`
4. Nuevo valor: `whatsapp:+57XXXXXXXXXX` (el número verificado)

### Paso 3: Verificar Templates

1. En Twilio Console, ve a: **Messaging** → **Content Templates**
2. Verifica que el template `HX1d443af43266b056998367e82a4441bd` esté aprobado
3. Si no está, necesitas aprobarlo para el nuevo número

---

## 📝 Información a Recolectar

Cuando verifiques, anota:

1. **Número verificado**: +57XXXXXXXXXX
2. **Portfolio en Meta**: Nombre del portfolio
3. **Negocio verificado**: Nombre del negocio
4. **Fecha de verificación**: Cuándo se verificó
5. **Estado en Twilio**: Verificado, Pendiente, etc.
6. **Templates aprobados**: Lista de templates

---

## 🚨 Problemas Comunes

### "No veo el número en Meta Business Suite"

**Solución:**
- Verifica que estés en el portfolio correcto
- Asegúrate de tener permisos de administrador
- Revisa si el número está en otra cuenta de Meta

### "El número está verificado en Meta pero no en Twilio"

**Solución:**
- Verifica que el número esté registrado en Twilio
- Puede necesitar reconexión entre Meta y Twilio
- Contacta soporte de Twilio si es necesario

### "Tengo múltiples números y no sé cuál usar"

**Solución:**
- Usa el número más recientemente verificado
- Verifica en Twilio cuál tiene templates aprobados
- Prueba enviando un mensaje de prueba

---

## 🔄 Siguiente Paso Después de Identificar

Una vez que identifiques el número:

1. **Actualiza `TWILIO_WHATSAPP_FROM`** en Render con el número correcto
2. **Verifica el estado** usando el endpoint:
   ```bash
   curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders
   ```
3. **Prueba enviando un mensaje** de prueba
4. **Monitorea los logs** para verificar que funciona

---

## 📞 Si Necesitas Ayuda

Si no puedes identificar el número:

1. **Toma capturas de pantalla** de:
   - Meta Business Suite → Configuración → Verificación del negocio
   - Meta Business Suite → Configuración → WhatsApp Business
   - Twilio Console → WhatsApp Senders

2. **Anota**:
   - Todos los portfolios que ves
   - Todos los números que aparecen
   - Estados de verificación

3. **Comparte la información** para ayudarte a identificar el correcto

---

## 🎯 Resumen Rápido

**Para verificar rápidamente:**

1. Ve a: **https://business.facebook.com/settings/whatsapp-business**
2. Revisa todos los portfolios en el menú desplegable
3. Para cada portfolio, ve a: **Configuración** → **Verificación del negocio**
4. Anota el número que esté **✅ Verificado** y tenga fecha reciente
5. Ese es el número que debes usar en `TWILIO_WHATSAPP_FROM`
