/**
 * cap-engine.js
 * Pipeline de ajuste de horas semanales para todos los grupos.
 *
 * capWeeklyTo44       — baja no-fijos si >44h
 * capFijosTo44        — baja fijos si >44h (semana con festivo)
 * capJhonnyTo44       — baja Jhonny si >44h tras lift
 * squeezeGrupoB       — ajuste coordinado en dúos de turno
 * liftWeeklyTo44      — sube no-fijos (excepto Jhonny) si <44h
 * liftJhonny          — sube Jhonny a 44h respetando pm5 mié-jue-vie
 * forceWithinCeiling  — último recurso (excluye fijos y Jhonny)
 */
(function () {
  'use strict';

  const {
    CFG, EMPLEADOS,
    GRUPO_MENSAJEROS, GRUPO_FIJO,
    DUO_SANTIAGO_MIGUEL, DUO_BRAYAN_MAURICIO,
    IDS_FIJO, IDS_MENSAJEROS,
  } = window.ENGINE_CONSTANTS;

  const {
    buildWeekChunks,
    esDiaTodosNueveSeis,
  } = window.ENGINE_CALENDAR;

  const {
    sumWeekHours,
    techoSemanal,
    normAm,
    normPm,
  } = window.ENGINE_HOURS;

  const { enforceTrioOneTenOneFive } = window.ENGINE_RULES_MESSENGERS;

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  const putCell = window.ENGINE_PUT_CELL.putCell;

  const esNueveSeis  = (c) => c && normAm(c) === '9'  && normPm(c) === '6';
  const esDiezSeis   = (c) => c && normAm(c) === '10' && normPm(c) === '6';
  const esNueveCinco = (c) => c && normAm(c) === '9'  && normPm(c) === '5';

  const DUOS_RESTRICCION = [DUO_SANTIAGO_MIGUEL, DUO_BRAYAN_MAURICIO];

  const partnerDuo = (id) => {
    for (const duo of DUOS_RESTRICCION) {
      if (duo.includes(id)) return duo.find(x => x !== id);
    }
    return null;
  };

  const esDuoConRestricciones = (id) =>
    DUOS_RESTRICCION.some(duo => duo.includes(id));

  // ─── CAP WEEKLY (NO-FIJOS) ────────────────────────────────────────────────────

  /**
   * Baja horas a no-fijos que superen su techo semanal.
   * Orden de días: vie→jue→mié→mar→lun (dow desc).
   * Respeta restricciones de grupo (no 2×am10 ni 2×pm5).
   */
  const capWeeklyTo44 = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;

    for (let round = 0; round < 20; round++) {
      let progressed = false;
      EMPLEADOS.forEach(({ id }) => {
        if (IDS_FIJO.has(id)) return;
        chunks.forEach((chunk, ci) => {
          const ceil  = techoSemanal(id, chunks, ci, state);
          let guard   = 0;
          while (sumWeekHours(id, chunk, state) > ceil && guard < 20) {
            guard++;
            if (tryBajarUnaHora(state, meta, id, chunk, dayOk)) {
              progressed = true;
            } else break;
          }
        });
      });
      if (!progressed) break;
    }

    forceWithinCeiling(state, meta, minDay);
  };

  /**
   * Cap post-enforce para fijos (semana con festivo → puede haber subido >44h).
   * Baja último día lun-vie con 9/6 → 9/5 hasta no superar 44h.
   */
  const capFijosTo44 = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;
    GRUPO_FIJO.forEach((id) => {
      chunks.forEach((chunk) => {
        let guard = 0;
        while (sumWeekHours(id, chunk, state) > CFG.HORAS_TOPE_SEMANA && guard < 10) {
          guard++;
          const cands = chunk
            .filter(d => dayOk(d) && !d.noLaborable && d.dow >= 1 && d.dow <= 5)
            .sort((a, b) => b.dow - a.dow);
          let lowered = false;
          for (const d of cands) {
            if (esNueveSeis(state.cells[id]?.[d.day])) {
              putCell(state, id, d.day, '9', '5');
              lowered = true;
              break;
            }
          }
          if (!lowered) break;
        }
      });
    });
  };

  /**
   * Cap post-lift para Jhonny.
   * Baja en orden: martes → miércoles (sin festivo) → lunes.
   */
  const capJhonnyTo44 = (state, meta, minDay) => {
    const id     = 'jhonny_rodriguez';
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;
    const { hayFestivoLunesMartesOMiercolesEnSemana } = window.ENGINE_RULES_JOHNNY;

    chunks.forEach((chunk) => {
      let guard = 0;
      while (sumWeekHours(id, chunk, state) > CFG.HORAS_TOPE_SEMANA && guard < 6) {
        guard++;
        let bajado = false;

        const dm = chunk.find(d => dayOk(d) && d.dow === 2 && !d.noLaborable);
        if (dm && esNueveSeis(state.cells[id]?.[dm.day])) {
          putCell(state, id, dm.day, '9', '5'); bajado = true; continue;
        }
        const dw = chunk.find(d => dayOk(d) && d.dow === 3 && !d.noLaborable);
        if (dw && !hayFestivoLunesMartesOMiercolesEnSemana(meta, dw) &&
            esNueveSeis(state.cells[id]?.[dw.day])) {
          putCell(state, id, dw.day, '9', '5'); bajado = true; continue;
        }
        const dl = chunk.find(d => dayOk(d) && d.dow === 1 && !d.noLaborable);
        if (dl && esNueveSeis(state.cells[id]?.[dl.day])) {
          putCell(state, id, dl.day, '9', '5'); bajado = true; continue;
        }

        if (!bajado) break;
      }
    });
  };

  // ─── SQUEEZE (DÚOS DE TURNO >44H) ────────────────────────────────────────────

  /**
   * Dúos con restricciones (Santiago/Miguel, Brayan Yate/Mauricio):
   * ajuste coordinado cuando uno supera 44h.
   * Solo días mar-vie (lunes queda fuera; respeta diaTodosNueveSeis).
   */
  const squeezeGrupoB = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;

    for (const duo of DUOS_RESTRICCION) {
      const [a, b] = duo;
      chunks.forEach((chunk, ci) => {
        for (let r = 0; r < 28; r++) {
          let progressed = false;
          for (const id of [a, b]) {
            const ceil  = techoSemanal(id, chunks, ci, state);
            let guard   = 0;
            while (sumWeekHours(id, chunk, state) > ceil && guard < 28) {
              guard++;
              if (tryBajarUnaHoraDuo(state, meta, id, chunk, dayOk)) {
                progressed = true;
              } else break;
            }
          }
          if (!progressed) break;
        }
      });
    }

    forceWithinCeiling(state, meta, minDay);
  };

  // ─── LIFT (SUBIR A 44H) ───────────────────────────────────────────────────────

  /**
   * Sube 9/5 → 9/6 en no-fijos (excepto Jhonny) que estén bajo 44h.
   * Respeta lockedCell (celda recién editada manualmente).
   */
  const liftWeeklyTo44 = (state, meta, minDay, lockedCell) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;

    for (let round = 0; round < 40; round++) {
      let progressed = false;
      EMPLEADOS.forEach(({ id }) => {
        if (IDS_FIJO.has(id) || id === 'jhonny_rodriguez') return;
        chunks.forEach((chunk) => {
          if (sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;
          const d = chunk.find(d => {
            if (!dayOk(d)) return false;
            if (lockedCell && lockedCell.id === id && lockedCell.day === d.day) return false;
            if (d.noLaborable || d.dow < 1 || d.dow > 5) return false;
            return esNueveCinco(state.cells[id]?.[d.day]);
          });
          if (!d) return;
          putCell(state, id, d.day, '9', '6');
          progressed = true;
        });
      });
      if (!progressed) break;
    }
  };

  /**
   * Sube Jhonny a 44h/semana en días permitidos: mar → mié (con festivo) → lun.
   * No toca jue/vie (siempre pm5) ni sábado.
   */
  const liftJhonny = (state, meta, monthKey, minDay) => {
    const id     = 'jhonny_rodriguez';
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;
    const { hayFestivoLunesMartesOMiercolesEnSemana } = window.ENGINE_RULES_JOHNNY;

    const trySubir = (d) => {
      if (!dayOk(d)) return false;
      const c = state.cells[id]?.[d.day];
      if (esNueveCinco(c) || esDiezSeis(c)) {
        putCell(state, id, d.day, '9', '6');
        return true;
      }
      return false;
    };

    chunks.forEach((chunk) => {
      if (sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;

      const dm = chunk.find(d => dayOk(d) && d.dow === 2 && !d.noLaborable);
      if (dm && trySubir(dm) && sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;

      const dw = chunk.find(d => dayOk(d) && d.dow === 3 && !d.noLaborable);
      if (dw && hayFestivoLunesMartesOMiercolesEnSemana(meta, dw)) {
        if (trySubir(dw) && sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;
      }

      const dl = chunk.find(d => dayOk(d) && d.dow === 1 && !d.noLaborable);
      if (dl) trySubir(dl);
    });
  };

  // ─── FORCE WITHIN CEILING (ÚLTIMO RECURSO) ───────────────────────────────────

  /**
   * Garantiza que nadie supere su techo usando mutaciones de último recurso.
   * Excluye fijos (los maneja capFijosTo44) y Jhonny (lo maneja capJhonnyTo44).
   */
  const forceWithinCeiling = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = (d) => minDay == null || d.day >= minDay;

    for (let mega = 0; mega < 40; mega++) {
      let progressed = false;

      EMPLEADOS.forEach(({ id }) => {
        if (IDS_FIJO.has(id) || id === 'jhonny_rodriguez') return;
        chunks.forEach((chunk, ci) => {
          const ceil = techoSemanal(id, chunks, ci, state);
          if (sumWeekHours(id, chunk, state) <= ceil) return;

          const before = sumWeekHours(id, chunk, state);
          const cands  = chunk
            .filter(d => dayOk(d) && !d.noLaborable && d.dow >= 1 && d.dow <= 5
                         && !esDiaTodosNueveSeis(d, meta.days))
            .sort((a, b) => b.dow - a.dow);

          for (const d of cands) {
            if (sumWeekHours(id, chunk, state) <= ceil) break;
            if (tryBrutal9to10(state, meta, id, d))             { progressed = true; break; }
            if (tryBrutal96to95partnerTen(state, meta, id, d))  { progressed = true; break; }
            if (tryBrutal96to95partnerNine(state, meta, id, d)) { progressed = true; break; }
          }

          // Sábado como último recurso
          if (sumWeekHours(id, chunk, state) > ceil) {
            const sat = chunk.find(d => d.dow === 6 && !d.noLaborable && dayOk(d));
            if (sat && esNueveSeis(state.cells[id]?.[sat.day])) {
              putCell(state, id, sat.day, CFG.AM_SABADO, '5');
              if (IDS_MENSAJEROS.has(id)) enforceTrioOneTenOneFive(state, meta, sat.day);
              progressed = true;
            }
          }

          if (sumWeekHours(id, chunk, state) < before) progressed = true;
        });
      });

      if (!progressed) break;
    }
  };

  // ─── HELPERS DE BAJADA ────────────────────────────────────────────────────────

  const tryBajarUnaHora = (state, meta, id, chunk, dayOk) => {
    const cands = chunk
      .filter(d => dayOk(d) && !d.noLaborable && d.dow >= 1 && d.dow <= 5
                   && !esDiaTodosNueveSeis(d, meta.days)
                   && esNueveSeis(state.cells[id]?.[d.day]))
      .sort((a, b) => b.dow - a.dow);

    for (const d of cands) {
      if (tryBrutal9to10(state, meta, id, d))            return true;
      if (tryBrutal96to95partnerTen(state, meta, id, d)) return true;
    }
    return false;
  };

  const tryBajarUnaHoraDuo = (state, meta, id, chunk, dayOk) => {
    if (!esDuoConRestricciones(id)) return tryBajarUnaHora(state, meta, id, chunk, dayOk);

    const pr = partnerDuo(id);
    const cands = chunk
      .filter(d => dayOk(d) && !d.noLaborable && d.dow >= 2 && d.dow <= 5
                   && !esDiaTodosNueveSeis(d, meta.days)
                   && esNueveSeis(state.cells[id]?.[d.day]))
      .sort((a, b) => b.dow - a.dow);

    for (const d of cands) {
      if (tryBrutal9to10(state, meta, id, d))             return true;
      if (pr && tryBrutal96to95partnerTen(state, meta, id, d))  return true;
      if (pr && tryBrutal96to95partnerNine(state, meta, id, d)) return true;
    }
    return false;
  };

  /** 9/6 → 10/6 si no hay otro con am=10 en el grupo ese día. */
  const tryBrutal9to10 = (state, meta, id, d) => {
    if (!esNueveSeis(state.cells[id]?.[d.day])) return false;

    if (IDS_MENSAJEROS.has(id)) {
      const otroConDiez = GRUPO_MENSAJEROS.some(
        id2 => id2 !== id && normAm(state.cells[id2]?.[d.day]) === '10'
      );
      if (otroConDiez) return false;
    } else if (esDuoConRestricciones(id)) {
      const pr = partnerDuo(id);
      if (pr && normAm(state.cells[pr]?.[d.day]) === '10') return false;
    }

    putCell(state, id, d.day, '10', '6');
    if (IDS_MENSAJEROS.has(id)) enforceTrioOneTenOneFive(state, meta, d.day);
    return true;
  };

  /** Yo 9/6 y compañero 10/6 → yo 9/5. Solo dúos con restricciones. */
  const tryBrutal96to95partnerTen = (state, meta, id, d) => {
    if (!esDuoConRestricciones(id)) return false;
    const pr = partnerDuo(id);
    if (!pr) return false;
    if (!esNueveSeis(state.cells[id]?.[d.day])) return false;
    if (!esDiezSeis(state.cells[pr]?.[d.day]))  return false;
    putCell(state, id, d.day, '9', '5');
    return true;
  };

  /** Ambos 9/6 → yo 9/5. Solo dúos con restricciones. */
  const tryBrutal96to95partnerNine = (state, meta, id, d) => {
    if (!esDuoConRestricciones(id)) return false;
    const pr = partnerDuo(id);
    if (!pr) return false;
    if (!esNueveSeis(state.cells[id]?.[d.day])) return false;
    if (!esNueveSeis(state.cells[pr]?.[d.day]))  return false;
    putCell(state, id, d.day, '9', '5');
    return true;
  };

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  const ENGINE_CAP = {
    capWeeklyTo44,
    capFijosTo44,
    capJhonnyTo44,
    squeezeGrupoB,
    liftWeeklyTo44,
    liftJhonny,
    forceWithinCeiling,
  };

  window.ENGINE_CAP = ENGINE_CAP;

})();
