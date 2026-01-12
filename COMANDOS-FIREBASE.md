# Comandos para Ejecutar Firebase (Sin Problemas de Scripts)

## Solución: Usar el archivo .cmd directamente

En lugar de `firebase`, usa la ruta completa del archivo `.cmd`:

### Paso 1: Login

Copia y pega esto en tu terminal:

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" login
```

### Paso 2: Init

Después del login, ejecuta:

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" init
```

### Paso 3: Deploy (después)

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" deploy --only functions
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" deploy --only hosting
```

---

## Alternativa: Cambiar Política de Ejecución

Si prefieres usar `firebase` directamente, ejecuta esto **una vez**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego podrás usar `firebase login` normalmente.

---

## Verificar que Funciona

Para verificar que Firebase está funcionando:

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" --version
```

Deberías ver: `15.2.1`
