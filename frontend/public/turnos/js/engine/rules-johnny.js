/**
 * rules-johnny.js
 * Johnny Rodriguez: reglas especiales de salida pm5.
 *   - Nunca entra a las 10.
 *   - Semana normal: sale mié, jue, vie a las 5 (pm=5).
 *   - Semana con lunes festivo: sale jue y vie a las 5.
 *   - Miércoles: pm=5 salvo si hay festivo lun-mié en esa semana (entonces pm=6 para recuperar h).
 */
(function () {
  'use strict';

  const { CFG } = window.ENGINE_CONSTANTS;

  const putCell = window.ENGINE_PUT_CELL.putCell;

  /**
   * ¿Hay algún festivo entre el lunes y el miércoles de la semana de `d`?
   */
  const hayFestivoLunesMartesOMiercolesEnSemana = (meta, d) => {
    if (d.dow < 1) return false;
    const lunesDelDia = d.day - (d.dow - 1);
    for (let o = 0; o <= 2; o++) {
      const dm = meta.days.find(x => x.day === lunesDelDia + o);
      if (dm && dm.festivo) return true;
    }
    return false;
  };

  /**
   * Aplica las reglas de salida pm5 de Jhonny para todo el mes (o desde minDay).
   * @param {object} state
   * @param {object} meta
   * @param {number} [minDay]
   */
  const enforceJhonny = (state, meta, minDay) => {
    const id = 'jhonny_rodriguez';
    meta.days.forEach((d) => {
      if (minDay != null && d.day < minDay) return;
      if (d.noLaborable) return;
      if (d.dow < 3 || d.dow > 5) return; // solo mié(3), jue(4), vie(5)

      const c  = state.cells[id]?.[d.day];
      let am = String(c?.am ?? '').trim();
      // Johnny nunca entra a las 10
      if (am === '10' || am === '010') am = '9';

      const conFestivo = hayFestivoLunesMartesOMiercolesEnSemana(meta, d);

      if (d.dow === 4 || d.dow === 5) {
        // Jue y vie: siempre pm=5
        putCell(state, id, d.day, am || '9', '5');
        return;
      }
      if (d.dow === 3) {
        // Miércoles: pm=6 si hay festivo lun-mié (para recuperar horas), sino pm=5
        putCell(state, id, d.day, am || '9', conFestivo ? '6' : '5');
      }
    });
  };

  const ENGINE_RULES_JOHNNY = {
    enforceJhonny,
    hayFestivoLunesMartesOMiercolesEnSemana,
  };

  window.ENGINE_RULES_JOHNNY = ENGINE_RULES_JOHNNY;

})();
