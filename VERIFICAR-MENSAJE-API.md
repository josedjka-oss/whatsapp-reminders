# 🔍 Verificar Estado del Mensaje usando la API

## Problema
Twilio Console muestra error, pero necesitas verificar el estado del mensaje.

## Solución: Usar el Endpoint de la API

He creado un endpoint en tu backend para verificar el estado de los mensajes directamente usando la API de Twilio.

### Opción 1: Verificar un Mensaje Específico

Usa el SID del mensaje que viste en los logs:
```
SID: SM3fd8fc9c748961c50e2e80be2986ee10
```

**URL:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/twilio-status/SM3fd8fc9c748961c50e2e80be2986ee10
```

**Con curl:**
```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status/SM3fd8fc9c748961c50e2e80be2986ee10
```

**Respuesta esperada:**
```json
{
  "sid": "SM3fd8fc9c748961c50e2e80be2986ee10",
  "status": "sent",
  "errorCode": null,
  "errorMessage": null,
  "to": "whatsapp:+573001234567",
  "from": "whatsapp:+14155238886",
  "body": "Tu mensaje aquí",
  "dateCreated": "2024-01-01T12:00:00Z",
  "dateSent": "2024-01-01T12:00:01Z",
  "dateUpdated": "2024-01-01T12:00:01Z",
  "direction": "outbound-api",
  "price": "-0.0050",
  "priceUnit": "USD",
  "uri": "/2010-04-01/Accounts/.../Messages/..."
}
```

### Opción 2: Listar Últimos Mensajes

Ver los últimos 10 mensajes enviados:

**URL:**
```
GET https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=10
```

**Con curl:**
```bash
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=10
```

**Respuesta esperada:**
```json
{
  "count": 10,
  "messages": [
    {
      "sid": "SM...",
      "status": "sent",
      "errorCode": null,
      "errorMessage": null,
      "to": "whatsapp:+573001234567",
      "from": "whatsapp:+14155238886",
      "body": "Mensaje...",
      "dateCreated": "2024-01-01T12:00:00Z",
      "dateSent": "2024-01-01T12:00:01Z"
    },
    ...
  ]
}
```

## Interpretar el Status

### ✅ Estados Exitosos:
- **queued**: Mensaje en cola, se enviará pronto
- **sent**: Mensaje enviado a Twilio (puede no llegar si hay problemas)
- **delivered**: Mensaje entregado al destinatario ✅

### ❌ Estados de Error:
- **failed**: Error al enviar
- **undelivered**: No se pudo entregar
- **canceled**: Mensaje cancelado

## Códigos de Error Comunes

Si `errorCode` no es `null`, revisa:

- **21608**: Número no verificado (Sandbox mode)
- **21614**: Número no tiene WhatsApp
- **21211**: Número inválido
- **63007**: Límite de mensajes excedido

## Próximos Pasos

1. **Espera a que Render redesplegue** (2-5 minutos)
2. **Usa el endpoint** para verificar el estado del mensaje con el SID
3. **Comparte el resultado** (status, errorCode, errorMessage)
4. **Si hay error**, te ayudo a solucionarlo

## Ejemplo Completo

```bash
# Verificar mensaje específico
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status/SM3fd8fc9c748961c50e2e80be2986ee10

# Ver últimos 10 mensajes
curl https://whatsapp-reminders-mzex.onrender.com/api/twilio-status?limit=10
```
