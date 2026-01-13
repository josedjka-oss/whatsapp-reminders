# 🔧 Solución Final: Reescritura de Historial

El problema es que `git filter-branch` no funciona bien desde PowerShell. Necesitamos usar Git Bash directamente o una herramienta alternativa.

---

## 🎯 Opción Recomendada: Usar Git Bash Manualmente

### Paso 1: Abrir Git Bash
1. Abre **Git Bash** (no PowerShell)
2. Navega al directorio del proyecto:
   ```bash
   cd /c/Users/user/Desktop/WHATS
   ```

### Paso 2: Crear Script de Filtrado
```bash
cat > filter-secret.sh << 'EOF'
#!/bin/bash
if [ -f COMENZAR-PASO-3-RENDER.md ]; then
  sed -i 's/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/g' COMENZAR-PASO-3-RENDER.md
fi
if [ -f CONFIGURAR-VARIABLES-ENV-RENDER.md ]; then
  sed -i 's/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/g' CONFIGURAR-VARIABLES-ENV-RENDER.md
fi
EOF

chmod +x filter-secret.sh
```

### Paso 3: Ejecutar filter-branch
```bash
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --tree-filter 'bash filter-secret.sh' --prune-empty --tag-name-filter cat -- --all
```

### Paso 4: Verificar
```bash
git log --all --full-history -S "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --oneline
# Debe estar vacío

git show 6a04f25:COMENZAR-PASO-3-RENDER.md | grep "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# No debe mostrar nada

git show 6a04f25:COMENZAR-PASO-3-RENDER.md | grep "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# Debe mostrar el placeholder
```

### Paso 5: Force Push
```bash
git push origin main --force
```

---

## 🔄 Opción Alternativa: BFG Repo-Cleaner

Si tienes Java instalado:

### Paso 1: Descargar BFG
```bash
# Descargar desde: https://rtyley.github.io/bfg-repo-cleaner/
# O usar wget:
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

### Paso 2: Crear archivo de reemplazo
```bash
echo "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==>ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" > replace.txt
```

### Paso 3: Ejecutar BFG
```bash
java -jar bfg-1.14.0.jar --replace-text replace.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Paso 4: Force Push
```bash
git push origin main --force
```

---

## ⚠️ Nota Importante

Después de reescribir el historial:
1. **Rotar Auth Token en Twilio** (ver `ROTAR-CREDENCIALES-TWILIO.md`)
2. **Actualizar Auth Token en Render**
3. **Verificar que GitHub ya no bloquea**

---

## 📝 Si Nada Funciona

Como último recurso, puedes:
1. Crear un nuevo repositorio
2. Copiar solo los archivos actuales (sin historial)
3. Hacer un commit inicial limpio
4. Push al nuevo repositorio

Pero esto perderá todo el historial de commits.
