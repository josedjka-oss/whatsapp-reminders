/**
 * scheduler.js — Pipeline principal de generación del horario mensual.
 *
 * ORDEN DEL PIPELINE (no reordenar):
 *  1.  Relleno base (9/6 lun-vie, 9/5 sáb)
 *  2.  Todos 9/6 en lunes laborable y martes post-festivo (excepto trío)
 *  3.  Patrón trío mensajeros
 *  4.  Sábado pm=5 (todos)
 *  5.  Fix 10+5 → 10+6 (combinación prohibida)
 *  6.  Cap no-fijos →44h (1ª pasada)
 *  7.  Enforce trío: 1×am10, 1×pm5 por día
 *  8.  Dúos sin ajuste en lunes/martes-post-festivo
 *  9.  Cap no-fijos →44h (2ª pasada)
 * 10.  Squeeze dúos >44h
 * 11.  Enforce trío (post-squeeze)
 * 12.  Lift no-fijos <44h (excepto Jhonny)
 * 13.  Repair dúo Brayan Yate / Mauricio
 * 14.  Enforce trío (post-lift)
 * 15.  Enforce fijos: 9/6 lun-vie, 9/5 sáb
 * 16.  Cap fijos (semanas con festivo pueden haber subido >44h)
 * 17.  Enforce Jhonny: pm5 mié-jue-vie, nunca am10
 * 18.  Lift Jhonny <44h
 * 19.  Cap Jhonny >44h
 * 20.  Force within ceiling (último recurso, excluye fijos y Jhonny)
 */
