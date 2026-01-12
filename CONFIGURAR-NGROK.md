# 🔗 Configurar ngrok - Crear Túnel Público

## ¿Por qué necesitamos ngrok?

Tu servidor está corriendo en `localhost:3000`, que solo es accesible desde tu PC.
Twilio necesita una **URL pública** para enviar webhooks cuando recibas mensajes de WhatsApp.

ngrok crea un **túnel público** que apunta a tu `localhost:3000`.

---

## 🚀 Paso a Paso

### Paso 1: Abrir una NUEVA Terminal

**⚠️ IMPORTANTE**: 
- **NO cierres** la terminal donde está corriendo el servidor (`npm run dev`)
- Abre una **NUEVA** terminal/PowerShell
- En Windows: Puedes abrir otra ventana de PowerShell o usar otra pestaña

### Paso 2: Navegar al directorio del proyecto

En la NUEVA terminal, ejecuta:

```bash
cd C:\Users\user\Desktop\WHATS
```

### Paso 3: Iniciar ngrok

Ejecuta este comando:

```bash
npx ngrok http 3000
```

**O si ngrok está en tu PATH:**

```bash
ngrok http 3000
```

### Paso 4: Ver la URL de ngrok

Verás algo como esto:

```
Session Status                online
Account                       Tu Nombre (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Paso 5: Copiar la URL Forwarding

**Copia la URL** que aparece en "Forwarding":
- Ejemplo: `https://abc123xyz.ngrok-free.app`
- **Esta es tu URL pública** ✅

### Paso 6: Actualizar .env

Necesitarás actualizar el archivo `.env` con esta URL:

```env
PUBLIC_BASE_URL=https://abc123xyz.ngrok-free.app
```

**⚠️ IMPORTANTE**: Cada vez que reinicies ngrok, obtendrás una URL nueva y deberás actualizar esta variable.

---

## 📋 Resumen Rápido

1. ✅ Abre una **NUEVA** terminal (no cierres la del servidor)
2. ✅ Ve a: `cd C:\Users\user\Desktop\WHATS`
3. ✅ Ejecuta: `npx ngrok http 3000`
4. ✅ Copia la URL que aparece en "Forwarding" (ej: `https://abc123xyz.ngrok-free.app`)
5. ✅ Dime esa URL y yo actualizaré tu `.env` automáticamente

---

## 🎯 Qué Sigue Después

Una vez que tengas la URL de ngrok:
1. Actualizaré tu `.env` con esa URL
2. Configuraremos el webhook en Twilio Console (Paso 10)
3. Probaré la aplicación completa

---

**¿Listo para iniciar ngrok?** Abre una nueva terminal y ejecuta `npx ngrok http 3000`, luego dime la URL que obtienes.
