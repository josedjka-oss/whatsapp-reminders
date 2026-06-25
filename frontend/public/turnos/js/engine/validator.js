/**
 * validator.js
 * Valida el estado generado y reporta violaciones de reglas.
 * No muta el estado — solo lectura.
 *
 * Uso en consola del navegador:
 *   ENGINE_VALIDATOR.printValidation(state, '2026-06');
 */
(function () {
  'use strict';

  const {
    CFG, EMPLEADOS,
    GRUPO_MENSAJEROS, GRUPO_FIJO,
    DUO_SANTIAGO_MIGUEL, DUO_BRAYAN_MAURICIO,
    IDS_FIJO,
    usaEntradaSabadoNueve,
  } = window.ENGINE_CONSTANTS;

  const { getMonthMeta, buildWeekChunks } = window.ENGINE_CALENDAR;
  const { sumWeekHours, normAm, normPm }  = window.ENGINE_HOURS;

  /**
   * Ejecuta todas las validaciones y retorna array de errores.
   * @param {object} state
   * @param {string} monthKey
   * @returns {{ rule, empId, day, chunk, detail }[]}
   */
  const validate = (state, monthKey) => {
    const errors = [];
    const meta   = getMonthMeta(monthKey);
    const chunks = buildWeekChunks(meta);

    const push = (rule, empId, detail, day, chunk) =>
      errors.push({ rule, empId, day, chunk, detail });

    // ── R1: no-fijos exactamente 44h por semana ───────────────────────────────
    EMPLEADOS.forEach(({ id }) => {
      if (IDS_FIJO.has(id)) return;
      chunks.forEach((chunk, ci) => {
        const s = sumWeekHours(id, chunk, state);
        if (s !== CFG.HORAS_TOPE_SEMANA) {
          push('HORAS_SEMANA', id,
            `Semana ${ci + 1}: ${s}h (esperado ${CFG.HORAS_TOPE_SEMANA}h)`,
            chunk[0]?.day, ci);
        }
      });
    });

    // ── R2: trío — máx 1 am=10 y máx 1 pm=5 por día entre semana ─────────────
    meta.days.forEach((d) => {
      if (d.noLaborable || d.dow === 6) return;
      const conDiez  = GRUPO_MENSAJEROS.filter(id => normAm(state.cells[id]?.[d.day]) === '10');
      const conCinco = GRUPO_MENSAJEROS.filter(id => normPm(state.cells[id]?.[d.day]) === '5');
      if (conDiez.length > 1)
        push('TRIO_MAX_UNO_DIEZ', conDiez.join(', '),
          `Día ${d.day} (${d.dowLabel}): ${conDiez.length} mensajeros con am=10`, d.day);
      if (conCinco.length > 1)
        push('TRIO_MAX_UNO_CINCO', conCinco.join(', '),
          `Día ${d.day} (${d.dowLabel}): ${conCinco.length} mensajeros con pm=5`, d.day);
    });

    // ── R3: sábado laborable — 9:30/5 (Jonathan y David → 9/5) ───────────────
    meta.days.forEach((d) => {
      if (d.noLaborable || d.dow !== 6) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        const esperadoAm = usaEntradaSabadoNueve(id) ? '9' : CFG.AM_SABADO;
        if (normAm(c) !== esperadoAm || normPm(c) !== '5')
          push('SAB_930_5', id,
            `Sáb día ${d.day}: am=${normAm(c)}, pm=${normPm(c)} (esperado ${usaEntradaSabadoNueve(id) ? '9/5' : '9:30/5'})`, d.day);
      });
    });

    // ── R4: nadie con 10+5 entre semana (lun-vie) ─────────────────────────────
    meta.days.forEach((d) => {
      if (d.noLaborable || d.esSabado) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        if (normAm(c) === '10' && normPm(c) === '5')
          push('DIEZ_CINCO_PROHIBIDO', id,
            `Día ${d.day} (${d.dowLabel}): am=10 + pm=5 (combinación prohibida)`, d.day);
      });
    });

    // ── R5: fijos — nunca am=10 ni pm=5 lun-vie ───────────────────────────────
    meta.days.forEach((d) => {
      if (d.noLaborable || d.esSabado) return;
      GRUPO_FIJO.forEach(id => {
        const c = state.cells[id]?.[d.day];
        if (normAm(c) === '10')
          push('FIJO_NO_DIEZ', id, `Día ${d.day}: fijo con am=10`, d.day);
        if (normPm(c) === '5')
          push('FIJO_NO_CINCO', id, `Día ${d.day}: fijo con pm=5`, d.day);
      });
    });

    // ── R6: Johnny — nunca am=10 ──────────────────────────────────────────────
    meta.days.forEach((d) => {
      if (d.noLaborable) return;
      const c = state.cells['jhonny_rodriguez']?.[d.day];
      if (normAm(c) === '10')
        push('JOHNNY_NO_DIEZ', 'jhonny_rodriguez',
          `Día ${d.day}: Jhonny con am=10 (prohibido)`, d.day);
    });

    // ── R7: Johnny — pm=5 en jue y vie laborables ────────────────────────────
    meta.days.forEach((d) => {
      if (d.noLaborable) return;
      if (d.dow !== 4 && d.dow !== 5) return; // solo jue(4) y vie(5)
      const c = state.cells['jhonny_rodriguez']?.[d.day];
      if (normPm(c) !== '5')
        push('JOHNNY_JUE_VIE_PM5', 'jhonny_rodriguez',
          `Día ${d.day} (${d.dowLabel}): Jhonny pm=${normPm(c)} (esperado 5)`, d.day);
    });

    // ── R8: dúos Santiago/Miguel y Brayan Yate/Mauricio — máx 1×am10 y 1×pm5 ─
    for (const duo of [DUO_SANTIAGO_MIGUEL, DUO_BRAYAN_MAURICIO]) {
      meta.days.forEach((d) => {
        if (d.noLaborable || d.esSabado) return;
        const conDiez  = duo.filter(id => normAm(state.cells[id]?.[d.day]) === '10');
        const conCinco = duo.filter(id => normPm(state.cells[id]?.[d.day]) === '5');
        if (conDiez.length > 1)
          push('DUO_MAX_UNO_DIEZ', duo.join(', '),
            `Día ${d.day}: ambos con am=10`, d.day);
        if (conCinco.length > 1)
          push('DUO_MAX_UNO_CINCO', duo.join(', '),
            `Día ${d.day}: ambos con pm=5`, d.day);
      });
    }

    // ── R9: sábado laborable — nadie con pm=6 ────────────────────────────────
    meta.days.forEach((d) => {
      if (d.noLaborable || !d.esSabado) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        if (normPm(c) === '6')
          push('SAB_PM6_PROHIBIDO', id, `Sáb día ${d.day}: pm=6 (debe ser 5)`, d.day);
      });
    });

    // ── R10: David Sánchez — mismas restricciones que Cristian (no fijo) ──────
    // (sus horas ya se validan en R1 al ser no-fijo)
    // Verificación adicional: nunca am=10 en sábado
    meta.days.forEach((d) => {
      if (d.noLaborable || !d.esSabado) return;
      const c = state.cells['david_sanchez']?.[d.day];
      if (normAm(c) === '10')
        push('DAVID_SAB_NO_DIEZ', 'david_sanchez',
          `Sáb día ${d.day}: David con am=10 en sábado`, d.day);
    });

    return errors;
  };

  /**
   * Imprime reporte en consola (para desarrollo/debug).
   */
  const printValidation = (state, monthKey) => {
    const errors = validate(state, monthKey);
    if (errors.length === 0) {
      console.log(`✅ ${monthKey}: sin errores de validación.`);
    } else {
      console.group(`❌ ${monthKey}: ${errors.length} error(es)`);
      errors.forEach(e => console.warn(`[${e.rule}] ${e.empId} — ${e.detail}`));
      console.groupEnd();
    }
    return errors;
  };

  const ENGINE_VALIDATOR = { validate, printValidation };

  window.ENGINE_VALIDATOR = ENGINE_VALIDATOR;

})();
