# Solución: Proyecto no aparece en la lista

## Opción 1: Verificar que el proyecto existe

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Verifica que el proyecto `whatsapp-scheduler-2105b` esté en tu lista de proyectos
3. Si no está, puede que esté en otra cuenta de Google

## Opción 2: Agregar el proyecto manualmente

Si el proyecto existe pero no aparece, puedes agregarlo manualmente:

1. En la lista actual, presiona **Esc** para cancelar
2. Ejecuta este comando para agregar el proyecto:
   ```powershell
   & "C:\Users\user\AppData\Roaming\npm\firebase.cmd" use --add whatsapp-scheduler-2105b
   ```
3. Luego ejecuta `firebase init` de nuevo

## Opción 3: Usar un proyecto existente (temporal)

Si quieres continuar rápido, puedes:
1. Seleccionar uno de los proyectos existentes (por ejemplo, `entregassiigo`)
2. Luego cambiar el proyecto con:
   ```powershell
   & "C:\Users\user\AppData\Roaming\npm\firebase.cmd" use whatsapp-scheduler-2105b
   ```

## Opción 4: Crear el proyecto desde cero

Si el proyecto no existe, puedes crearlo:
1. Presiona **Esc** para cancelar
2. Ve a [Firebase Console](https://console.firebase.google.com/)
3. Crea el proyecto `whatsapp-scheduler-2105b`
4. Luego ejecuta `firebase init` de nuevo

---

## Recomendación

**Primero verifica en Firebase Console** si el proyecto `whatsapp-scheduler-2105b` existe y está en tu cuenta.

Si existe pero no aparece, usa la **Opción 2** para agregarlo manualmente.
