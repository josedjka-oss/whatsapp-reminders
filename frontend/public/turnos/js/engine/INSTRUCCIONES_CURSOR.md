# INSTRUCCIONES PARA CURSOR — Refactorización programacion-almuerzos.js
# =======================================================================

## OBJETIVO
Reemplazar toda la lógica de reglas en `public/js/programacion-almuerzos.js`
con el nuevo motor modular. El HTML y Firebase NO cambian.

---

## PASO 1: Copiar archivos del engine

Copiar la carpeta `engine/` a `public/js/engine/`:

```
public/js/engine/
  constants.js
  calendar.js
  hours.js
  rules-messengers.js
  rules-johnny.js
  cap-engine.js
  scheduler.js
  lunch-engine.js
  validator.js
```

---

## PASO 2: Agregar los <script> en el HTML

En `public/programacion-almuerzos.html`, ANTES del script principal,
agregar en este orden exacto (el orden importa por las dependencias):

```html
<!-- Motor de horarios — cargar antes del script principal -->
<script src="js/engine/constants.js"></script>
<script src="js/engine/calendar.js"></script>
<script src="js/engine/hours.js"></script>
<script src="js/engine/rules-messengers.js"></script>
<script src="js/engine/rules-johnny.js"></script>
<script src="js/engine/cap-engine.js"></script>
<script src="js/engine/scheduler.js"></script>
<script src="js/engine/lunch-engine.js"></script>
<script src="js/engine/validator.js"></script>
<!-- Script principal (IIFE) -->
<script src="js/programacion-almuerzos.js"></script>
```

---

## PASO 3: Refactorizar programacion-almuerzos.js

### QUÉ ELIMINAR (COMPLETAMENTE):

Eliminar TODAS estas funciones del archivo original —
ya no deben existir ni una línea de ellas:

```
PATRON_SEMANA_TRIO_44H
PATRON_SEMANA_DUO_B_44H
FESTIVOS_CO  (ahora en constants.js)
EMPLEADOS    (ahora en constants.js)
GRUPO_MENSAJEROS_A  → ahora GRUPO_MENSAJEROS
DUOS_MENSAJEROS_44H → ahora DUO_SANTIAGO_MIGUEL + DUO_BRAYAN_MAURICIO
GRUPO_FIJO_9_18     → ahora GRUPO_FIJO
IDS_TRIO_TURNO      → eliminado
IDS_DUO_MAURICIO_BRAYAN → eliminado (no existe ese dúo en la nueva lógica)

enforceMessengerTriosOneTenOrOneFivePerWeekday()  → ENGINE_RULES_MESSENGERS.enforceTrioOneTenOneFive()
enforceMessengerTriosOneTenOrOneFiveFromDay()     → ENGINE_RULES_MESSENGERS.enforceTrioOneTenOneFive(state, meta, fromDay)
enforceGrupoFijoLunVieNineSeisSabadoNueveCinco() → ENGINE_SCHEDULER.step_enforceGrupoFijo()
enforceJhonnyMieJueVieSalidaCincoYNoEntradaDiez()→ ENGINE_RULES_JOHNNY.enforceJhonny()
enforceGrupoBSinDiezNiCincoEnLunesMartesPostFestivo() → ENGINE_SCHEDULER.step_duosSinAjusteLunesMar()
capWeeklyHoursNonFijosTo44()                     → ENGINE_CAP.capWeeklyTo44()
squeezeGrupoBOver44WithSwap()                    → ENGINE_CAP.squeezeGrupoB()
liftWeeklyUnder44ForNonFijos()                   → ENGINE_CAP.liftWeeklyTo44()
liftJhonnyRodriguezSemanasSub44()                → ENGINE_CAP.liftJhonny()
forceNonFijoWeeksWithinDisplayedCeiling()        → ENGINE_CAP.forceWithinCeiling()
repairDuoMauricioBrayanWeeksTo44Hours()          → ENGINE_SCHEDULER.repairDuoBrayanMauricio()
fixForbiddenEntradaDiezSalidaCinco()             → ENGINE_SCHEDULER.step_fixDiezCinco()
enforceSaturdayExitFive()                        → ENGINE_SCHEDULER.step_sabadoPmCinco()
applyEveryoneFullDayNineSix()                    → ENGINE_SCHEDULER.step_todosNueveSeis()
reapplyJuneMessengerTurnSchedule()               → ENGINE_SCHEDULER.step_patronTrio()
fixJuneMondayNineToSix()                         → ya no necesario (step_todosNueveSeis lo cubre)
buildWeekChunksMonSat()                          → ENGINE_CALENDAR.buildWeekChunks()
chunkIsFullLunSabWeek()                          → ENGINE_CALENDAR.esChunkCompleto()
getMonthMeta()                                   → ENGINE_CALENDAR.getMonthMeta()
computeDailyHours()                              → ENGINE_HOURS.computeDailyHours()
getDisplayedHoursForDay()                        → ENGINE_HOURS.getDisplayedHours()
sumWeekHoursDisplayedForEmp()                    → ENGINE_HOURS.sumWeekHours()
computeMonthlyExtraHoursAbove44()               → ENGINE_HOURS.computeMonthlyExtras()
weeklyDisplayedCeilingForEmpChunk()              → ENGINE_HOURS.techoSemanal()
getLunchCellDisplay()                            → ENGINE_LUNCH.getLunchDisplay()
buildJuanJesusLunchByDay()                       → ENGINE_LUNCH.buildJuanJesusLunch()
ensureStateShape()                               → ENGINE_SCHEDULER.ensureStateShape()
runMessengerForwardRepair()                      → ENGINE_SCHEDULER.runMessengerForwardRepair()
```

