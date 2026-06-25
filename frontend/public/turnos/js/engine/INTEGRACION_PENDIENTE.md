# Motor `engine/` — estado de integración

## Hecho
- Los **9 módulos** en `public/js/engine/` (última versión **files2**).
- **Refactor aplicado (files3):** `public/js/programacion-almuerzos.js` sustituido por la versión que solo orquesta y usa `window.ENGINE_*`.
- **`programacion-almuerzos.html`:** los 9 `<script>` del motor van **antes** del principal; `?v=20260507190000` en el JS principal para caché.

## Verificación
Tras desplegar, en consola: `ENGINE_VALIDATOR.printValidation(state, '2026-06');`

## No hecho / manual
- Despliegue Firebase si lo necesitas (`npm run deploy`).

## Notas (files2)
- **No** hace falta mapa de migración de IDs al cargar/guardar: mismos strings que ya usa la planilla.
- `INSTRUCCIONES_CURSOR.md`: si ves `DUO_CAMILO_MAURICIO`, en código vigente es **`DUO_BRAYAN_MAURICIO`** / `repairDuoBrayanMauricio`.
