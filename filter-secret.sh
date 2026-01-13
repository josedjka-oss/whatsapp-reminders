#!/bin/bash
# Script para reemplazar secreto en git filter-branch

if [ -f COMENZAR-PASO-3-RENDER.md ]; then
  sed -i 's/AC[0-9a-f]\{32\}/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/g' COMENZAR-PASO-3-RENDER.md
fi

if [ -f CONFIGURAR-VARIABLES-ENV-RENDER.md ]; then
  sed -i 's/AC[0-9a-f]\{32\}/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/g' CONFIGURAR-VARIABLES-ENV-RENDER.md
fi
