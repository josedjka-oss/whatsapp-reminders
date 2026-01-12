# Obtener URL de la Función Cloud Function

## Opción 1: Desde Firebase Console (Más Fácil)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `whatsapp-scheduler-2105b`
3. Ve a **Functions** (en el menú lateral)
4. Busca la función: **`checkAndSendMessages`**
5. Haz clic en el nombre de la función
6. Verás la **URL** de la función (algo como: `https://us-central1-whatsapp-scheduler-2105b.cloudfunctions.net/checkAndSendMessages`)
7. **Copia esa URL completa**

## Opción 2: Desde Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona proyecto: `whatsapp-scheduler-2105b`
3. Ve a **Cloud Functions**
4. Busca: **`checkAndSendMessages`**
5. Haz clic en el nombre
6. En la pestaña **"Trigger"** o **"Desencadenador"**, verás la **URL**
7. **Copia esa URL completa**

## Formato de la URL

La URL debería verse así:
```
https://us-central1-whatsapp-scheduler-2105b.cloudfunctions.net/checkAndSendMessages
```

O:
```
https://REGION-whatsapp-scheduler-2105b.cloudfunctions.net/checkAndSendMessages
```

Donde REGION es la región donde desplegaste (probablemente `us-central1`)
