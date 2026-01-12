# Habilitar Facturación en Firebase

## ⚠️ Requisito: Plan Blaze

Para desplegar Cloud Functions, Firebase requiere que tu proyecto esté en el **plan Blaze (pago por uso)**.

**No te preocupes:** El plan Blaze tiene un **nivel gratuito generoso** que incluye:
- 2 millones de invocaciones de Functions por mes (gratis)
- 400,000 GB-segundos de tiempo de cómputo (gratis)
- 200,000 GB-segundos de tiempo de cómputo para funciones de segunda generación (gratis)

Solo pagarás si excedes estos límites, lo cual es muy poco probable para tu caso de uso (8 mensajes diarios).

## Pasos para Habilitar Facturación

1. **Ve a la URL que Firebase te mostró:**
   ```
   https://console.firebase.google.com/project/whatsapp-scheduler-2105b/usage/details
   ```
   
   O manualmente:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto `whatsapp-scheduler-2105b`
   - Ve a **Configuración del proyecto** (ícono de engranaje)
   - Haz clic en **"Actualizar plan"** o **"Cambiar plan"**
   - Selecciona **Blaze (pago por uso)**
   - Completa el proceso de facturación (puede requerir tarjeta de crédito)

2. **Espera unos minutos** para que se active el plan

3. **Vuelve a intentar el despliegue:**
   ```powershell
   & "C:\Users\user\AppData\Roaming\npm\firebase.cmd" deploy --only functions
   ```

## Alternativa: Desplegar Solo Hosting Primero

Si quieres probar la aplicación primero sin Functions, puedes desplegar solo el frontend:

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
```

Esto te dará una URL para ver la aplicación, aunque las funciones de WhatsApp no funcionarán hasta que despliegues Functions.

## Después de Habilitar Facturación

Una vez que tengas el plan Blaze activo, ejecuta:

```powershell
# Desplegar Functions
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" deploy --only functions

# Desplegar Hosting
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
```

---

## 💡 Nota Importante

El plan gratuito de Blaze es más que suficiente para tu aplicación. Con 8 mensajes diarios:
- 8 mensajes × 30 días = 240 mensajes/mes
- Cada mensaje = 1 invocación de Function
- Total: 240 invocaciones/mes (muy por debajo del límite de 2 millones)

**No deberías pagar nada** con este uso.
