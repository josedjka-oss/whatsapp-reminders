# 📱 Guía Visual: Obtener Credenciales de Twilio

## Paso 1: Ir a Twilio

1. Abre tu navegador
2. Ve a: https://www.twilio.com/try-twilio
3. O directamente: https://console.twilio.com/

## Paso 2: Crear Cuenta (si no tienes)

1. Haz clic en **"Start Free Trial"** o **"Sign Up"**
2. Completa el formulario:
   - Email
   - Contraseña
   - Nombre
   - Teléfono (para verificación)
3. Verifica tu email
4. Verifica tu teléfono (recibirás un SMS)

## Paso 3: Una vez dentro del Console

1. Verás el **Dashboard** principal
2. En la parte superior verás información de tu cuenta
3. Busca el panel **"Account Info"** o **"Project Info"**

## Paso 4: Obtener ACCOUNT SID

1. En el Dashboard, busca **"Account SID"**
2. Se ve así: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Haz clic en el ícono de copiar (📋) al lado del ACCOUNT SID
4. O selecciona y copia manualmente

## Paso 5: Obtener AUTH TOKEN

1. En el Dashboard, busca **"Auth Token"**
2. Verás: `[hidden]` o `***`
3. Haz clic en **"View"** o en el ícono del ojo (👁️)
4. Se revelará el token (ejemplo: `abc123def456...`)
5. Haz clic en el ícono de copiar (📋) al lado
6. O selecciona y copia manualmente

## Paso 6: Actualizar .env

Una vez que tengas ambos:
- **ACCOUNT SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **AUTH TOKEN**: `tu_token_aqui`

Actualiza tu archivo `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_token_aqui
```

## 📸 Ubicación Visual en Twilio Console

```
┌─────────────────────────────────────────┐
│  Twilio Console                         │
│  ┌───────────────────────────────────┐  │
│  │  Account Info                     │  │
│  │                                   │  │
│  │  Account SID                      │  │
│  │  ACxxxxxxxxxxxxxxxxxxxxx  [📋]    │  │
│  │                                   │  │
│  │  Auth Token                       │  │
│  │  [hidden] [👁️ View]  [📋]        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

**¿Necesitas ayuda?** Estas credenciales están en tu Dashboard principal de Twilio.
