/**
 * cap-engine.js
 * Pipeline de ajuste de horas semanales para todos los grupos.
 *
 * capWeeklyTo44       — baja no-fijos si >44h
 * capFijosTo44        — (obsoleto) fijos no tienen techo 44h
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
    DUO_SANTIAGO_MIGUEL, DUO_JESUS_BRANDON, DUO_BRAYAN_MAURICIO,
    IDS_FIJO, IDS_MENSAJEROS,
  } = window.ENGINE_CONSTANTS;

  const {
    buildWeekChunks,
    esDiaTodosNueveSeis,
    esChunkCompleto,
  } = window.ENGINE_CALENDAR;

  const {
    sumWeekHours,
    sumInMonthWeekHours,
    targetInMonthWeekHours,
    getCellForDayMeta,
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

  const DUOS_RESTRICCION = [DUO_SANTIAGO_MIGUEL, DUO_JESUS_BRANDON, DUO_BRAYAN_MAURICIO];

  const partnerDuo = (id) => {
    for (const duo of DUOS_RESTRICCION) {
      if (duo.includes(id)) return duo.find(x => x !== id);
    }
    return null;
  };

  const esDuoConRestricciones = (id) =>
    DUOS_RESTRICCION.some(duo => duo.includes(id));

  const dayOkMin = (minDay) => (d) =>
    minDay == null || (d.inMonth && d.day != null && d.day >= minDay);

  /** Solo días editables del mes visible. */
  const esMutable = (d, dayOk) =>
    dayOk(d) && d.inMonth && d.day != null && !d.noLaborable;

  const cellFor = (state, id, d) => getCellForDayMeta(id, d, state);

  // ─── CAP WEEKLY (NO-FIJOS) ────────────────────────────────────────────────────

  /**
   * Baja horas a no-fijos que superen su techo semanal.
   * Orden de días: vie→jue→mié→mar→lun (dow desc).
   * Respeta restricciones de grupo (no 2×am10 ni 2×pm5).
   */
  const capWeeklyTo44 = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = dayOkMin(minDay);

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

  /** Fijos: horario fijo 9/6 lun-vie (~47h). No aplicar techo 44h. */
  const capFijosTo44 = () => {};

  /**
   * Cap post-lift para Jhonny.
   * Baja lun/mar 9/6→9/5; mié 9/6→9/5 solo si no hubo lunes festivo.
   */
  const capJhonnyTo44 = (state, meta, minDay) => {
    const id     = 'jhonny_rodriguez';
    const chunks = buildWeekChunks(meta);
    const dayOk  = dayOkMin(minDay);
    const { lunesFestivoEnSemana } = window.ENGINE_RULES_JOHNNY;

    chunks.forEach((chunk) => {
      let guard = 0;
      while (sumWeekHours(id, chunk, state) > CFG.HORAS_TOPE_SEMANA && guard < 6) {
        guard++;
        let bajado = false;

        for (const dow of [2, 1]) {
          const dm = chunk.find(d => esMutable(d, dayOk) && d.dow === dow);
          if (dm && esNueveSeis(state.cells[id]?.[dm.day])) {
            putCell(state, id, dm.day, '9', '5'); bajado = true; break;
          }
        }
        if (bajado) continue;

        const dw = chunk.find(d => esMutable(d, dayOk) && d.dow === 3);
        if (dw && !lunesFestivoEnSemana(meta, dw) &&
            esNueveSeis(state.cells[id]?.[dw.day])) {
          putCell(state, id, dw.day, '9', '5'); bajado = true;
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
    const dayOk  = dayOkMin(minDay);

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
    const dayOk  = dayOkMin(minDay);

    for (let round = 0; round < 40; round++) {
      let progressed = false;
      EMPLEADOS.forEach(({ id }) => {
        if (IDS_FIJO.has(id) || id === 'jhonny_rodriguez') return;
        chunks.forEach((chunk) => {
          if (!esChunkCompleto(chunk)) return;
          if (sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;
          const d = chunk.find(d => {
            if (!esMutable(d, dayOk)) return false;
            if (lockedCell && lockedCell.id === id && lockedCell.day === d.day) return false;
            if (d.dow < 1 || d.dow > 5) return false;
            return esNueveCinco(cellFor(state, id, d));
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
   * Sube Jhonny a 44h en lun/mar (9/5→9/6) y mié si lunes festivo (9/5→9/6).
   */
  const liftJhonny = (state, meta, monthKey, minDay) => {
    const id     = 'jhonny_rodriguez';
    const chunks = buildWeekChunks(meta);
    const dayOk  = dayOkMin(minDay);
    const { lunesFestivoEnSemana } = window.ENGINE_RULES_JOHNNY;

    const trySubir = (d) => {
      if (!dayOk(d)) return false;
      const c = state.cells[id]?.[d.day];
      if (esNueveCinco(c)) {
        putCell(state, id, d.day, '9', '6');
        return true;
      }
      return false;
    };

    chunks.forEach((chunk) => {
      if (sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;

      for (const dow of [1, 2]) {
        const d = chunk.find(x => esMutable(x, dayOk) && x.dow === dow);
        if (d && trySubir(d) && sumWeekHours(id, chunk, state) >= CFG.HORAS_TOPE_SEMANA) return;
      }

      const dw = chunk.find(d => esMutable(d, dayOk) && d.dow === 3);
      if (dw && lunesFestivoEnSemana(meta, dw)) {
        trySubir(dw);
      }
    });
  };

  // ─── FORCE WITHIN CEILING (ÚLTIMO RECURSO) ───────────────────────────────────

  /**
   * Garantiza que nadie supere su techo usando mutaciones de último recurso.
   * Excluye fijos (horario fijo, sin techo 44h) y Jhonny (lo maneja capJhonnyTo44).
   */
  const forceWithinCeiling = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = dayOkMin(minDay);

    for (let mega = 0; mega < 40; mega++) {
      let progressed = false;

      EMPLEADOS.forEach(({ id }) => {
        if (IDS_FIJO.has(id) || id === 'jhonny_rodriguez' || id === 'cristian_uribe') return;
        chunks.forEach((chunk, ci) => {
          const ceil = techoSemanal(id, chunks, ci, state);
          if (!esChunkCompleto(chunk)) return;
          if (sumWeekHours(id, chunk, state) <= ceil) return;

          const before = sumWeekHours(id, chunk, state);
          const cands  = chunk
            .filter(d => esMutable(d, dayOk) && d.dow >= 1 && d.dow <= 5
                         && !esDiaTodosNueveSeis(d, meta.days))
            .sort((a, b) => b.dow - a.dow);

          const tryLower = (d, fn) => {
            if (sumWeekHours(id, chunk, state) <= ceil) return false;
            if (fn()) { progressed = true; return true; }
            return false;
          };

          // 1.ª pasada: 9/6→9/5 (no empuja horas al compañero)
          for (const d of cands) {
            if (tryLower(d, () => tryBrutal96to95Messenger(state, meta, id, d))) break;
          }

          // 2.ª pasada: intercambio trío, dúos y 9→10
          if (sumWeekHours(id, chunk, state) > ceil) {
            for (const d of cands) {
              if (tryLower(d, () => tryMessengerSwapTenWithPartner(state, meta, id, d))) break;
              if (tryLower(d, () => tryBrutal96to95partnerTen(state, meta, id, d))) break;
              if (tryLower(d, () => tryBrutal96to95partnerNine(state, meta, id, d))) break;
              if (tryLower(d, () => tryBrutal9to10(state, meta, id, d))) break;
            }
          }

          // Sábado como último recurso
          if (sumWeekHours(id, chunk, state) > ceil) {
            const sat = chunk.find(d => d.dow === 6 && esMutable(d, dayOk));
            if (sat && esNueveSeis(cellFor(state, id, sat))) {
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
      .filter(d => esMutable(d, dayOk) && d.dow >= 1 && d.dow <= 5
                   && !esDiaTodosNueveSeis(d, meta.days)
                   && esNueveSeis(cellFor(state, id, d)))
      .sort((a, b) => b.dow - a.dow);

    for (const d of cands) {
      if (tryBrutal96to95Messenger(state, meta, id, d))   return true;
      if (tryBrutal96to95partnerTen(state, meta, id, d))  return true;
      if (tryBrutal96to95partnerNine(state, meta, id, d)) return true;
      if (tryBrutal9to10(state, meta, id, d))             return true;
    }
    return false;
  };

  const tryBajarUnaHoraDuo = (state, meta, id, chunk, dayOk) => {
    if (!esDuoConRestricciones(id)) return tryBajarUnaHora(state, meta, id, chunk, dayOk);

    const pr = partnerDuo(id);
    const cands = chunk
      .filter(d => esMutable(d, dayOk) && d.dow >= 2 && d.dow <= 5
                   && !esDiaTodosNueveSeis(d, meta.days)
                   && esNueveSeis(cellFor(state, id, d)))
      .sort((a, b) => b.dow - a.dow);

    for (const d of cands) {
      if (tryBrutal96to95Messenger(state, meta, id, d))         return true;
      if (tryBrutal9to10(state, meta, id, d))                   return true;
      if (pr && tryBrutal96to95partnerTen(state, meta, id, d))  return true;
      if (pr && tryBrutal96to95partnerNine(state, meta, id, d)) return true;
    }
    return false;
  };

  /** Trío: intercambia am=10 entre quien tiene 9/6 y compañero con 10/6 (±1h c/u). */
  const tryMessengerSwapTenWithPartner = (state, meta, id, d) => {
    if (!d.inMonth || d.day == null) return false;
    if (!IDS_MENSAJEROS.has(id)) return false;
    if (!esNueveSeis(cellFor(state, id, d))) return false;
    const partner = GRUPO_MENSAJEROS.find(
      id2 => id2 !== id && esDiezSeis(cellFor(state, id2, d))
    );
    if (!partner) return false;
    putCell(state, id, d.day, '10', '6');
    putCell(state, partner, d.day, '9', '6');
    enforceTrioOneTenOneFive(state, meta, d.day);
    return true;
  };

  /** Mensajero 9/6 → 9/5 si aún no hay otro con pm=5 ese día. */
  const tryBrutal96to95Messenger = (state, meta, id, d) => {
    if (!IDS_MENSAJEROS.has(id)) return false;
    if (esDiaTodosNueveSeis(d, meta.days)) return false;
    if (!esNueveSeis(cellFor(state, id, d))) return false;
    const otroConCinco = GRUPO_MENSAJEROS.some(
      id2 => id2 !== id && normPm(cellFor(state, id2, d)) === '5'
    );
    if (otroConCinco) return false;
    putCell(state, id, d.day, '9', '5');
    enforceTrioOneTenOneFive(state, meta, d.day);
    return true;
  };

  /** 9/6 → 10/6 si no hay otro con am=10 en el grupo ese día. */
  const tryBrutal9to10 = (state, meta, id, d) => {
    if (!d.inMonth || d.day == null) return false;
    if (!esNueveSeis(cellFor(state, id, d))) return false;
    if (id === 'cristian_uribe' && d.dow === 4) return false;

    if (IDS_MENSAJEROS.has(id)) {
      const otroConDiez = GRUPO_MENSAJEROS.some(
        id2 => id2 !== id && normAm(cellFor(state, id2, d)) === '10'
      );
      if (otroConDiez) return false;
    } else if (esDuoConRestricciones(id)) {
      const pr = partnerDuo(id);
      if (pr && normAm(cellFor(state, pr, d)) === '10') return false;
    }

    putCell(state, id, d.day, '10', '6');
    if (IDS_MENSAJEROS.has(id)) enforceTrioOneTenOneFive(state, meta, d.day);
    return true;
  };

  /** Yo 9/6 y compañero 10/6 → yo 9/5. Solo dúos con restricciones. */
  const tryBrutal96to95partnerTen = (state, meta, id, d) => {
    if (!d.inMonth || d.day == null) return false;
    if (!esDuoConRestricciones(id)) return false;
    const pr = partnerDuo(id);
    if (!pr) return false;
    if (!esNueveSeis(cellFor(state, id, d))) return false;
    if (!esDiezSeis(cellFor(state, pr, d)))  return false;
    putCell(state, id, d.day, '9', '5');
    return true;
  };

  /** Ambos 9/6 → yo 9/5. Solo dúos con restricciones. */
  const tryBrutal96to95partnerNine = (state, meta, id, d) => {
    if (!d.inMonth || d.day == null) return false;
    if (!esDuoConRestricciones(id)) return false;
    const pr = partnerDuo(id);
    if (!pr) return false;
    if (!esNueveSeis(cellFor(state, id, d))) return false;
    if (!esNueveSeis(cellFor(state, pr, d)))  return false;
    putCell(state, id, d.day, '9', '5');
    return true;
  };

  /** Cap Cristian >44h sin violar reglas (jue nunca am=10; mié/vie nunca pm=5). */
  const capCristianTo44 = (state, meta, minDay) => {
    const id     = 'cristian_uribe';
    const chunks = buildWeekChunks(meta);
    const dayOk  = dayOkMin(minDay);

    chunks.forEach((chunk) => {
      if (!esChunkCompleto(chunk)) return;
      let guard = 0;
      while (sumWeekHours(id, chunk, state) > CFG.HORAS_TOPE_SEMANA && guard < 12) {
        guard++;
        const cands = chunk
          .filter(d => esMutable(d, dayOk) && d.dow !== 4 && d.dow !== 3 && d.dow !== 5
                       && esNueveSeis(cellFor(state, id, d)))
          .sort((a, b) => b.dow - a.dow);
        let bajado = false;
        for (const d of cands) {
          if (tryBrutal9to10(state, meta, id, d)) { bajado = true; break; }
        }
        if (!bajado) break;
      }
    });
  };

  /**
   * Pasada final: no-fijos en semana calendario completa = exactamente 44h.
   * Solo muta días del mes visible; respeta días externos (crossMonthCells).
   * Semanas borde: compara horas editables vs targetInMonthWeekHours (44 − Σ externa).
   */
  const finalizeNonFijo44Hours = (state, meta, minDay) => {
    const chunks = buildWeekChunks(meta);
    const dayOk  = dayOkMin(minDay);

    const chunkHasExternal = (chunk) =>
      chunk.some((d) => !d.inMonth && !d.noLaborable);

    const needsLift = (id, chunk) => {
      const full = sumWeekHours(id, chunk, state);
      if (full >= CFG.HORAS_TOPE_SEMANA) return false;
      if (chunkHasExternal(chunk)) {
        return sumInMonthWeekHours(id, chunk, state)
          < targetInMonthWeekHours(id, chunk, state);
      }
      return true;
    };

    const needsCap = (id, chunk) => {
      const full = sumWeekHours(id, chunk, state);
      if (full <= CFG.HORAS_TOPE_SEMANA) return false;
      if (chunkHasExternal(chunk)) {
        return sumInMonthWeekHours(id, chunk, state)
          > targetInMonthWeekHours(id, chunk, state);
      }
      return true;
    };

    for (let mega = 0; mega < 80; mega++) {
      let progressed = false;

      EMPLEADOS.forEach(({ id }) => {
        if (IDS_FIJO.has(id) || id === 'jhonny_rodriguez') return;

        chunks.forEach((chunk) => {
          if (!esChunkCompleto(chunk)) return;
          if (!window.ENGINE_HOURS.esSemanaEvaluable44(chunk, state)) return;

          let guard = 0;
          while (sumWeekHours(id, chunk, state) !== CFG.HORAS_TOPE_SEMANA && guard < 40) {
            guard++;
            const full = sumWeekHours(id, chunk, state);

            if (needsCap(id, chunk)) {
              if (id === 'cristian_uribe') {
                capCristianTo44(state, meta, minDay);
                if (sumWeekHours(id, chunk, state) < full) { progressed = true; continue; }
              }
              if (tryBajarUnaHora(state, meta, id, chunk, dayOk)) {
                progressed = true;
                continue;
              }
              if (IDS_MENSAJEROS.has(id)) {
                const cands = chunk
                  .filter(d => esMutable(d, dayOk) && d.dow >= 1 && d.dow <= 5
                               && esNueveSeis(cellFor(state, id, d)))
                  .sort((a, b) => b.dow - a.dow);
                for (const d of cands) {
                  if (tryBrutal96to95Messenger(state, meta, id, d)) { progressed = true; break; }
                  if (tryMessengerSwapTenWithPartner(state, meta, id, d)) { progressed = true; break; }
                }
                if (progressed) continue;
              }
              break;
            }

            if (needsLift(id, chunk)) {
              const d = chunk.find(d =>
                esMutable(d, dayOk) && d.dow >= 1 && d.dow <= 5
                && esNueveCinco(cellFor(state, id, d))
              );
              if (d) {
                putCell(state, id, d.day, '9', '6');
                progressed = true;
                continue;
              }
              const d10 = chunk.find(d =>
                esMutable(d, dayOk) && d.dow >= 1 && d.dow <= 5
                && esDiezSeis(cellFor(state, id, d))
                && id !== 'cristian_uribe'
              );
              if (d10) {
                putCell(state, id, d10.day, '9', '6');
                progressed = true;
                continue;
              }
              break;
            }

            if (full === CFG.HORAS_TOPE_SEMANA) break;
            break;
          }
        });
      });

      if (!progressed) break;
    }
  };

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  const ENGINE_CAP = {
    capWeeklyTo44,
    capFijosTo44,
    capJhonnyTo44,
    capCristianTo44,
    squeezeGrupoB,
    liftWeeklyTo44,
    liftJhonny,
    forceWithinCeiling,
    finalizeNonFijo44Hours,
  };

  window.ENGINE_CAP = ENGINE_CAP;

})();
