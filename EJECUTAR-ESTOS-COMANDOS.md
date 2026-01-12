# Comandos para Ejecutar en tu Terminal

Copia y pega estos comandos **uno por uno** en tu terminal PowerShell:

## Paso 1: Configurar PATH y Login

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path
firebase login
```

El comando `firebase login` abrirá tu navegador para autenticarte.

## Paso 2: Inicializar Firebase

Después de iniciar sesión, ejecuta:

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path
firebase init
```

Durante `firebase init`, selecciona:
- **Firestore, Functions, Hosting** (usa Espacio para seleccionar, Enter para continuar)
- **Proyecto**: `whatsapp-scheduler-2105b`
- **Firestore**: Usa archivos existentes (Enter)
- **Functions**: TypeScript, Sí a ESLint, Sí a instalar dependencias
- **Hosting**: Directorio = `out`, No a SPA, No a GitHub

## Paso 3: Construir y Desplegar

```powershell
$env:Path = "C:\Program Files\nodejs;C:\Users\user\AppData\Roaming\npm;" + $env:Path
npm run build
firebase deploy --only functions
firebase deploy --only hosting
```

---

## Alternativa: Cambiar Política de Ejecución (Opcional)

Si prefieres habilitar scripts, ejecuta esto **una vez** como Administrador:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego podrás usar `.\ejecutar-firebase.ps1`
