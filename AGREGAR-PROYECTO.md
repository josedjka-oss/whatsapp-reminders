# Agregar Proyecto Manualmente

## El proyecto existe, pero no aparece en la lista

Esto significa que Firebase CLI no lo tiene asociado. Vamos a agregarlo manualmente.

## Pasos:

### 1. Cancela firebase init

En tu terminal donde está ejecutándose `firebase init`, presiona **Esc** o **Ctrl+C** para cancelar.

### 2. Agrega el proyecto manualmente

Ejecuta este comando:

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" use --add whatsapp-scheduler-2105b
```

### 3. Sigue las instrucciones

Te preguntará:
- **Alias para el proyecto:** Presiona **Enter** (usa el alias por defecto)
- **¿Qué alias quieres usar?:** Presiona **Enter** (default)

### 4. Verifica que se agregó

Ejecuta:
```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" projects:list
```

Deberías ver `whatsapp-scheduler-2105b` en la lista.

### 5. Ejecuta firebase init de nuevo

```powershell
& "C:\Users\user\AppData\Roaming\npm\firebase.cmd" init
```

Ahora deberías ver `whatsapp-scheduler-2105b` en la lista de proyectos.
