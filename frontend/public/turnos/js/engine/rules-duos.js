/**
 * rules-duos.js
 * Dúos Santiago/Miguel, Jesús/Brandon y Brayan Yate/Mauricio:
 *   - Lun–vie: por día exactamente 1 am=10 y 1 pm=5 en la pareja.
 *   - Semanas alternas: quien entró a las 10 una semana, sale a las 5 la siguiente (mismo día).
 *   - Sábado: ambos 9:30/5.
 */
(function () {
  'use strict';

  const {
    DUO_SANTIAGO_MIGUEL,
    DUO_JESUS_BRANDON,
    DUO_BRAYAN_MAURICIO,
    CFG,
  } = window.ENGINE_CONSTANTS;
  const { buildWeekChunks, esDiaTodosNueveSeis } = window.ENGINE_CALENDAR;

  const DUOS = [DUO_SANTIAGO_MIGUEL, DUO_JESUS_BRANDON, DUO_BRAYAN_MAURICIO];

  /** Rol lun–vie: T=10/6, F=9/5, N=9/6. Fila 0 / fila 1 se intercambian cada semana impar. */
  const PATRON_COLS = [
    ['T', 'N', 'T', 'N', 'T'],
    ['F', 'T', 'F', 'T', 'F'],
  ];

  const putCell = window.ENGINE_PUT_CELL.putCell;

  const cellFromCode = (code) => {
    if (code === 'T') return { am: '10', pm: '6' };
    if (code === 'F') return { am: '9', pm: '5' };
    return { am: '9', pm: '6' };
  };

  /**
   * Aplica patrón de una semana (chunk lun–sáb) a un dúo.
   * @param {number} weekIdx  índice de semana en el mes (0 = primera semana del chunk)
   */
  const applyPatronDuoWeek = (state, chunk, weekIdx, duoIds, metaDays, fromDay = 1) => {
    const [id0, id1] = duoIds;
    const swapRoles  = weekIdx % 2 === 1;

    chunk.forEach((d) => {
      if (d.day < fromDay || d.noLaborable || d.dow < 1 || d.dow > 5) return;
      if (esDiaTodosNueveSeis(d, metaDays)) return;

      const col = d.dow - 1;
      let c0    = PATRON_COLS[0][col];
      let c1    = PATRON_COLS[1][col];
      if (swapRoles) {
        const t = c0;
        c0 = c1;
        c1 = t;
      }
      const p0 = cellFromCode(c0);
      const p1 = cellFromCode(c1);
      putCell(state, id0, d.day, p0.am, p0.pm);
      putCell(state, id1, d.day, p1.am, p1.pm);
    });

    chunk.forEach((d) => {
      if (d.day < fromDay || d.noLaborable || !d.esSabado) return;
      putCell(state, id0, d.day, CFG.AM_SABADO, '5');
      putCell(state, id1, d.day, CFG.AM_SABADO, '5');
    });
  };

  /**
   * Aplica patrón alternado a ambos dúos en todo el mes (o desde `fromDay`).
   * @param {object} state
   * @param {object} meta
   * @param {number} [fromDay=1]
   */
  const applyPatronDuosMes = (state, meta, fromDay = 1) => {
    const chunks = buildWeekChunks(meta);
    chunks.forEach((chunk, weekIdx) => {
      DUOS.forEach((duo) => applyPatronDuoWeek(state, chunk, weekIdx, duo, meta.days, fromDay));
    });
  };

  const ENGINE_RULES_DUOS = {
    applyPatronDuosMes,
    applyPatronDuoWeek,
    PATRON_COLS,
  };

  window.ENGINE_RULES_DUOS = ENGINE_RULES_DUOS;

})();
