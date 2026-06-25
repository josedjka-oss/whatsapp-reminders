/**
 * validator.js — Valida el estado generado (solo lectura).
 *
 * Uso: ENGINE_VALIDATOR.printValidation(state, '2026-06');
 */
(function () {
  'use strict';

  const {
    CFG, EMPLEADOS,
    GRUPO_MENSAJEROS, GRUPO_FIJO,
    DUO_SANTIAGO_MIGUEL, DUO_JESUS_BRANDON, DUO_BRAYAN_MAURICIO,
    DUO_JHONNY_CRISTIAN,
    IDS_FIJO,
    usaEntradaSabadoNueve,
  } = window.ENGINE_CONSTANTS;

  const {
    getMonthMeta,
    buildWeekChunks,
    esLunesLaborable,
    esMartesPostFestivo,
  } = window.ENGINE_CALENDAR;
  const { sumWeekHours, normAm, normPm } = window.ENGINE_HOURS;
  const { lunesFestivoEnSemana } = window.ENGINE_RULES_JOHNNY;

  const validate = (state, monthKey) => {
    const errors = [];
    const meta   = getMonthMeta(monthKey);
    const chunks = buildWeekChunks(meta);

    const push = (rule, empId, detail, day, chunk) =>
      errors.push({ rule, empId, day, chunk, detail });

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

    meta.days.forEach((d) => {
      if (d.noLaborable || d.dow === 6) return;
      const conDiez  = GRUPO_MENSAJEROS.filter(id => normAm(state.cells[id]?.[d.day]) === '10');
      const conCinco = GRUPO_MENSAJEROS.filter(id => normPm(state.cells[id]?.[d.day]) === '5');
      if (conDiez.length > 1)
        push('TRIO_MAX_UNO_DIEZ', conDiez.join(', '),
          `Día ${d.day}: ${conDiez.length} mensajeros con am=10`, d.day);
      if (conCinco.length > 1)
        push('TRIO_MAX_UNO_CINCO', conCinco.join(', '),
          `Día ${d.day}: ${conCinco.length} mensajeros con pm=5`, d.day);

      if (esLunesLaborable(d) || esMartesPostFestivo(d, meta.days)) {
        if (conDiez.length === 0)
          push('LUN_MAR_SIN_DIEZ', 'mensajeros',
            `Día ${d.day}: falta 1 mensajero con am=10`, d.day);
        if (conCinco.length > 0)
          push('LUN_MAR_PM5', conCinco.join(', '),
            `Día ${d.day}: mensajero(s) con pm=5 (prohibido)`, d.day);
      }
    });

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

    meta.days.forEach((d) => {
      if (d.noLaborable || d.esSabado) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        if (normAm(c) === '10' && normPm(c) === '5')
          push('DIEZ_CINCO_PROHIBIDO', id,
            `Día ${d.day}: am=10 + pm=5`, d.day);
      });
    });

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

    meta.days.forEach((d) => {
      if (d.noLaborable || d.esSabado) return;
      const c = state.cells['jhonny_rodriguez']?.[d.day];
      if (d.dow === 4 && normAm(c) !== '10')
        push('JHONNY_JUE_DIEZ', 'jhonny_rodriguez',
          `Día ${d.day}: Jhonny am=${normAm(c)} (esperado 10)`, d.day);
      if (d.dow !== 4 && normAm(c) === '10')
        push('JHONNY_SOLO_JUE_DIEZ', 'jhonny_rodriguez',
          `Día ${d.day}: Jhonny am=10 fuera de jueves`, d.day);
      if (d.dow === 5 && normPm(c) !== '5')
        push('JHONNY_VIE_PM5', 'jhonny_rodriguez',
          `Día ${d.day}: Jhonny pm=${normPm(c)} (esperado 5)`, d.day);
      if (d.dow === 3) {
        const esperado = lunesFestivoEnSemana(meta, d) ? '6' : '5';
        if (normPm(c) !== esperado)
          push('JHONNY_MIE_PM', 'jhonny_rodriguez',
            `Día ${d.day}: Jhonny pm=${normPm(c)} (esperado ${esperado})`, d.day);
      }
    });

    meta.days.forEach((d) => {
      if (d.noLaborable || d.esSabado) return;
      const c = state.cells['cristian_uribe']?.[d.day];
      if (d.dow === 4 && normAm(c) === '10')
        push('CRISTIAN_JUE_NO_DIEZ', 'cristian_uribe',
          `Día ${d.day}: Cristian am=10 (prohibido jueves)`, d.day);
      if ((d.dow === 3 || d.dow === 5) && normPm(c) === '5')
        push('CRISTIAN_MIE_VIE_NO_PM5', 'cristian_uribe',
          `Día ${d.day}: Cristian pm=5 (prohibido mié/vie)`, d.day);
    });

    for (const duo of [DUO_SANTIAGO_MIGUEL, DUO_JESUS_BRANDON, DUO_BRAYAN_MAURICIO]) {
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

    meta.days.forEach((d) => {
      if (d.noLaborable || !d.esSabado) return;
      EMPLEADOS.forEach(({ id }) => {
        const c = state.cells[id]?.[d.day];
        if (normPm(c) === '6')
          push('SAB_PM6_PROHIBIDO', id, `Sáb día ${d.day}: pm=6`, d.day);
        if (normAm(c) === '10')
          push('SAB_NO_DIEZ', id, `Sáb día ${d.day}: am=10`, d.day);
      });
    });

    return errors;
  };

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

  window.ENGINE_VALIDATOR = { validate, printValidation };

})();
