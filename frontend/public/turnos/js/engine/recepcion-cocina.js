/**
 * recepcion-cocina.js
 * Cocina lun–vie 9:00 · sáb 9:30 — mismo pool y elegibilidad que aseo.
 * Excluye quien hace basura o aseo ese día; rotación equitativa cronológica.
 */
(function () {
  'use strict';

  const { ASEO_RECEPCION_IDS, isEntradaAseoElegible, horaAseoRecepcion } = window.ENGINE_RECEPCION_ASEO;

  const COCINA_RECEPCION_IDS = [...ASEO_RECEPCION_IDS];

  const hashMix = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  /**
   * @param {object} basuraMap day → empId
   * @param {object} aseoMap   day → empId
   * @returns {Object.<number, string>}
   */
  const buildCocinaRecepcionPorDia = (state, meta, monthKey, basuraMap = null, aseoMap = null) => {
    const map    = {};
    const counts = Object.fromEntries(COCINA_RECEPCION_IDS.map((id) => [id, 0]));
    const manual = state?.cocinaOverrides || {};

    const days = meta.days
      .filter((d) => !d.noLaborable && d.dow >= 1 && d.dow <= 6)
      .sort((a, b) => a.day - b.day);

    const monthSeed = hashMix(`${monthKey}|cocina`);

    days.forEach((d) => {
      const basuraEmp = basuraMap?.[d.day] ?? basuraMap?.[String(d.day)] ?? null;
      const aseoEmp   = aseoMap?.[d.day] ?? aseoMap?.[String(d.day)] ?? null;
      const manualEmp = manual[d.day] ?? manual[String(d.day)] ?? null;

      if (manualEmp && COCINA_RECEPCION_IDS.includes(manualEmp)) {
        if (manualEmp !== aseoEmp && (!basuraEmp || manualEmp !== basuraEmp)) {
          map[d.day] = manualEmp;
          counts[manualEmp] += 1;
          return;
        }
      }

      const eligible = COCINA_RECEPCION_IDS.filter((id) => {
        if (basuraEmp && id === basuraEmp) return false;
        if (aseoEmp && id === aseoEmp) return false;
        const am = state.cells[id]?.[d.day]?.am;
        return isEntradaAseoElegible(am, d.esSabado);
      });

      if (!eligible.length) return;

      eligible.sort((a, b) => {
        if (counts[a] !== counts[b]) return counts[a] - counts[b];
        const ia = (COCINA_RECEPCION_IDS.indexOf(a) + monthSeed) % COCINA_RECEPCION_IDS.length;
        const ib = (COCINA_RECEPCION_IDS.indexOf(b) + monthSeed) % COCINA_RECEPCION_IDS.length;
        return ia - ib;
      });

      const pick = eligible[0];
      map[d.day] = pick;
      counts[pick] += 1;
    });

    return map;
  };

  const isCocinaRecepcionDia = (cocinaMap, empId, day) => {
    if (!cocinaMap || !empId || day == null) return false;
    return cocinaMap[day] === empId || cocinaMap[String(day)] === empId;
  };

  const horaCocinaRecepcion = horaAseoRecepcion;

  window.ENGINE_RECEPCION_COCINA = {
    COCINA_RECEPCION_IDS,
    buildCocinaRecepcionPorDia,
    isCocinaRecepcionDia,
    horaCocinaRecepcion,
  };

})();
