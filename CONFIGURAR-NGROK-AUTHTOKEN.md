# 🔐 Configurar ngrok con Authtoken

## ¿Por qué necesito esto?

ngrok requiere una cuenta verificada para crear túneles públicos. Es **gratis** y toma 2 minutos.

---

## 📋 Paso a Paso

### Paso 1: Crear Cuenta en ngrok

1. **Abre tu navegador**
2. **Ve a**: https://dashboard.ngrok.com/signup
3. **Completa el formulario**:
   - Email
   - Contraseña
   - Nombre
4. **Verifica tu email** (revisa tu bandeja de entrada)
5. **Inicia sesión**: https://dashboard.ngrok.com/login

### Paso 2: Obtener Authtoken

1. **Una vez dentro del dashboard**, ve a:
   - https://dashboard.ngrok.com/get-started/your-authtoken
   - O busca "Your Authtoken" en el menú

2. **Verás algo como**:
   ```
   Your Authtoken
   2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

3. **Copia el authtoken completo** (es una serie larga de letras y números)

### Paso 3: Configurar Authtoken en tu Terminal

En tu terminal PowerShell, ejecuta:

```powershell
npx ngrok config add-authtoken TU_AUTHTOKEN_AQUI
```

**Reemplaza `TU_AUTHTOKEN_AQUI`** con el authtoken que copiaste.

**Ejemplo**:
```powershell
npx ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Paso 4: Verificar Configuración

Deberías ver un mensaje como:
```
Authtoken saved to configuration file: C:\Users\user\AppData\Local\ngrok\ngrok.yml
```

### Paso 5: Ejecutar ngrok

Ahora sí puedes ejecutar:

```powershell
npx ngrok http 3000
```

---

## ✅ Resumen Rápido

1. ✅ Crear cuenta: https://dashboard.ngrok.com/signup
2. ✅ Obtener authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. ✅ Configurar: `npx ngrok config add-authtoken TU_TOKEN`
4. ✅ Ejecutar: `npx ngrok http 3000`

---

**¿Listo?** Sigue estos pasos y cuando tengas el authtoken configurado, ejecuta `npx ngrok http 3000` y pégame la URL que obtengas.
