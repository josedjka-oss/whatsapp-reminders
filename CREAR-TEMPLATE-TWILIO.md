# 📝 Crear Template en Twilio - Guía Paso a Paso

## 📋 Paso 1: Información General

### Template Name (Nombre del Template):

1. **En el campo "Template Name"**, escribe:
   ```
   recordatorio
   ```
   - ✅ Solo minúsculas
   - ✅ Sin espacios
   - ✅ Sin caracteres especiales
   - ✅ Solo letras y números

**Ejemplos válidos:**
- ✅ `recordatorio`
- ✅ `reminder`
- ✅ `recordatorio_mensaje`
- ❌ `Recordatorio` (no mayúsculas)
- ❌ `recordatorio mensaje` (no espacios)

### Template Language (Idioma del Template):

1. **Haz clic en**: **"Select template language"**
2. **Busca**: **"Spanish"** o **"Español"**
3. **Selecciona**: **"es"** (código de idioma español)

**Nota:** Si no encuentras "es", busca "Spanish" o "Español" en la lista.

---

## 📋 Paso 2: Tipo de Contenido

### Content Type (Tipo de Contenido):

1. **Selecciona**: **"Text"** (el primero, con el ícono `twilio/text`)
   - ✅ Este es el tipo más simple
   - ✅ Perfecto para recordatorios de texto
   - ✅ Permite usar variables `{{1}}`

**NO selecciones:**
- ❌ Media (para imágenes)
- ❌ List Picker (para listas)
- ❌ Call to action (para botones)
- ❌ Otros tipos (no los necesitas para recordatorios simples)

---

## 📋 Paso 3: Crear el Cuerpo del Mensaje

### Después de seleccionar "Text":

1. **Aparecerá un campo** para el cuerpo del mensaje
2. **Escribe** el mensaje usando `{{1}}` para la variable:

**Opción 1 (Simple):**
```
{{1}}
```

**Opción 2 (Con texto adicional):**
```
Recordatorio: {{1}}
```

**Opción 3 (Más descriptivo):**
```
📅 Recordatorio: {{1}}
```

**Recomendación:**
- ✅ Usa la **Opción 1** (`{{1}}`) si quieres que el mensaje sea completamente dinámico
- ✅ Usa la **Opción 2** si quieres un prefijo fijo

**Importante:**
- ⚠️ El `{{1}}` es la variable que se reemplazará con el texto del recordatorio
- ⚠️ Debe estar entre llaves dobles `{{}}`
- ⚠️ El número `1` corresponde a la primera variable

---

## 📋 Paso 4: Revisar y Crear

### Antes de crear:

1. **Revisa** que:
   - ✅ Template Name: `recordatorio` (solo minúsculas)
   - ✅ Template Language: `es` (Español)
   - ✅ Content Type: `Text`
   - ✅ Body: `{{1}}` (o la opción que prefieras)

2. **Haz clic en**: **"Create"** o **"Crear"**

3. **Espera** a que se cree el template

---

## 📋 Paso 5: Enviar para Aprobación

### Después de crear:

1. **Aparecerá** la página del template creado
2. **Haz clic en**: **"Submit for Approval"** o **"Enviar para aprobación"**
3. **Confirma** el envío
4. **Espera** la aprobación (puede tardar **varios días**)

**Estados del template:**
- ⏳ **Pending** (Pendiente) - Esperando aprobación
- ✅ **Approved** (Aprobado) - Listo para usar
- ❌ **Rejected** (Rechazado) - Necesita correcciones

---

## ⚠️ Errores Comunes

### Error 1: Nombre con mayúsculas o espacios

**Error:**
- ❌ `Recordatorio` (mayúsculas)
- ❌ `recordatorio mensaje` (espacios)

**Solución:**
- ✅ `recordatorio` (solo minúsculas, sin espacios)

### Error 2: Variable incorrecta

**Error:**
- ❌ `{1}` (una sola llave)
- ❌ `{{ 1 }}` (espacios dentro)
- ❌ `{{2}}` (si solo tienes una variable)

**Solución:**
- ✅ `{{1}}` (doble llave, sin espacios, número 1)

### Error 3: Tipo de contenido incorrecto

**Error:**
- ❌ Seleccionar "Media" o "Call to action" para un mensaje simple

**Solución:**
- ✅ Seleccionar "Text" para mensajes de texto simples

---

## 📋 Checklist

- [ ] Template Name: `recordatorio` (solo minúsculas, sin espacios)
- [ ] Template Language: `es` (Español)
- [ ] Content Type: `Text`
- [ ] Body: `{{1}}` (o la opción que prefieras)
- [ ] Revisé todo antes de crear
- [ ] Hice clic en "Create"
- [ ] Envié el template para aprobación
- [ ] Espero la aprobación (puede tardar días)

---

## 🎯 Resumen

**Pasos:**
1. ✅ Template Name: `recordatorio`
2. ✅ Template Language: `es` (Español)
3. ✅ Content Type: `Text`
4. ✅ Body: `{{1}}`
5. ✅ Crear y enviar para aprobación

**Después de aprobar:**
- Obtendrás el **Content SID** (formato: `HX...`)
- Lo usarás en tu código para enviar mensajes

---

## ✅ Próximos Pasos Después de Crear el Template

1. **Espera** la aprobación (puede tardar días)
2. **Una vez aprobado**, obtén el **Content SID**
3. **Actualiza** el Content SID en tu código
4. **Actualiza** las variables de entorno en Render
5. **Prueba** enviar un mensaje

**¿Necesitas ayuda con algún paso específico?** Puedo guiarte en cualquier parte del proceso.
