# 📞 Agregar Número a la Subcuenta - Guía

## 🔍 Situación Actual

**Estado:**
- ✅ Estás en la subcuenta "Ultralents Nueva"
- ✅ Estás en: **Phone Numbers** → **Active numbers**
- ❌ **No tienes números activos** en la subcuenta

**Opciones:**
1. **Comprar un número nuevo** en la subcuenta
2. **Transferir el número** `+573242145488` desde otra cuenta (si lo tienes)
3. **Usar el número** `+573242145488` si ya lo tienes en otra cuenta

---

## ✅ Opción 1: Comprar un Número Nuevo (Recomendado)

### Proceso:

1. **Haz clic en**: **"Buy a number"** (arriba a la derecha)
   - O ve directamente a: **Phone Numbers** → **Buy a number**

2. **Selecciona las opciones:**
   - **Country**: **Colombia** 🇨🇴
   - **Capabilities**: 
     - ✅ **SMS** (necesario para WhatsApp)
     - ✅ **Voice** (opcional, pero recomendado)
   - **Number Type**: **Mobile** o **Local**

3. **Haz clic en**: **"Search"** o **"Buscar"**

4. **Revisa los números disponibles:**
   - Busca números que te gusten
   - Verifica que tengan las capacidades necesarias (SMS)

5. **Selecciona un número** y haz clic en: **"Buy"** o **"Comprar"**

6. **Confirma** la compra

**Nota:** El número se agregará automáticamente a la subcuenta.

---

## ✅ Opción 2: Usar el Número `+573242145488` (Si Ya Lo Tienes)

### Si el Número Está en tu Cuenta Principal:

**Problema:**
- ⚠️ El número `+573242145488` puede estar en tu cuenta principal
- ⚠️ No puedes usar el mismo número en dos cuentas a la vez

**Soluciones:**

### A) Transferir el Número a la Subcuenta

1. **Ve a tu cuenta principal** (no la subcuenta)
2. **Ve a**: **Phone Numbers** → **Active numbers**
3. **Busca** el número `+573242145488`
4. **Haz clic en el número** para ver detalles
5. **Busca la opción**: **"Transfer"** o **"Transferir"**
6. **Selecciona** la subcuenta "Ultralents Nueva"
7. **Confirma** la transferencia

**Nota:** Puede que esta opción no esté disponible directamente. En ese caso, contacta soporte de Twilio para transferir el número.

### B) Usar el Número Directamente (Si Está Disponible)

**Si el número `+573242145488` NO está en ninguna cuenta de Twilio:**

1. **Ve a**: **Phone Numbers** → **Buy a number**
2. **Busca** el número `+573242145488` específicamente
3. **Si está disponible**, cómpralo
4. **Si NO está disponible**, significa que:
   - Está en otra cuenta de Twilio
   - O está en uso en otro servicio
   - Necesitas comprar un número diferente

---

## ✅ Opción 3: Comprar un Número Similar

### Si `+573242145488` No Está Disponible:

1. **Ve a**: **Phone Numbers** → **Buy a number**
2. **Selecciona**:
   - **Country**: **Colombia** 🇨🇴
   - **Capabilities**: **SMS**, **Voice**
3. **Busca** números disponibles
4. **Compra** el que prefieras
5. **Anota** el número para actualizar en Render

**Ejemplo:** Si compras `+573242145489`, actualiza:
- `TWILIO_WHATSAPP_FROM=whatsapp:+573242145489`
- `MY_WHATSAPP_NUMBER=whatsapp:+573242145489`

---

## 🎯 Recomendación

**Te recomiendo:**

1. **Primero intenta** buscar el número `+573242145488` en "Buy a number"
2. **Si está disponible**, cómpralo
3. **Si NO está disponible**, compra un número similar
4. **Anota** el número que compres para actualizar en Render

---

## 📋 Proceso Paso a Paso: Comprar Número

### Paso 1: Ir a "Buy a number"

1. **Haz clic en**: **"Buy a number"** (arriba a la derecha)
   - O ve a: **Phone Numbers** → **Buy a number**

### Paso 2: Seleccionar País y Capacidades

1. **Selecciona**:
   - **Country**: **Colombia** 🇨🇴
   - **Capabilities**: 
     - ✅ **SMS** (marcado)
     - ✅ **Voice** (marcado, opcional)
   - **Number Type**: **Mobile** o **Local**

2. **Haz clic en**: **"Search"** o **"Buscar"**

### Paso 3: Buscar Número Específico (Opcional)

**Si quieres buscar el número `+573242145488` específicamente:**

1. **En el campo de búsqueda**, ingresa: `3242145488` (sin el +57)
2. **Haz clic en**: **"Search"**
3. **Si aparece**, cómpralo
4. **Si NO aparece**, significa que no está disponible

### Paso 4: Seleccionar y Comprar

1. **Revisa** los números disponibles
2. **Selecciona** el que prefieras
3. **Haz clic en**: **"Buy"** o **"Comprar"**
4. **Confirma** la compra

### Paso 5: Verificar

1. **Ve a**: **Phone Numbers** → **Active numbers**
2. **Verifica** que el número aparezca en la lista
3. **Anota** el número completo (con +57)

---

## 📋 Después de Comprar el Número

### Paso 1: Anotar el Número

**Anota el número completo**, por ejemplo:
- `+573242145488`
- O el que hayas comprado

### Paso 2: Continuar con el Sender

1. **Ve a**: **Messaging** → **Senders** → **WhatsApp senders**
2. **Crea el sender** usando el número que compraste
3. **Vincula con Meta** seleccionando la cuenta correcta (ID: `1281121247401247`)

### Paso 3: Actualizar Variables de Entorno

**En Render, actualiza:**
```
TWILIO_WHATSAPP_FROM=whatsapp:[NÚMERO QUE COMPRASTE]
MY_WHATSAPP_NUMBER=whatsapp:[NÚMERO QUE COMPRASTE]
```

---

## ✅ Checklist

- [ ] Hice clic en "Buy a number"
- [ ] Seleccioné Colombia como país
- [ ] Seleccioné SMS como capacidad
- [ ] Busqué el número `+573242145488` (si lo necesito)
- [ ] Compré un número (el que encontré o uno similar)
- [ ] Verifiqué que el número aparece en "Active numbers"
- [ ] Anoté el número completo para actualizar en Render
- [ ] Continué con crear el sender de WhatsApp

---

## 🎯 Resumen

**Situación:**
- ❌ No tienes números activos en la subcuenta
- ✅ Necesitas comprar un número o transferir uno existente

**Recomendación:**
1. **Haz clic en "Buy a number"**
2. **Selecciona Colombia** como país
3. **Selecciona SMS** como capacidad
4. **Busca** el número `+573242145488` (si lo necesitas)
5. **Compra** el número que prefieras
6. **Anota** el número para actualizar en Render

---

## ✅ Próximos Pasos

1. **Haz clic en "Buy a number"**
2. **Selecciona Colombia** y **SMS**
3. **Busca y compra** el número que necesites
4. **Anota** el número completo
5. **Continúa** con crear el sender de WhatsApp

**¿Necesitas ayuda con algún paso específico?** Puedo guiarte en el proceso de compra o en los siguientes pasos.