### QUÉ MANTENER (solo orquestación):

```javascript
// Estado global — misma estructura
let state = {
  monthKey: '',
  horasExtras: {},
  cells: {},
  flagsDiaMarcadoNoLab: {},
  trioAusentePorDia: {},
};

// Helpers DOM
const el = (id) => document.getElementById(id);
const setStatus = (msg, kind) => { ... };

// render() — reemplazar llamadas internas:
//   ensureStateShape(monthKey)  →  ENGINE_SCHEDULER.ensureStateShape(state, monthKey)
//   getLunchCellDisplay(...)    →  ENGINE_LUNCH.getLunchDisplay(...)
//   buildJuanJesusLunchByDay(...)→ ENGINE_LUNCH.buildJuanJesusLunch(...)
//   computeMonthlyExtraHoursAbove44(...)→ ENGINE_HOURS.computeMonthlyExtras(...)
//   getDisplayedHoursForDay(...)→ ENGINE_HOURS.getDisplayedHours(...)
//   sumDisplayedHoursForChunk(...)→ ENGINE_HOURS.sumWeekHours(...)
//   findChunkEndingAtSaturday(...)→ ENGINE_CALENDAR.findChunkEndingAtSaturday(...)
//   countSaturdayDividerColumns(...)→ ENGINE_CALENDAR.countSabadosLaborables(...)

// saveToFirebase() — sin cambios
// loadFromFirebase() — sin cambios
// collectFromDom() — sin cambios
// applyLoadedPayload() — reemplazar ensureStateShape → ENGINE_SCHEDULER.ensureStateShape(state, monthKey)
// exportExcel() — reemplazar getLunchCellDisplay → ENGINE_LUNCH.getLunchDisplay(...)
// init() — sin cambios
```

---

## PASO 4: Adaptar event listeners en render()

En el blur de inputs (edición manual de am/pm):

```javascript
// ANTES:
if (IDS_TRIO_TURNO.has(m[1])) {
  runMessengerForwardRepair(monthKey, sd, m[1]);
}

// DESPUÉS:
const { IDS_MENSAJEROS, DUO_SANTIAGO_MIGUEL, DUO_BRAYAN_MAURICIO } = window.ENGINE_CONSTANTS;
const esTurno = IDS_MENSAJEROS.has(m[1])
  || DUO_SANTIAGO_MIGUEL.includes(m[1])
  || DUO_BRAYAN_MAURICIO.includes(m[1]);
if (esTurno) {
  ENGINE_SCHEDULER.runMessengerForwardRepair(state, monthKey, sd, m[1]);
}
```

En el change de checkboxes (no laborado):

```javascript
// ANTES:
runPostMarkedNoWorkDayRepairs(monthKey, eid, d0);
// DESPUÉS:
ENGINE_SCHEDULER.ensureStateShape(state, monthKey);
```

---

## PASO 5: Debug en consola

Para verificar que no hay errores de reglas tras el refactor:

```javascript
// Pegar en la consola del navegador:
ENGINE_VALIDATOR.printValidation(state, '2026-06');
```

---

## REGLAS PARA CURSOR

1. **NO inventar lógica nueva.** Todo está en los módulos del engine.
2. **El orden de los `<script>` es obligatorio** — cada módulo depende del anterior.
3. **Usar `window.ENGINE_*`** para acceder a los módulos desde el IIFE del script principal.
4. **No mover ni renombrar** las funciones exportadas de los módulos — el validator las referencia.
5. **Después de cada cambio**, correr `ENGINE_VALIDATOR.printValidation(state, monthKey)` en consola.
6. **El `state` solo lo mutua `putCell`** — nunca escribir directamente `state.cells[id][day]`.

---

## IDs y Firestore (actualización **files2**)

Los `EMPLEADOS` y grupos del motor usan **los mismos ids** que `programacion-almuerzos.js` y Firestore (`harold_paipa`, `jhonny_rodriguez`, `brayan_yate`, `david_sanchez`, etc.). **No** hace falta `ID_MIGRATION` ni renombrar celdas al cargar/guardar.

- Dúo Mauricio / Brayan Yate en constantes: **`DUO_BRAYAN_MAURICIO`** (`['brayan_yate', 'mauricio_bautista']`).
- Reparación semanal del dúo: **`ENGINE_SCHEDULER.repairDuoBrayanMauricio`** (no `repairDuoCamiloMauricio`).

La tabla de “nomenclatura” de versiones anteriores del spec quedó **obsoleta**; ignórala si copiaste este instructivo de un zip viejo.
