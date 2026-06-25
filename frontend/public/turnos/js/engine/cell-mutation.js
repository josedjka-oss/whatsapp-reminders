/**
 * cell-mutation.js — Único punto de mutación de celdas am/pm.
 * Respeta state.manualAmPmLocks para no sobrescribir ediciones manuales.
 */
(function () {
  'use strict';

  const getFieldLocks = (state, empId, dayNum) =>
    state.manualAmPmLocks?.[empId]?.[dayNum]
    ?? state.manualAmPmLocks?.[empId]?.[String(dayNum)]
    ?? null;

  const putCell = (state, empId, dayNum, am, pm) => {
    if (!state.cells[empId]) state.cells[empId] = {};
    const cur = state.cells[empId][dayNum] || { am: '', pm: '' };
    const locks = getFieldLocks(state, empId, dayNum);
    const lockAm = locks?.am === true;
    const lockPm = locks?.pm === true;
    if (lockAm && lockPm) return;
    state.cells[empId][dayNum] = {
      am: lockAm ? String(cur.am ?? '') : String(am),
      pm: lockPm ? String(cur.pm ?? '') : String(pm),
    };
  };

  /**
   * Marca como bloqueadas todas las celdas am/pm con valor guardado.
   * Así Firebase es la fuente de verdad y el motor no las regenera.
   */
  const buildLocksFromCells = (cells, meta, empleados, existingLocks = {}) => {
    const locks = JSON.parse(JSON.stringify(existingLocks || {}));
    if (!cells || !meta || !empleados) return locks;
    empleados.forEach(({ id }) => {
      meta.days.forEach(({ day, noLaborable }) => {
        if (noLaborable) return;
        const c = cells[id]?.[day] ?? cells[id]?.[String(day)];
        if (!c || typeof c !== 'object') return;
        const am = String(c.am ?? '').trim();
        const pm = String(c.pm ?? '').trim();
        if (!am && !pm) return;
        if (!locks[id]) locks[id] = {};
        if (!locks[id][day]) locks[id][day] = {};
        if (am) locks[id][day].am = true;
        if (pm) locks[id][day].pm = true;
      });
    });
    return locks;
  };

  window.ENGINE_PUT_CELL = { putCell, getFieldLocks, buildLocksFromCells };
})();
