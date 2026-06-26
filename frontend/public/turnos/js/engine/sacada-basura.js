/**
 * sacada-basura.js
 * Asignación mensual de sacada de basura (lun, mié, vie 18:00).
 * Solo quien NO sale a las 5 ese día; no aplica en festivos (día no laborable).
 */
(function () {
  'use strict';

  const { normPm } = window.ENGINE_HOURS;

  /** Lun=1, Mié=3, Vie=5 */
  const BASURA_DOWS = [1, 3, 5];

  const BASURA_SACADA_IDS = [
    'harold_paipa',
    'diego_lozano',
    'dilan_toro',
    'santiago_guarnizo',
    'cristian_uribe',
    'jhon_lozano',
    'jesus_perez',
    'brayan_ramirez',
    'brandon',
  ];

  const puedeSacarBasura = (pmVal) => normPm({ pm: pmVal }) !== '5';

  const hashMix = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const esDiaBasura = (d) => !d.noLaborable && BASURA_DOWS.includes(d.dow);

  /**
   * @returns {Object.<number, string>} dayNum → empId
   */
  const buildBasuraPorDia = (state, meta, monthKey) => {
    const map       = {};
    const counts    = Object.fromEntries(BASURA_SACADA_IDS.map((id) => [id, 0]));
    const manual    = state?.basuraOverrides || {};
    let lastPick    = null;

    const days = meta.days
      .filter(esDiaBasura)
      .sort((a, b) => a.day - b.day);

    const monthSeed = hashMix(`${monthKey}|basura`);

    days.forEach((d) => {
      const manualEmp = manual[d.day] ?? manual[String(d.day)] ?? null;

      if (manualEmp && BASURA_SACADA_IDS.includes(manualEmp)) {
        map[d.day] = manualEmp;
        counts[manualEmp] += 1;
        lastPick = manualEmp;
        return;
      }

      let eligible = BASURA_SACADA_IDS.filter((id) => {
        const pm = state.cells[id]?.[d.day]?.pm;
        return puedeSacarBasura(pm);
      });
      if (!eligible.length) return;

      if (lastPick && eligible.length > 1) {
        eligible = eligible.filter((id) => id !== lastPick);
      }

      eligible.sort((a, b) => {
        if (counts[a] !== counts[b]) return counts[a] - counts[b];
        const ia = (BASURA_SACADA_IDS.indexOf(a) + monthSeed) % BASURA_SACADA_IDS.length;
        const ib = (BASURA_SACADA_IDS.indexOf(b) + monthSeed) % BASURA_SACADA_IDS.length;
        return ia - ib;
      });

      const pick = eligible[0];
      map[d.day] = pick;
      counts[pick] += 1;
      lastPick = pick;
    });

    return map;
  };

  const isBasuraSacadaDia = (basuraMap, empId, day) => {
    if (!basuraMap || !empId || day == null) return false;
    return basuraMap[day] === empId || basuraMap[String(day)] === empId;
  };

  window.ENGINE_SACADA_BASURA = {
    BASURA_DOWS,
    BASURA_SACADA_IDS,
    buildBasuraPorDia,
    isBasuraSacadaDia,
    esDiaBasura,
  };

})();
