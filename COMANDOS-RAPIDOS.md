# Comandos Rápidos para Ejecutar Firebase

## Problema: Firebase no se reconoce

Si ves el error "firebase no se reconoce", usa uno de estos métodos:

## Método 1: Usar el script (Recomendado)

Ejecuta en tu terminal PowerShell:

```powershell
.\ejecutar-firebase.ps1 login
```

Para inicializar:
```powershell
.\ejecutar-firebase.ps1 init
```

## Método 2: Configurar PATH manualmente

Ejecuta esto en tu terminal antes de usar firebase:

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path
```

Luego ejecuta:
```powershell
firebase login
firebase init
```

## Método 3: Usar ruta completa

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" login
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" init
```

## Pasos Completos

1. **Iniciar sesión:**
   ```powershell
   .\ejecutar-firebase.ps1 login
   ```
   Esto abrirá tu navegador para autenticarte.

2. **Inicializar proyecto:**
   ```powershell
   .\ejecutar-firebase.ps1 init
   ```
   Sigue las instrucciones en `INSTRUCCIONES-FIREBASE-INIT.md`

3. **Construir y desplegar:**
   ```powershell
   npm run build
   .\ejecutar-firebase.ps1 deploy --only functions
   .\ejecutar-firebase.ps1 deploy --only hosting
   ```
