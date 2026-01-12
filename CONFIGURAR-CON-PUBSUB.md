# Configurar Cloud Scheduler con Pub/Sub

## La función está configurada para Pub/Sub

Tu función `checkAndSendMessages` usa un trigger de tipo "scheduled" (Pub/Sub), por lo que debes usar **Pub/Sub** en Cloud Scheduler.

## Configuración en Cloud Scheduler

### En "Tipo de objetivo", selecciona:
**"Pub/Sub Topic"** o **"Pub/Sub"**

### Luego configura:

**Topic:**
- Haz clic en "Seleccionar" o "Select"
- Si no aparece ningún topic, necesitas crear uno:
  - Haz clic en "Crear nuevo topic" o "Create new topic"
  - Nombre: `check-whatsapp-messages-topic`
  - Haz clic en "Crear"

**Payload:**
- Puedes dejarlo vacío o poner: `{}`
- (La función no necesita payload)

---

## Alternativa: Usar HTTP (si prefieres)

Si prefieres usar HTTP, necesitas cambiar la función para que también acepte HTTP. Pero es más fácil usar Pub/Sub como está configurado.

---

## Configuración Completa del Job

1. **Define el programa:**
   - Nombre: `check-whatsapp-messages`
   - Región: `us-central1`
   - Frecuencia: `*/15 * * * *`
   - Zona horaria: Tu zona horaria

2. **Configura la ejecución:**
   - Tipo de objetivo: **Pub/Sub Topic**
   - Topic: Selecciona o crea `check-whatsapp-messages-topic`
   - Payload: `{}` (opcional)

3. **Crear** el job

---

## Nota Importante

La función `checkAndSendMessages` ya está configurada para ejecutarse con Pub/Sub, así que esta es la forma correcta de configurarla.
