#!/bin/bash
# Script para reescribir historial y eliminar secreto de Twilio

set -e  # Salir si hay error

echo "=========================================="
echo "  REESCRITURA DE HISTORIAL GIT"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Verificar que el backup branch no existe o crearlo
if git show-ref --verify --quiet refs/heads/backup-before-filter-repo; then
    echo "✅ Backup branch ya existe: backup-before-filter-repo"
else
    echo "📦 Creando backup branch..."
    git branch backup-before-filter-repo
    echo "✅ Backup branch creado: backup-before-filter-repo"
fi

# Hacer stash de cambios sin stagear (necesario para filter-branch)
echo ""
echo "📦 Guardando cambios sin stagear..."
if ! git diff-index --quiet HEAD --; then
    echo "   Hay cambios sin stagear, guardándolos en stash..."
    git stash push -m "Stash automático antes de filter-branch - $(date +%Y%m%d-%H%M%S)"
    STASH_CREATED=1
else
    echo "   No hay cambios sin stagear"
    STASH_CREATED=0
fi

# Verificar que el secreto existe en el historial
echo ""
echo "🔍 Verificando que el secreto existe en el historial..."
if git log --all --full-history -S "AC[0-9a-f]\{32\}" --oneline | grep -q .; then
    echo "✅ Secreto encontrado en el historial"
    git log --all --full-history -S "AC[0-9a-f]\{32\}" --oneline | head -3
else
    echo "⚠️  No se encontró el secreto en el historial. ¿Ya fue eliminado?"
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ejecutar git filter-branch
echo ""
echo "🔄 Ejecutando git filter-branch..."
echo "   Esto puede tardar varios minutos..."
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --tree-filter '
if [ -f COMENZAR-PASO-3-RENDER.md ]; then
    sed -i "s/AC[0-9a-f]\{32\}/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/g" COMENZAR-PASO-3-RENDER.md
fi
if [ -f CONFIGURAR-VARIABLES-ENV-RENDER.md ]; then
    sed -i "s/AC[0-9a-f]\{32\}/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/g" CONFIGURAR-VARIABLES-ENV-RENDER.md
fi
' --prune-empty --tag-name-filter cat -- --all

# Verificar que el secreto fue eliminado
echo ""
echo "🔍 Verificando que el secreto fue eliminado..."
if git log --all --full-history -S "AC[0-9a-f]\{32\}" --oneline | grep -q .; then
    echo "❌ ERROR: El secreto todavía existe en el historial!"
    git log --all --full-history -S "AC[0-9a-f]\{32\}" --oneline | head -3
    exit 1
else
    echo "✅ Secreto eliminado del historial"
fi

# Verificar que el placeholder está presente
echo ""
echo "🔍 Verificando que el placeholder está presente..."
if git log --all --full-history -S "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --oneline | grep -q .; then
    echo "✅ Placeholder encontrado en el historial"
    git log --all --full-history -S "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" --oneline | head -3
else
    echo "⚠️  Placeholder no encontrado. Esto puede ser normal si el commit ya tenía el placeholder."
fi

# Verificar commit específico
echo ""
echo "🔍 Verificando commit 6a04f25..."
if git show 6a04f25:COMENZAR-PASO-3-RENDER.md 2>/dev/null | grep -q "AC[0-9a-f]\{32\}"; then
    echo "❌ ERROR: El secreto todavía existe en el commit 6a04f25!"
    exit 1
else
    echo "✅ Commit 6a04f25 verificado: secreto eliminado"
fi

if git show 6a04f25:CONFIGURAR-VARIABLES-ENV-RENDER.md 2>/dev/null | grep -q "AC[0-9a-f]\{32\}"; then
    echo "❌ ERROR: El secreto todavía existe en CONFIGURAR-VARIABLES-ENV-RENDER.md del commit 6a04f25!"
    exit 1
else
    echo "✅ CONFIGURAR-VARIABLES-ENV-RENDER.md verificado: secreto eliminado"
fi

# Restaurar stash si se creó
if [ "$STASH_CREATED" -eq 1 ]; then
    echo ""
    echo "📦 Restaurando cambios guardados..."
    git stash pop || echo "⚠️  Hubo conflictos al restaurar el stash. Revisa manualmente con 'git stash list'"
fi

echo ""
echo "=========================================="
echo "  ✅ REESCRITURA COMPLETADA"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo "   1. git push origin main --force"
echo "   2. Verificar que GitHub ya no bloquea"
echo "   3. Actualizar Auth Token en Render"
echo ""