(function () {
  'use strict';

  const {
    CFG, EMPLEADOS,
    GRUPO_MENSAJEROS, GRUPO_FIJO,
    DUO_BRAYAN_MAURICIO,
    DUO_SANTIAGO_MIGUEL,
    DUO_JESUS_BRANDON,
    IDS_FIJO, IDS_MENSAJEROS,
    GRUPOS_TURNO,
    usaEntradaSabadoNueve,
  } = window.ENGINE_CONSTANTS;

  const {
    getMonthMeta,
    buildWeekChunks,
    esDiaTodosNueveSeis,
    esChunkCompleto,
  } = window.ENGINE_CALENDAR;

  const { sumWeekHours, normAm, normPm, computeMonthlyExtras } = window.ENGINE_HOURS;

  const {
    applyPatronTrioMes,
    applyLunesMartesMensajeroDiez,
    enforceTrioOneTenOneFive,
    enforceTrioLunesNormal,
  } = window.ENGINE_RULES_MESSENGERS;

  const { applyPatronDuosMes } = window.ENGINE_RULES_DUOS;

  const { enforceJhonny, enforceCristian } = window.ENGINE_RULES_JOHNNY;

  const {
    capWeeklyTo44,
    capFijosTo44,
    capJhonnyTo44,
    squeezeGrupoB,
    liftWeeklyTo44,
    liftJhonny,
    forceWithinCeiling,
  } = window.ENGINE_CAP;

  const { putCell } = window.ENGINE_PUT_CELL;

  // ─── PASOS DEL PIPELINE ───────────────────────────────────────────────────────

  /** am/pm base para sábado laborable (Jonathan y David → 9/5; resto → 9:30/5). */
  const amPmSabadoBase = (empId) =>
    usaEntradaSabadoNueve(empId)
      ? { am: CFG.AM_NORMAL, pm: CFG.PM_SAB }
      : { am: CFG.AM_SABADO, pm: CFG.PM_SAB };

  /** Paso 1: rellena celdas vacías con 9/6 lun-vie y 9:30/5 sáb (Jonathan/David 9/5). */
  const step_rellenoBase = (state, meta) => {
    EMPLEADOS.forEach(({ id }) => {
      if (!state.cells[id]) state.cells[id] = {};
      meta.days.forEach((d) => {
        if (d.noLaborable) {
          state.cells[id][d.day] = { am: '', pm: '' };
          return;
        }
        const cur = state.cells[id][d.day];
        const amE = String(cur?.am ?? '').trim();
        const pmE = String(cur?.pm ?? '').trim();
        if (!cur || (amE === '' && pmE === '')) {
          const sab = amPmSabadoBase(id);
          putCell(state, id, d.day, d.esSabado ? sab.am : '9', d.esSabado ? sab.pm : '6');
        }
      });
    });
  };

  /** Paso 2: lunes laborable y martes post-festivo → no-fijos (excepto trío) a 9/6. */
  const step_todosNueveSeis = (state, meta) => {
    meta.days.forEach((d) => {
      if (d.noLaborable || !esDiaTodosNueveSeis(d, meta.days)) return;
      EMPLEADOS.forEach(({ id }) => {
        if (IDS_MENSAJEROS.has(id)) return; // trío sigue su propia matriz
        putCell(state, id, d.day, '9', '6');
      });
    });
  };

  /** Paso 3: aplica patrón semanal del trío mensajeros. */
  const step_patronTrio = (state, meta, colMap) => {
    applyPatronTrioMes(state, meta, colMap);
  };

  /** Paso 4: sábado laborable → pm=5 para todos. */
  const step_sabadoPmCinco = (state, meta) => {
    meta.days.forEach((d) => {
      if (d.noLaborable || d.dow !== 6) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        if (!c) return;
        const pm = String(c.pm ?? '').trim();
        if (pm === '6' || pm === '06') {
          const sab = amPmSabadoBase(id);
          putCell(state, id, d.day, c.am || sab.am, '5');
        }
      });
    });
  };

  /** Paso 5: eliminar 10+5 → 10+6 entre semana; 10+5 en sáb → 9+5. */
  const step_fixDiezCinco = (state, meta) => {
    meta.days.forEach((d) => {
      if (d.noLaborable) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        if (!c) return;
        const am = String(c.am ?? '').trim();
        const pm = String(c.pm ?? '').trim();
        if ((am !== '10' && am !== '010')) return;
        if (pm === '5' || pm === '05') {
          const sab = amPmSabadoBase(id);
          putCell(state, id, d.day, d.esSabado ? sab.am : '10', d.esSabado ? '5' : '6');
        }
      });
    });
  };

  /** Paso 8: dúos de turno sin am=10 ni pm=5 en lunes/martes-post-festivo. */
  const step_duosSinAjusteLunesMar = (state, meta) => {
    const idsDuos = [
      ...DUO_SANTIAGO_MIGUEL,
      ...DUO_JESUS_BRANDON,
      ...DUO_BRAYAN_MAURICIO,
    ];
    meta.days.forEach((d) => {
      if (d.noLaborable || !esDiaTodosNueveSeis(d, meta.days)) return;
      idsDuos.forEach(id => putCell(state, id, d.day, '9', '6'));
    });
  };

  /** Juan Girón siempre fijo 9/6 (lun–vie) y 9:30/5 sáb. */
  const step_enforceJuanFijo = (state, meta) => {
    const id = 'juan_giron';
    meta.days.forEach((d) => {
      if (d.noLaborable) return;
      const sab = amPmSabadoBase(id);
      putCell(state, id, d.day, d.esSabado ? sab.am : '9', d.esSabado ? sab.pm : '6');
    });
  };

  /** Paso 4b: sábado laborable → 9:30/5 (Jonathan y David → 9/5). Ignora locks en am. */
  const forceSabadoEntrada930 = (state, meta) => {
    meta.days.forEach((d) => {
      if (d.noLaborable || !d.esSabado) return;
      EMPLEADOS.forEach(({ id }) => {
        if (!state.cells[id]) state.cells[id] = {};
        const c = state.cells[id][d.day] || {};
        const pm = normPm(c) || '5';
        const sab = amPmSabadoBase(id);
        state.cells[id][d.day] = {
          am: sab.am,
          pm: pm === '6' ? '5' : pm,
        };
        const locks = state.manualAmPmLocks?.[id]?.[d.day]
          ?? state.manualAmPmLocks?.[id]?.[String(d.day)];
        if (locks?.am) {
          delete locks.am;
          if (!Object.keys(locks).length) {
            delete state.manualAmPmLocks[id][d.day];
            delete state.manualAmPmLocks[id][String(d.day)];
          }
        }
      });
    });
  };

  const step_normalizeSabadoEntrada = (state, meta) => {
    forceSabadoEntrada930(state, meta);
  };

  /** Paso 15: fijos 9/6 lun-vie; sáb 9:30/5 (Jonathan → 9/5). */
  const step_enforceGrupoFijo = (state, meta) => {
    meta.days.forEach((d) => {
      if (d.noLaborable) return;
      GRUPO_FIJO.forEach((id) => {
        const sab = amPmSabadoBase(id);
        putCell(state, id, d.day, d.esSabado ? sab.am : '9', d.esSabado ? sab.pm : '6');
      });
    });
  };

  // ─── PIPELINE PRINCIPAL ───────────────────────────────────────────────────────

  /**
   * Genera / regenera el horario mensual completo.
   * Modifica `state` in-place.
   *
   * @param {object}     state      - estado mutable
   * @param {string}     monthKey   - "YYYY-MM"
   * @param {Map|null}   [colMap]   - permutación de columnas del trío (solo junio)
   */
  const ensureStateShape = (state, monthKey, colMap = null) => {
    const meta = getMonthMeta(monthKey);

    // Limpiar marcas de ausente en días no-laborables
    meta.days.forEach(({ day, noLaborable }) => {
      if (noLaborable) {
        delete state.trioAusentePorDia?.[day];
        delete state.trioAusentePorDia?.[String(day)];
      }
    });

    // Inicializar estructuras si no existen
    if (!state.flagsDiaMarcadoNoLab) state.flagsDiaMarcadoNoLab = {};
    if (!state.trioAusentePorDia)    state.trioAusentePorDia    = {};

    step_rellenoBase(state, meta);              // 1
    step_todosNueveSeis(state, meta);           // 2
    step_patronTrio(state, meta, colMap);       // 3
    applyLunesMartesMensajeroDiez(state, meta); // 3b — lunes/martes-post: 1 mensajero am=10
    step_sabadoPmCinco(state, meta);            // 4
    step_normalizeSabadoEntrada(state, meta); // 4b
    step_fixDiezCinco(state, meta);             // 5
    capWeeklyTo44(state, meta, null);           // 6
    enforceTrioOneTenOneFive(state, meta);      // 7
    enforceTrioLunesNormal(state, meta);        // 7b
    step_duosSinAjusteLunesMar(state, meta);    // 8
    applyPatronDuosMes(state, meta, 1);         // 8b
    step_enforceJuanFijo(state, meta);          // 8c
    capWeeklyTo44(state, meta, null);           // 9
    squeezeGrupoB(state, meta, null);           // 10
    enforceTrioOneTenOneFive(state, meta);      // 11
    liftWeeklyTo44(state, meta, null, null);    // 12
    applyPatronDuosMes(state, meta, 1);           // 13 — restaura alternancia dúos
    applyPatronTrioMes(state, meta, null, 1);    // 13b — restaura alternancia trío
    applyLunesMartesMensajeroDiez(state, meta);  // 13c — lunes/martes-post mensajero
    enforceTrioOneTenOneFive(state, meta);      // 14
    enforceTrioLunesNormal(state, meta);        // 14b
    step_enforceJuanFijo(state, meta);          // 14c
    liftWeeklyTo44(state, meta, null, null);    // 14d — 44h tras restaurar trío/dúos (paso 12 queda anulado por 13b)
    capWeeklyTo44(state, meta, null);           // 14e
    step_enforceGrupoFijo(state, meta);         // 15
    capFijosTo44(state, meta);                  // 16
    enforceJhonny(state, meta, null);           // 17
    enforceCristian(state, meta, null);         // 17b
    liftJhonny(state, meta, monthKey, null);      // 18
    capJhonnyTo44(state, meta, null);           // 19
    forceWithinCeiling(state, meta, null);      // 20
    forceSabadoEntrada930(state, meta);         // 21 — todos los sáb laborables 9:30

    recalcExtras(state, monthKey);
  };

  // ─── REPAIR DÚO BRAYAN YATE / MAURICIO ───────────────────────────────────────

  /**
   * Reaplica patrón alternado Brayan Yate / Mauricio y ajusta techo semanal.
   */
  const repairDuoBrayanMauricio = (state, meta, fromDay = 1) => {
    applyPatronDuosMes(state, meta, fromDay);
    squeezeGrupoB(state, meta, fromDay);
    capWeeklyTo44(state, meta, fromDay);
  };

  // ─── REPARACIÓN TRAS EDICIÓN MANUAL ──────────────────────────────────────────

  /** Copia am/pm de todos los empleados en días anteriores a `beforeDay`. */
  const backupCellsBeforeDay = (state, meta, beforeDay) => {
    const backup = {};
    EMPLEADOS.forEach(({ id }) => {
      meta.days.forEach((d) => {
        if (d.noLaborable || d.day >= beforeDay) return;
        const c = state.cells[id]?.[d.day];
        if (!c) return;
        if (!backup[id]) backup[id] = {};
        backup[id][d.day] = {
          am: c.am != null ? String(c.am) : '',
          pm: c.pm != null ? String(c.pm) : '',
        };
      });
    });
    return backup;
  };

  const restoreCellsBackup = (state, backup) => {
    Object.keys(backup).forEach((id) => {
      Object.keys(backup[id]).forEach((dayStr) => {
        const b = backup[id][dayStr];
        putCell(state, id, Number(dayStr), b.am, b.pm);
      });
    });
  };

  /**
   * Tras edición manual de am/pm: repara solo desde el día siguiente (`startDay+1`).
   * Los días anteriores al editado se restauran al final (no se modifican).
   *
   * @param {object} state
   * @param {string} monthKey
   * @param {number} startDay     - día editado (no se toca en lift; el caller puede fijar am/pm)
   * @param {string} lockedEmpId  - empleado editado
   */
  const runMessengerForwardRepair = (state, monthKey, startDay, lockedEmpId) => {
    if (!monthKey || startDay == null || isNaN(startDay) || startDay < 1) return;
    const meta          = getMonthMeta(monthKey);
    const repairFromDay = startDay + 1;
    const lockedCell    = lockedEmpId ? { id: lockedEmpId, day: startDay } : null;
    const backup        = backupCellsBeforeDay(state, meta, startDay);

    if (repairFromDay <= meta.lastDay) {
      if (IDS_MENSAJEROS.has(lockedEmpId)) {
        applyPatronTrioMes(state, meta, null, repairFromDay);
      }
      enforceTrioOneTenOneFive(state, meta, repairFromDay);
      const metaFrom = { days: meta.days.filter(d => d.day >= repairFromDay), lastDay: meta.lastDay };
      step_fixDiezCinco(state, metaFrom);
      capWeeklyTo44(state, meta, repairFromDay);
      squeezeGrupoB(state, meta, repairFromDay);
      enforceTrioOneTenOneFive(state, meta, repairFromDay);
      step_fixDiezCinco(state, metaFrom);
      step_sabadoPmCinco(state, metaFrom);
      step_normalizeSabadoEntrada(state, meta);
      liftWeeklyTo44(state, meta, repairFromDay, lockedCell);
      applyPatronDuosMes(state, meta, repairFromDay);
      squeezeGrupoB(state, meta, repairFromDay);
      capWeeklyTo44(state, meta, repairFromDay);
      enforceTrioOneTenOneFive(state, meta, repairFromDay);
      enforceJhonny(state, meta, repairFromDay);
      enforceCristian(state, meta, repairFromDay);
      liftJhonny(state, meta, monthKey, repairFromDay);
      capJhonnyTo44(state, meta, repairFromDay);
      capFijosTo44(state, meta, repairFromDay);
      forceWithinCeiling(state, meta, repairFromDay);
    }

    restoreCellsBackup(state, backup);
    recalcExtras(state, monthKey);
  };

  // ─── RECALC EXTRAS ────────────────────────────────────────────────────────────

  /** Recalcula horas extras para todos los empleados y las guarda en state. */
  const recalcExtras = (state, monthKey) => {
    const meta   = getMonthMeta(monthKey);
    const chunks = buildWeekChunks(meta);
    if (!state.horasExtras) state.horasExtras = {};
    EMPLEADOS.forEach(({ id }) => {
      state.horasExtras[id] = String(computeMonthlyExtras(id, chunks, state));
    });
  };

  const fillEmptyCellsOnly = (state, monthKey) => {
    step_rellenoBase(state, getMonthMeta(monthKey));
    recalcExtras(state, monthKey);
  };

  /** Solo rellena celdas que no existen o están totalmente vacías (sin pisar guardadas). */
  const fillMissingCellsOnly = (state, monthKey) => {
    fillEmptyCellsOnly(state, monthKey);
  };

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  const ENGINE_SCHEDULER = {
    ensureStateShape,
    fillEmptyCellsOnly,
    fillMissingCellsOnly,
    repairDuoBrayanMauricio,
    runMessengerForwardRepair,
    recalcExtras,
    // Pasos individuales (para applyJuneTurnTemplate y tests)
    step_rellenoBase,
    step_todosNueveSeis,
    step_patronTrio,
    step_sabadoPmCinco,
    step_normalizeSabadoEntrada,
    forceSabadoEntrada930,
    step_fixDiezCinco,
    step_duosSinAjusteLunesMar,
    step_enforceGrupoFijo,
  };

  window.ENGINE_SCHEDULER = ENGINE_SCHEDULER;

})();
