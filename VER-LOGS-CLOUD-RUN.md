# 🔍 Ver Logs de Cloud Run

## El servicio responde pero no genera el QR

Necesitamos ver los logs para identificar el problema.

## Pasos:

1. Ve a: https://console.cloud.google.com/run?project=whatsapp-scheduler-2105b
2. Haz clic en el servicio "whatsapp-service"
3. Ve a la pestaña "LOGS" (arriba)
4. Revisa los logs recientes

## Busca estos mensajes:

- "Iniciando initializeWhatsApp..."
- "Creando nuevo cliente..."
- "Inicializando cliente..."
- "Error en initialize:"
- "Error creating WhatsApp client:"
- Cualquier error relacionado con Chrome/Puppeteer

## Posibles problemas:

1. **Chrome no se está ejecutando**: Error al iniciar Puppeteer
2. **Timeout**: La inicialización tarda más de 50 segundos
3. **Error de whatsapp-web.js**: Problema al conectar con WhatsApp Web

## Copia los logs aquí

Especialmente busca líneas que digan "Error" o "failed".
