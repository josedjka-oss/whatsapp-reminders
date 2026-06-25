/**
 * hours.js
 * Cálculo de horas efectivas diarias y semanales.
 * Lógica de techo (44h), carry de déficit y horas extras.
 * Sin efectos secundarios sobre el estado.
 */
(function () {
  'use strict';

  const { CFG, IDS_FIJO, usaAlmuerzoHoraSabado, usaEntradaSabadoNueve } = window.ENGINE_CONSTANTS;
  const { esChunkCompleto } = window.ENGINE_CALENDAR;

  // ─── CONVERSIÓN AM/PM ─────────────────────────────────────────────────────────

  /**
   * Normaliza el valor de entrada (am): '9','09' → 9; '10','010' → 10.
   * @param {string|number} v
   * @returns {number|null}
   */
  /**
   * Entrada am: 9/10/930 mañana; 1→13:00, 2→14:00… (tarde, se muestra tal cual en celda).
   */
  const parseAm = (v) => {
    const raw = String(v ?? '').trim().toLowerCase().replace(/\s/g, '');
    if (raw === '0' || raw === '00') return null;
    if (raw === '930' || raw === '9:30' || raw === '09:30' || raw === '9.5') return 9.5;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return null;
    if (n >= 1 && n <= 7) return n + 12;
    return n;
  };

  /** Jornada completa estándar → descuenta almuerzo; manual/acortada → no. */
  const esJornadaCompleta = (amStr, pmStr, esSabado = false, empId = null) => {
    const am = parseAm(amStr);
    const pm = parsePm(pmStr);
    if (am === null || pm === null) return false;
    if (esSabado && empId && usaEntradaSabadoNueve(empId)) {
      return am === 9 && pm === 17;
    }
    if (esSabado) return am === 9.5 && pm === 17;
    return (am === 9 && pm === 18) || (am === 10 && pm === 18)
        || (am === 9 && pm === 17) || (am === 10 && pm === 17);
  };

  /**
   * Convierte pm en hora 24h: '5'/'05' → 17, '6'/'06' → 18, '12' → 12, etc.
   * @param {string|number} v
   * @returns {number|null}
   */
  const parsePm = (v) => {
    const n = Number(String(v ?? '').trim());
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n >= 13 && n <= 23) return n;
    if (n === 12) return 12;
    if (n >= 1 && n <= 11) return n + 12;
    return null;
  };

  /**
   * Horas efectivas de una celda (am/pm), descontando 1h almuerzo.
   * @param {string} amStr
   * @param {string} pmStr
   * @param {boolean} noLaborable
   * @returns {number|null}  null = domingo/no-laborable sin festivo
   */
  const horasAlmuerzoParaDia = (esSabado, empId = null) => {
    if (esSabado && empId && usaAlmuerzoHoraSabado(empId)) return CFG.HORAS_ALMUERZO;
    return esSabado ? CFG.HORAS_ALMUERZO_SAB : CFG.HORAS_ALMUERZO;
  };

  const computeDailyHours = (amStr, pmStr, noLaborable, esSabado = false, empId = null) => {
    if (noLaborable) return null;
    const am = parseAm(amStr);
    const pm = parsePm(pmStr);
    if (am === null || pm === null) return 0;
    if (pm <= am) return 0;
    const almuerzo = esJornadaCompleta(amStr, pmStr, esSabado, empId)
      ? horasAlmuerzoParaDia(esSabado, empId)
      : 0;
    return Math.max(0, Math.round((pm - am - almuerzo) * 2) / 2);
  };

  /**
   * Horas que se muestran en la fila "Horas trabajadas / día" y en Σ semana.
   * Reglas:
   *   - Festivo entre semana (no domingo) → 7h fijas (siempre, para todos)
   *   - Domingo → null (muestra "--")
   *   - Día marcado como no-laborado (checkbox) → 7h
   *   - Entrada am = 0 (no asiste) → 7h
   *   - Día marcado ausente trío → 7h
   *   - Resto → computeDailyHours
   *
   * @param {DayMeta}  d
   * @param {{ am: string, pm: string }|null} cell
   * @param {string}   empId
   * @param {object}   stateRef   - referencia al state global
   * @returns {number|null}
   */
  const getDisplayedHours = (d, cell, empId, stateRef) => {
    // Festivo entre semana (lun-sáb): siempre 7h en Σ
    if (d.noLaborable && d.festivo) return CFG.HORAS_FESTIVO_SEMANA;
    // Domingo u otro no-laborable sin festivo
    if (d.noLaborable) return null;
    // Ausente trío mensajero
    if (empId && stateRef && esAusenteTrio(stateRef, empId, d.day)) {
      return CFG.HORAS_FESTIVO_SEMANA;
    }
    // Entrada 0 = no asiste (7h en Σ semanal)
    if (empId && stateRef && esAusenteEntradaCeroDia(stateRef, empId, d.day)) {
      return CFG.HORAS_FESTIVO_SEMANA;
    }
    // Día marcado manualmente como no-laborado (checkbox naranja)
    if (empId && stateRef && esDiaMarcadoNoLab(stateRef, empId, d.day)) {
      return CFG.HORAS_FESTIVO_SEMANA;
    }
    return computeDailyHours(cell?.am, cell?.pm, false, !!d.esSabado, empId);
  };

  // ─── HELPERS DE ESTADO ────────────────────────────────────────────────────────

  const esDiaMarcadoNoLab = (stateRef, empId, dayNum) =>
    !!(stateRef?.flagsDiaMarcadoNoLab?.[empId]?.[dayNum]);

  /** Entrada am = 0 → empleado no asiste ese día. */
  const esEntradaAusenteCero = (cell) => {
    const v = String(cell?.am ?? '').trim();
    return v === '0' || v === '00';
  };

  const esAusenteEntradaCeroDia = (stateRef, empId, dayNum) => {
    if (!stateRef || !empId || dayNum == null) return false;
    const cell =
      stateRef.cells?.[empId]?.[dayNum]
      ?? stateRef.cells?.[empId]?.[String(dayNum)];
    return esEntradaAusenteCero(cell);
  };

  const esAusenteEntradaCeroRaw = (amStr) => {
    const v = String(amStr ?? '').trim();
    return v === '0' || v === '00';
  };

  const esAusenteTrio = (stateRef, empId, dayNum) => {
    const { GRUPO_MENSAJEROS } = window.ENGINE_CONSTANTS;
    if (!GRUPO_MENSAJEROS.includes(empId)) return false;
    const raw = stateRef?.trioAusentePorDia?.[dayNum] ?? stateRef?.trioAusentePorDia?.[String(dayNum)];
    return String(raw) === empId;
  };

  // ─── SUMA SEMANAL ─────────────────────────────────────────────────────────────

  /**
   * Suma de horas mostradas en el chunk (lun–sáb) para un empleado.
   * @param {string}    empId
   * @param {DayMeta[]} chunk
   * @param {object}    stateRef
   * @returns {number}
   */
  const sumWeekHours = (empId, chunk, stateRef) =>
    chunk.reduce((acc, d) => {
      const h = getDisplayedHours(d, stateRef.cells[empId]?.[d.day], empId, stateRef);
      return acc + (h ?? 0);
    }, 0);

  // ─── TECHO SEMANAL (CARRY) ───────────────────────────────────────────────────

  /**
   * ¿Puede este empleado arrastrar déficit de semanas anteriores?
   * Solo trío mensajeros y dúos con objetivo 44h.
   * Los fijos NO tienen carry.
   * @param {string} empId
   */
  const puedeArrastrarDeficit = (empId) => !IDS_FIJO.has(empId);

  /**
   * Hay al menos un día laborable en el chunk con ausencia marcada (trío o checkbox).
   * Solo en ese caso se genera carry al déficit.
   */
  const chunkTieneAusenciaMarcada = (stateRef, empId, chunk) =>
    chunk.some((d) => {
      if (d.noLaborable) return false;
      return esAusenteTrio(stateRef, empId, d.day)
        || esDiaMarcadoNoLab(stateRef, empId, d.day)
        || esAusenteEntradaCeroDia(stateRef, empId, d.day);
    });

  /**
   * Carry acumulado de déficit de semanas completas anteriores al índice `chunkIdx`.
   * Solo para no-fijos con ausencia marcada.
   */
  const carryAntesDe = (empId, chunks, chunkIdx, stateRef) => {
    let carry = 0;
    for (let i = 0; i < chunkIdx; i++) {
      const ch = chunks[i];
      if (!esChunkCompleto(ch)) continue;
      const s = sumWeekHours(empId, ch, stateRef);
      if (s < CFG.HORAS_TOPE_SEMANA) {
        if (puedeArrastrarDeficit(empId) && chunkTieneAusenciaMarcada(stateRef, empId, ch)) {
          carry += CFG.HORAS_TOPE_SEMANA - s;
        }
      } else {
        carry = Math.max(0, carry - (s - CFG.HORAS_TOPE_SEMANA));
      }
    }
    return carry;
  };

  /**
   * Techo de horas para un chunk: 44 + carry (solo no-fijos y chunks completos).
   * Fijos: no tienen techo de 44h (siempre 47h objetivo, sin lógica de cap aquí).
   */
  const techoSemanal = (empId, chunks, chunkIdx, stateRef) => {
    if (IDS_FIJO.has(empId)) return Infinity; // fijos no tienen cap de 44h
    const ch = chunks[chunkIdx];
    if (!esChunkCompleto(ch)) return CFG.HORAS_TOPE_SEMANA;
    return CFG.HORAS_TOPE_SEMANA + carryAntesDe(empId, chunks, chunkIdx, stateRef);
  };

  // ─── HORAS EXTRAS ─────────────────────────────────────────────────────────────

  /**
   * Horas extras del mes: solo semanas completas lun–sáb (misma base que la columna Σ).
   * Déficit bajo 44 h compensa exceso en semanas posteriores.
   * Ej.: 42 h + 46 h → 0; cuatro semanas 44 h + una 45 h → 1.
   */
  const computeMonthlyExtras = (empId, chunks, stateRef) => {
    let carry = 0;
    let total = 0;
    chunks.forEach((chunk) => {
      if (!esChunkCompleto(chunk)) return;

      const s      = sumWeekHours(empId, chunk, stateRef);
      const target = CFG.HORAS_TOPE_SEMANA;

      if (s < target) {
        carry += target - s;
        return;
      }
      if (s <= target) return;

      const excess = s - target;
      const soaked = Math.min(excess, carry);
      carry -= soaked;
      total += excess - soaked;
    });
    return total;
  };

  // ─── HELPERS DE CELDA ────────────────────────────────────────────────────────

  /** Normaliza am a '9', '930' o '10' (elimina padding '09'/'010'). */
  const normAm = (cell) => {
    const v = String(cell?.am ?? '').trim().toLowerCase().replace(/\s/g, '');
    if (v === '0' || v === '00') return '0';
    if (v === '930' || v === '9:30' || v === '09:30' || v === '9.5') return CFG.AM_SABADO;
    if (v === '09' || v === '9') return '9';
    if (v === '010' || v === '10') return '10';
    return String(cell?.am ?? '').trim();
  };

  const isEntradaSabado = (amVal) => normAm({ am: amVal }) === CFG.AM_SABADO;

  const formatAmDisplay = (v) => {
    const raw = String(v ?? '').trim();
    if (raw === '0' || raw === '00') return '0';
    const n = normAm({ am: v });
    if (n === CFG.AM_SABADO) return '9:30';
    if (n === '9') return '9';
    if (n === '10') return '10';
    if (n === '0') return '0';
    return raw || '';
  };

  /** Normaliza pm a '5' o '6'. */
  const normPm = (cell) => {
    const v = String(cell?.pm ?? '').trim();
    if (v === '05' || v === '5') return '5';
    if (v === '06' || v === '6') return '6';
    return v;
  };

  /** Horas efectivas solo de la celda (sin ausencias, sin festivo). */
  const horasCeldaDirect = (cell, d, empId = null) => {
    if (!cell || d.noLaborable) return null;
    return computeDailyHours(cell.am, cell.pm, false, !!d.esSabado, empId);
  };

  const ENGINE_HOURS = {
    parseAm,
    parsePm,
    esJornadaCompleta,
    computeDailyHours,
    horasAlmuerzoParaDia,
    getDisplayedHours,
    esDiaMarcadoNoLab,
    esEntradaAusenteCero,
    esAusenteEntradaCeroDia,
    esAusenteEntradaCeroRaw,
    esAusenteTrio,
    sumWeekHours,
    puedeArrastrarDeficit,
    chunkTieneAusenciaMarcada,
    carryAntesDe,
    techoSemanal,
    computeMonthlyExtras,
    normAm,
    normPm,
    isEntradaSabado,
    formatAmDisplay,
    horasCeldaDirect,
  };

  window.ENGINE_HOURS = ENGINE_HOURS;

})();
