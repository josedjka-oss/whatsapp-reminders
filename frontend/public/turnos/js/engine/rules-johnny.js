/**
 * rules-johnny.js — Jhonny Rodríguez y Cristian Uribe.
 *
 * Jhonny lun–vie:
 *   Lun/Mar 9/6 · Mié 9/5 (9/6 si lunes festivo) · Jue 10/6 · Vie 9/5 · Sáb 9:30/5
 *
 * Cristian:
 *   Jue nunca am=10 · Mié/Vie puede am=10 (pm=6) · Mié/Vie nunca pm=5
 */
(function () {
  'use strict';

  const { CFG } = window.ENGINE_CONSTANTS;
  const { getLunesDeSemana } = window.ENGINE_CALENDAR;
  const { normAm, normPm } = window.ENGINE_HOURS;

  const putCell = window.ENGINE_PUT_CELL.putCell;

  const JHONNY_ID   = 'jhonny_rodriguez';
  const CRISTIAN_ID = 'cristian_uribe';

  /** true si el lunes de la semana de `d` fue festivo. */
  const lunesFestivoEnSemana = (meta, d) => {
    const lun = getLunesDeSemana(d, meta.days);
    return !!(lun && lun.festivo);
  };

  /** @deprecated alias para cap-engine */
  const hayFestivoLunesMartesOMiercolesEnSemana = (meta, d) =>
    lunesFestivoEnSemana(meta, d);

  const enforceJhonny = (state, meta, minDay) => {
    meta.days.forEach((d) => {
      if (minDay != null && d.day < minDay) return;
      if (d.noLaborable) return;

      if (d.esSabado || d.dow === 6) {
        putCell(state, JHONNY_ID, d.day, CFG.AM_SABADO, CFG.PM_SAB);
        return;
      }

      if (d.dow === 1 || d.dow === 2) {
        putCell(state, JHONNY_ID, d.day, CFG.AM_NORMAL, CFG.PM_NORMAL);
        return;
      }
      if (d.dow === 3) {
        const pm = lunesFestivoEnSemana(meta, d) ? CFG.PM_NORMAL : CFG.PM_AJUSTE;
        putCell(state, JHONNY_ID, d.day, CFG.AM_NORMAL, pm);
        return;
      }
      if (d.dow === 4) {
        putCell(state, JHONNY_ID, d.day, CFG.AM_AJUSTE, CFG.PM_NORMAL);
        return;
      }
      if (d.dow === 5) {
        putCell(state, JHONNY_ID, d.day, CFG.AM_NORMAL, CFG.PM_AJUSTE);
      }
    });
  };

  const enforceCristian = (state, meta, minDay) => {
    meta.days.forEach((d) => {
      if (minDay != null && d.day < minDay) return;
      if (d.noLaborable || d.esSabado) return;

      const c  = state.cells[CRISTIAN_ID]?.[d.day];
      let am   = normAm(c) || CFG.AM_NORMAL;
      let pm   = normPm(c) || CFG.PM_NORMAL;

      if (am === CFG.AM_SABADO) {
        am = CFG.AM_NORMAL;
      }

      if (d.dow === 4 && am === CFG.AM_AJUSTE) {
        am = CFG.AM_NORMAL;
      }
      if ((d.dow === 3 || d.dow === 5) && pm === CFG.PM_AJUSTE) {
        pm = CFG.PM_NORMAL;
      }
      if (am === CFG.AM_AJUSTE && pm === CFG.PM_AJUSTE) {
        pm = CFG.PM_NORMAL;
      }

      putCell(state, CRISTIAN_ID, d.day, am, pm);
    });
  };

  const ENGINE_RULES_JOHNNY = {
    enforceJhonny,
    enforceCristian,
    lunesFestivoEnSemana,
    hayFestivoLunesMartesOMiercolesEnSemana,
  };

  window.ENGINE_RULES_JOHNNY = ENGINE_RULES_JOHNNY;

})();
