# 🔒 Reescritura de Historial para Eliminar Secretos

Guía paso a paso para eliminar secretos del historial de Git usando `git filter-repo`.

---

## 📋 Paso 1: Identificar Secretos en el Historial

### Secretos Detectados:
- **Commit:** `6a04f25111e85baa9c35c20eb3d3067e7373213f`
- **Archivos afectados:**
  - `COMENZAR-PASO-3-RENDER.md` (líneas 93, 202)
  - `CONFIGURAR-VARIABLES-ENV-RENDER.md` (líneas 28, 79)
- **Valor:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (ejemplo de Account SID)

### Verificar:
```bash
git log --all --full-history -S "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --oneline
```

---

## 📋 Paso 2: Instalar git-filter-repo

### Opción A: Con pip (Recomendado)
```bash
pip install git-filter-repo
```

### Opción B: Con pipx
```bash
pipx install git-filter-repo
```

### Verificar instalación:
```bash
git-filter-repo --version
```

---

## 📋 Paso 3: Crear Backup

```bash
# Crear branch de backup
git branch backup-before-filter-repo

# Verificar que se creó
git branch | Select-String "backup"
```

---

## 📋 Paso 4: Reemplazar Secreto en Todo el Historial

### Usar git filter-repo para reemplazar el valor:

```bash
# Reemplazar en todos los commits
git filter-repo --replace-text <(echo "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==>ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
```

**Nota para Windows PowerShell:**
Como PowerShell no soporta `<()`, usar un archivo temporal:

```powershell
# Crear archivo de reemplazo
@"
ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==>ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
"@ | Out-File -FilePath replace-rules.txt -Encoding utf8

# Ejecutar filter-repo
git filter-repo --replace-text replace-rules.txt

# Limpiar archivo temporal
Remove-Item replace-rules.txt
```

---

## 📋 Paso 5: Verificar Cambios

```bash
# Verificar que el secreto fue eliminado
git log --all --full-history -S "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --oneline
# Debe estar vacío

# Verificar que el placeholder está presente
git log --all --full-history -S "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --oneline
# Debe mostrar los commits modificados

# Verificar archivos específicos
git show HEAD:COMENZAR-PASO-3-RENDER.md | Select-String -Pattern "AC"
git show HEAD:CONFIGURAR-VARIABLES-ENV-RENDER.md | Select-String -Pattern "AC"
```

---

## 📋 Paso 6: Rotar Credenciales en Twilio

**⚠️ IMPORTANTE:** Asumir que el Account SID y Auth Token están comprometidos.

### Pasos en Twilio Console:
1. Ve a: https://console.twilio.com/
2. **Account SID:** No se puede rotar (es permanente)
3. **Auth Token:** 
   - Ve a Settings → General
   - Haz clic en "Regenerate" en Auth Token
   - **Actualiza en Render** con el nuevo token

### Actualizar en Render:
1. Ve a tu servicio en Render Dashboard
2. Environment Variables
3. Actualizar `TWILIO_AUTH_TOKEN` con el nuevo valor
4. Guardar y redesplegar

---

## 📋 Paso 7: Force Push (con Precaución)

### Verificar estado:
```bash
git status
git log --oneline -5
```

### Force push:
```bash
# ⚠️ ADVERTENCIA: Esto reescribe el historial remoto
git push origin main --force
```

### Si hay colaboradores:
```bash
# Avisar a colaboradores que deben:
git fetch origin
git reset --hard origin/main
```

---

## 📋 Paso 8: Verificar que GitHub Ya No Bloquea

1. Hacer un commit de prueba:
   ```bash
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "test: Verificar que GitHub no bloquea"
   git push origin main
   ```

2. Si funciona, eliminar TEST.md:
   ```bash
   git rm TEST.md
   git commit -m "chore: Eliminar archivo de prueba"
   git push origin main
   ```

---

## 📋 Paso 9: Verificar .gitignore y Secretos

### Verificar .gitignore:
```bash
cat .gitignore | Select-String -Pattern "\.env"
```

### Verificar que .env no está en el repo:
```bash
git ls-files | Select-String -Pattern "\.env"
# Debe estar vacío
```

### Buscar otros secretos potenciales:
```bash
# Buscar patrones de Twilio
git log --all --full-history -S "TWILIO_AUTH_TOKEN" --oneline
git log --all --full-history -S "whatsapp:+" --oneline

# Buscar otros patrones comunes
git log --all --full-history -S "sk-" --oneline  # OpenAI keys
```

---

## ✅ Checklist Final

- [ ] Backup branch creado
- [ ] git-filter-repo instalado
- [ ] Secreto reemplazado en todo el historial
- [ ] Verificado que el secreto fue eliminado
- [ ] Auth Token rotado en Twilio
- [ ] Auth Token actualizado en Render
- [ ] Force push realizado
- [ ] GitHub ya no bloquea
- [ ] .gitignore verificado
- [ ] .env no está en el repo
- [ ] No hay otros secretos en el historial

---

## 🚨 Advertencias

1. **Force push reescribe el historial:** Todos los colaboradores necesitarán hacer `git reset --hard origin/main`
2. **Backup branch:** Mantener `backup-before-filter-repo` hasta confirmar que todo funciona
3. **Twilio Auth Token:** Rotar inmediatamente después de identificar el compromiso
4. **Account SID:** No se puede rotar, pero no es crítico si solo se expuso el ejemplo

---

## 📝 Notas

- `git filter-repo` es más seguro que `git filter-branch` (deprecated)
- El proceso puede tardar varios minutos en repos grandes
- Verificar que los cambios se aplicaron correctamente antes del force push
