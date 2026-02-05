# 🗑️ Eliminar Negocio "En Revisión" - Paso a Paso

## ⚠️ Objetivo

Eliminar el negocio "Ultralents" (ID: 1375359943801886) que está "En revisión" para liberar el número `+573043577875`.

**Consecuencias:**
- ✅ El número se liberará
- ✅ Podrás agregarlo en el portfolio "ultralents" (verificado)
- ❌ Perderás el progreso de verificación (3 semanas)
- ❌ Se eliminará el portfolio "Ultralents"

---

## 🎯 Paso 1: Acceder a la Configuración del Negocio

1. Ve a: **https://business.facebook.com/settings**
2. **Asegúrate de estar en el portfolio correcto:**
   - Selecciona: **"Ultralents"** (ID: 1375359943801886)
   - El que está "En revisión"
   - NO confundir con "ultralents" (verificado)

3. Ve a: **"Información del portfolio comercial"** o **"Business Info"**

---

## 🗑️ Paso 2: Buscar Opción para Eliminar/Abandonar

### Opción A: "Abandonar negocio"

1. En la página de configuración, busca:
   - **"Abandonar negocio"** o **"Leave business"**
   - **"Eliminar portfolio"** o **"Delete portfolio"**
   - **"Eliminar negocio"** o **"Delete business"**

2. Puede estar en:
   - Parte inferior de la página
   - Sección "Acciones" o "Actions"
   - Menú de tres puntos (⋮)
   - Sección "Configuración avanzada"

### Opción B: Desde "Mi información"

1. Ve a: **"Mi información"** o **"My information"**
2. Busca la opción: **"Abandonar negocio"** o **"Leave business"**
3. Haz clic en ella

---

## ⚠️ Paso 3: Confirmar la Eliminación

1. Meta te pedirá confirmar la acción
2. Puede mostrar advertencias como:
   - "¿Estás seguro de que quieres abandonar este negocio?"
   - "Esta acción no se puede deshacer"
   - "Se eliminarán todos los recursos asociados"

3. **Lee cuidadosamente** las advertencias
4. **Confirma** que quieres eliminar/abandonar
5. Haz clic en: **"Confirmar"**, **"Eliminar"**, o **"Abandonar"**

---

## ⏱️ Paso 4: Esperar la Actualización

1. **Espera 3-5 minutos** para que Meta procese la eliminación
2. El portfolio "Ultralents" se eliminará
3. El número `+573043577875` debería quedar liberado

---

## ✅ Paso 5: Verificar que se Eliminó

1. **Refresca la página** en Meta Business Suite
2. **Verifica que el portfolio "Ultralents" ya no aparezca** en la lista
3. Solo debería quedar el portfolio "ultralents" (verificado)

---

## 📱 Paso 6: Agregar el Número en el Portfolio Correcto

Después de eliminar, agrega el número en el portfolio verificado:

1. Ve a: **https://business.facebook.com/whatsapp**
2. **Asegúrate de estar en el portfolio "ultralents"** (verificado)
   - El que tiene "DISTRIBUIDORA ULTRALENTS SAS"
   - ID: 1245193047190166

3. Selecciona la cuenta: **"ultralents"**
4. Ve a: **"Números de teléfono"** o **"Phone Numbers"**
5. Haz clic en: **"Agregar número"** o **"Add Phone Number"**
6. Ingresa: `+573043577875`
7. Ahora debería funcionar (ya no estará "en uso")

---

## 🔧 Paso 7: Verificar en Twilio

1. Ve a: **https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders**
2. Verifica que el número `+573043577875` esté:
   - ✅ Listado
   - ✅ Estado: "Online"
   - ✅ Sin bloqueos

---

## ⚙️ Paso 8: Actualizar Configuración (Si es Necesario)

1. Ve a: **Render Dashboard** → Tu servicio → **Environment**
2. Verifica que `TWILIO_WHATSAPP_FROM` sea: `whatsapp:+573043577875`
3. Si es diferente, actualízalo
4. Guarda los cambios

---

## 🧪 Paso 9: Probar el Número

### Verificar Estado:

```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/whatsapp-senders/573043577875
```

### Crear Recordatorio de Prueba:

1. Ve a: **https://whatsapp-reminders.vercel.app/chat**
2. Escribe: "Recuérdame en 5 minutos probar el número liberado"
3. Verifica que llegue al WhatsApp

---

## ⚠️ Si No Encuentras la Opción para Eliminar

### Problema: No ves "Abandonar negocio"

**Soluciones:**

#### Opción 1: Buscar en Otra Ubicación

1. Ve a: **https://business.facebook.com/settings/businesses**
2. Busca el negocio "Ultralents"
3. Haz clic en los tres puntos (⋮) al lado del nombre
4. Busca: **"Eliminar"** o **"Delete"**

#### Opción 2: Desde el Menú Principal

1. En Meta Business Suite, haz clic en el nombre del portfolio (arriba izquierda)
2. Busca el portfolio "Ultralents" en la lista
3. Haz clic en los tres puntos (⋮)
4. Busca: **"Eliminar portfolio"** o **"Delete portfolio"**

#### Opción 3: Contactar Soporte de Meta

1. Ve a: **https://business.facebook.com/help**
2. Crea un ticket explicando:
   - Portfolio ID: 1375359943801886
   - Que la verificación está "En revisión" desde hace 3 semanas
   - Que necesitas eliminarlo para liberar el número
   - Que quieres usar el número en el portfolio "ultralents" (ID: 1245193047190166)

---

## 📋 Checklist

- [ ] Accedí a la configuración del portfolio "Ultralents" (En revisión)
- [ ] Busqué la opción "Abandonar negocio" o "Eliminar portfolio"
- [ ] Confirmé la eliminación
- [ ] Esperé 3-5 minutos
- [ ] Verifiqué que el portfolio se eliminó
- [ ] Cambié al portfolio "ultralents" (verificado)
- [ ] Agregué el número `+573043577875` en WhatsApp Business Manager
- [ ] Verifiqué que el número aparezca correctamente
- [ ] Probé enviando un mensaje

---

## 🎯 Resumen

**Proceso:**
1. **Accede** a la configuración del portfolio "Ultralents" (En revisión)
2. **Busca** la opción "Abandonar negocio" o "Eliminar portfolio"
3. **Confirma** la eliminación
4. **Espera** 3-5 minutos
5. **Agrega** el número en el portfolio "ultralents" (verificado)
6. **Verifica** que funcione

**¿Encontraste la opción "Abandonar negocio"?** Si no la ves, comparte qué opciones aparecen en la configuración y te guío para encontrarla.
