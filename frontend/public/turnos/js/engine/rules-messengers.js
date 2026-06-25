/**
 * rules-messengers.js
 * Trío mensajería (Harold Paipa / Diego Lozano / Dilan Toro):
 *   - Patrón semanal 44h (matriz 3×6: lun–sáb)
 *   - Máx 1 am=10 y máx 1 pm=5 por día entre los tres
 *   - Almuerzos escalonados: quien entra 10 → 2:00; los otros → 12:00 y 1:00 (hash)
 *   - Lunes laborable: 1 mensajero entra 10 (rota semanal); nadie sale 5
 *   - Martes post-festivo: 1 mensajero entra 10; resto 9/6
 *   - Sábado: todos 9/5
 */
(function () {
  'use strict';

  const {
    GRUPO_MENSAJEROS,
    TRIO_ROW_BY_ID,
    ALMUERZOS_MENSAJEROS,
    ALMUERZOS_SABADO,
    ALMUERZOS_SABADO_DUO,
    CFG,
  } = window.ENGINE_CONSTANTS;

  const {
    buildWeekChunks,
    esDiaTodosNueveSeis,
    esMartesPostFestivo,
    esLunesLaborable,
  } = window.ENGINE_CALENDAR;
  const { normAm, normPm } = window.ENGINE_HOURS;

  // ─── PATRÓN SEMANAL TRÍO 44H ──────────────────────────────────────────────────
  //
  // Filas: Harold=0, Dilan=1, Diego=2  (TRIO_ROW_BY_ID)
  // Lun–vie: T=10/6, F=9/5, N=9/6 — por columna hay exactamente un T, un F y un N.
  // Semanas impares: cada mensajero toma el rol del siguiente (quien tenía 10 pasa a 5, etc.).
  // Sábado: todos 9/5.
  //
  const cellFromCode = (code) => {
    if (code === 'T') return { am: '10', pm: '6' };
    if (code === 'F') return { am: '9', pm: '5' };
    return { am: '9', pm: '6' };
  };

  const PATRON_TRIO_CODES = [
    ['F', 'N', 'F', 'T', 'N'], // Harold
    ['N', 'T', 'N', 'F', 'T'], // Dilan
    ['N', 'F', 'T', 'N', 'F'], // Diego
  ];

  /** Referencia legado (lun–vie + sáb 9/5) */
  const PATRON_TRIO = PATRON_TRIO_CODES.map((row) =>
    row.map((code) => cellFromCode(code)).concat([{ am: CFG.AM_SABADO, pm: '5' }])
  );

  // ─── APLICAR PATRÓN ───────────────────────────────────────────────────────────

  /**
   * Aplica patrón del trío a un chunk semanal (lun–sáb).
   */
  const applyPatronTrioWeek = (state, chunk, weekIdx, meta, colMap, fromDay = 1) => {
    const rotateRoles = weekIdx % 2 === 1;

    chunk.forEach((d) => {
      if (!d.inMonth || d.day == null || d.day < fromDay || d.noLaborable) return;

      if (d.esSabado || d.dow === 6) {
        GRUPO_MENSAJEROS.forEach((id) => putCell(state, id, d.day, CFG.AM_SABADO, '5'));
        return;
      }

      if (d.dow < 1 || d.dow > 5) return;
      if (esDiaTodosNueveSeis(d, meta.days)) return;

      const col = colMap != null ? (colMap.get(d.day) ?? d.dow - 1) : d.dow - 1;
      if (col < 0 || col > 4) return;

      GRUPO_MENSAJEROS.forEach((id) => {
        const row  = TRIO_ROW_BY_ID[id] ?? 0;
        let code = PATRON_TRIO_CODES[row][col];
        if (rotateRoles) code = PATRON_TRIO_CODES[(row + 1) % 3][col];
        const p = cellFromCode(code);
        putCell(state, id, d.day, p.am, p.pm);
      });
    });
  };

  /**
   * Aplica el patrón del trío para un día concreto (semana par, sin rotación).
   */
  const applyPatronTrioDia = (state, dayNum, colIdx, weekIdx = 0) => {
    const rotateRoles = weekIdx % 2 === 1;
    const col         = colIdx > 4 ? 4 : colIdx;
    GRUPO_MENSAJEROS.forEach((id) => {
      const row  = TRIO_ROW_BY_ID[id] ?? 0;
      let code = PATRON_TRIO_CODES[row][col];
      if (rotateRoles) code = PATRON_TRIO_CODES[(row + 1) % 3][col];
      if (colIdx === 5 || colIdx > 4) {
        putCell(state, id, dayNum, CFG.AM_SABADO, '5');
        return;
      }
      const p = cellFromCode(code);
      putCell(state, id, dayNum, p.am, p.pm);
    });
  };

  /**
   * Aplica el patrón completo del trío para todo el mes (alternancia por semana).
   * @param {object}             state
   * @param {object}             meta
   * @param {Map<number,number>} [colMap]  dayNum→colIdx lun–vie (rotación junio)
   * @param {number}             [fromDay=1]
   */
  const applyPatronTrioMes = (state, meta, colMap = null, fromDay = 1) => {
    const chunks = buildWeekChunks(meta);
    chunks.forEach((chunk, weekIdx) => {
      applyPatronTrioWeek(state, chunk, weekIdx, meta, colMap, fromDay);
    });
    meta.days.forEach((d) => {
      if (!d.noLaborable) return;
      GRUPO_MENSAJEROS.forEach((id) => putCell(state, id, d.day, '', ''));
    });
  };

  // ─── ENFORCE: UN SOLO 10 Y UN SOLO 5 POR DÍA ─────────────────────────────────

  /**
   * Garantiza que en cada día laborable entre semana:
   *   - Máx 1 am=10 entre los tres mensajeros
   *   - Máx 1 pm=5 entre los tres mensajeros
   * Sábado: todos 9:30/5.
   * También corrige la combinación prohibida 10+5 → 10+6.
   *
   * @param {object} state
   * @param {object} meta
   * @param {number} [fromDay=1]
   */
  const enforceTrioOneTenOneFive = (state, meta, fromDay = 1) => {
    meta.days.forEach((d) => {
      if (!d.inMonth || d.day == null || d.day < fromDay || d.noLaborable) return;

      // Sábado: todos 9:30/5
      if (d.dow === 6) {
        GRUPO_MENSAJEROS.forEach(id => putCell(state, id, d.day, CFG.AM_SABADO, '5'));
        return;
      }
      if (d.dow < 1 || d.dow > 5) return;

      // Corregir 10+5 → 10+6
      GRUPO_MENSAJEROS.forEach(id => {
        const c = state.cells[id]?.[d.day];
        if (c && normAm(c) === '10' && normPm(c) === '5') {
          putCell(state, id, d.day, '10', '6');
        }
      });

      // Máximo un am=10
      const conDiez = GRUPO_MENSAJEROS.filter(id => normAm(state.cells[id]?.[d.day]) === '10');
      if (conDiez.length > 1) {
        let primero = true;
        conDiez.forEach(id => {
          if (primero) { primero = false; return; }
          putCell(state, id, d.day, '9', '6');
        });
      }

      // Máximo un pm=5
      const conCinco = GRUPO_MENSAJEROS.filter(id => normPm(state.cells[id]?.[d.day]) === '5');
      if (conCinco.length > 1) {
        let primero = true;
        GRUPO_MENSAJEROS.forEach(id => {
          if (normPm(state.cells[id]?.[d.day]) !== '5') return;
          if (primero) { primero = false; return; }
          putCell(state, id, d.day, '9', '6');
        });
      }
    });
  };

  // ─── ENFORCE: LUNES / MARTES POST-FESTIVO ─────────────────────────────────────

  /**
   * Lunes laborable: 1 mensajero am=10 (rota semanal); resto 9/6; nadie pm=5.
   * Martes post-festivo: igual (1 mensajero am=10).
   */
  const applyLunesMartesMensajeroDiez = (state, meta, fromDay = 1) => {
    const chunks = buildWeekChunks(meta);
    chunks.forEach((chunk, weekIdx) => {
      const pickId = GRUPO_MENSAJEROS[weekIdx % GRUPO_MENSAJEROS.length];
      chunk.forEach((d) => {
        if (!d.inMonth || d.day == null || d.day < fromDay || d.noLaborable) return;
        const aplica = esLunesLaborable(d) || esMartesPostFestivo(d, meta.days);
        if (!aplica) return;
        GRUPO_MENSAJEROS.forEach((id) => {
          if (id === pickId) putCell(state, id, d.day, '10', '6');
          else putCell(state, id, d.day, '9', '6');
        });
      });
    });
  };

  /**
   * Lunes/martes-post-festivo: máximo UN mensajero con am=10; nadie con pm=5.
   */
  const enforceTrioLunesNormal = (state, meta) => {
    meta.days.forEach((d) => {
      const aplica = esLunesLaborable(d) || esMartesPostFestivo(d, meta.days);
      if (!aplica) return;

      GRUPO_MENSAJEROS.forEach((id) => {
        const c = state.cells[id]?.[d.day];
        if (normPm(c) === '5') putCell(state, id, d.day, normAm(c) || '9', '6');
      });

      const conDiez = GRUPO_MENSAJEROS.filter(id => normAm(state.cells[id]?.[d.day]) === '10');
      if (conDiez.length > 1) {
        conDiez.slice(1).forEach(id => putCell(state, id, d.day, '9', '6'));
      }
    });
  };

  // ─── ALMUERZOS DEL TRÍO ───────────────────────────────────────────────────────

  /**
   * Hash determinístico día-dependiente para evitar monotonía en almuerzos.
   */
  const hashDia = (monthKey, d, salt) => {
    let h = 2166136261;
    const s = `${monthKey}|${d.ymd}|${d.day}|${d.dow}|${salt}`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const PERMS6 = [
    [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0],
  ];

  const PERMS3 = PERMS6;

  /**
   * Retorna mapa { empId: franja } de almuerzos del trío para un día.
   * Quien entra a las 10 → 2:00.
   * Los otros dos → 12:00 y 1:00 (hash estable por día).
   * Si todos con 9 → permuta las 3 franjas (1 de 6 opciones por día).
   * Si hay ausente → getLunchTrioDos().
   *
   * @param {object}  state
   * @param {DayMeta} d
   * @param {string}  monthKey
   * @returns {Object.<string,string>}
   */
  const getLunchTrio = (state, d, monthKey, meta) => {
    const dayNum  = d.day;
    const ausente = getAusenteTrio(state, dayNum);
    const ids     = ausente
      ? GRUPO_MENSAJEROS.filter(x => x !== ausente)
      : [...GRUPO_MENSAJEROS];

    if (ids.length === 2) return getLunchTrioDos(state, ids, d, monthKey, meta);

    if (d.esSabado) {
      return window.ENGINE_LUNCH_SABADO.assignTrioSabadoLunch(ids, d, meta);
    }

    const conDiez  = ids.filter(id => normAm(state.cells[id]?.[dayNum]) === '10');
    const conNueve = ids.filter(id => normAm(state.cells[id]?.[dayNum]) !== '10');
    const out      = {};

    if (conDiez.length === 1) {
      out[conDiez[0]] = '2:00';
      const ordered = [...conNueve].sort(
        (a, b) => GRUPO_MENSAJEROS.indexOf(a) - GRUPO_MENSAJEROS.indexOf(b)
      );
      const flip = hashDia(monthKey, d, `trio|${conDiez[0]}`) & 1;
      out[ordered[0]] = flip ? '1:00' : '12:00';
      out[ordered[1]] = flip ? '12:00' : '1:00';
    } else {
      // Todos con 9: permutación de las 3 franjas
      const perm = PERMS6[hashDia(monthKey, d, 'trio-roll3') % 6];
      ids.forEach((id, i) => { out[id] = ALMUERZOS_MENSAJEROS[perm[i]]; });
      // Corrección si hay alguno con 10 (no debería tras enforce, pero por seguridad)
      conDiez.forEach(id => {
        out[id] = '2:00';
        const others = ids
          .filter(x => x !== id)
          .sort((a, b) => GRUPO_MENSAJEROS.indexOf(a) - GRUPO_MENSAJEROS.indexOf(b));
        const flip = hashDia(monthKey, d, `trio-sub|${id}`) & 1;
        out[others[0]] = flip ? '1:00' : '12:00';
        out[others[1]] = flip ? '12:00' : '1:00';
      });
    }

    return out;
  };

  /**
   * Almuerzos del trío cuando hay un ausente (solo 2 presentes).
   */
  const getLunchTrioDos = (state, ids, d, monthKey, meta) => {
    const dayNum   = d.day;

    if (d.esSabado) {
      return window.ENGINE_LUNCH_SABADO.assignDuoSabadoLunch(ids, d, meta);
    }

    const conDiez  = ids.filter(id => normAm(state.cells[id]?.[dayNum]) === '10');
    const out      = {};

    if (conDiez.length === 1) {
      out[conDiez[0]] = '2:00';
      const otro = ids.find(x => x !== conDiez[0]);
      const flip = hashDia(monthKey, d, `trio2|${conDiez[0]}`) & 1;
      out[otro] = flip ? '1:00' : '12:00';
    } else {
      const ordered = [...ids].sort(
        (a, b) => GRUPO_MENSAJEROS.indexOf(a) - GRUPO_MENSAJEROS.indexOf(b)
      );
      const flip =
        (hashDia(monthKey, d, `trio2-a`) ^
         hashDia(monthKey, d, `trio2-b`) ^
         d.day ^ (d.dow << 3)) & 1;
      out[ordered[0]] = flip ? '1:00' : '12:00';
      out[ordered[1]] = flip ? '12:00' : '1:00';
    }

    return out;
  };

  // ─── HELPER: AUSENTE TRÍO ─────────────────────────────────────────────────────

  /**
   * Retorna el id del mensajero marcado como ausente ese día, o null.
   */
  const getAusenteTrio = (state, dayNum) => {
    const raw = state?.trioAusentePorDia?.[dayNum]
             ?? state?.trioAusentePorDia?.[String(dayNum)];
    if (!raw || !GRUPO_MENSAJEROS.includes(String(raw))) return null;
    return String(raw);
  };

  // ─── HELPER: PUT CELL ────────────────────────────────────────────────────────

  const putCell = window.ENGINE_PUT_CELL.putCell;

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  const ENGINE_RULES_MESSENGERS = {
    PATRON_TRIO,
    PATRON_TRIO_CODES,
    applyPatronTrioWeek,
    applyPatronTrioDia,
    applyPatronTrioMes,
    applyLunesMartesMensajeroDiez,
    enforceTrioOneTenOneFive,
    enforceTrioLunesNormal,
    getLunchTrio,
    getLunchTrioDos,
    getAusenteTrio,
  };

  window.ENGINE_RULES_MESSENGERS = ENGINE_RULES_MESSENGERS;

})();
