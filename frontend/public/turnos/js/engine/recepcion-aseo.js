/**

 * recepcion-aseo.js

 * Asignación mensual de aseo de recepción (lun–vie 9:00, sáb 9:30).

 * Solo quien entra a las 9 (entre semana) o 9:30 (sábado) ese día; rotación equitativa.

 */

(function () {

  'use strict';



  const { CFG } = window.ENGINE_CONSTANTS;

  const { normAm } = window.ENGINE_HOURS;



  /** Participan en el turno de aseo de recepción. */

  const ASEO_RECEPCION_IDS = [

    'harold_paipa',

    'diego_lozano',

    'dilan_toro',

    'santiago_guarnizo',

    'miguel_fonseca',

    'cristian_uribe',

    'jhon_lozano',

    'jesus_perez',

  ];



  const isEntradaAseoElegible = (amVal, esSabado) => {

    const am = normAm({ am: amVal });

    return esSabado ? am === CFG.AM_SABADO : am === '9';

  };



  const hashMix = (s) => {

    let h = 2166136261;

    for (let i = 0; i < s.length; i++) {

      h ^= s.charCodeAt(i);

      h = Math.imul(h, 16777619);

    }

    return h >>> 0;

  };



  /**

   * Asigna un responsable por día laborable (lun–sáb).

   * @returns {Object.<number, string>} dayNum → empId

   */

  const buildAseoRecepcionPorDia = (state, meta, monthKey, basuraMap = null) => {

    const map    = {};

    const counts = Object.fromEntries(ASEO_RECEPCION_IDS.map((id) => [id, 0]));



    const days = meta.days

      .filter((d) => !d.noLaborable && d.dow >= 1 && d.dow <= 6)

      .sort((a, b) => hashMix(`${monthKey}|d|${a.day}`) - hashMix(`${monthKey}|d|${b.day}`));



    const monthSeed = hashMix(monthKey || '');



    days.forEach((d) => {
      const basuraEmp = basuraMap?.[d.day] ?? basuraMap?.[String(d.day)] ?? null;

      const eligible = ASEO_RECEPCION_IDS.filter((id) => {
        if (basuraEmp && id === basuraEmp) return false;
        const am = state.cells[id]?.[d.day]?.am;
        return isEntradaAseoElegible(am, d.esSabado);
      });

      if (!eligible.length) return;



      eligible.sort((a, b) => {

        if (counts[a] !== counts[b]) return counts[a] - counts[b];

        const ia = (ASEO_RECEPCION_IDS.indexOf(a) + monthSeed) % ASEO_RECEPCION_IDS.length;

        const ib = (ASEO_RECEPCION_IDS.indexOf(b) + monthSeed) % ASEO_RECEPCION_IDS.length;

        return ia - ib;

      });



      const pick = eligible[0];

      map[d.day] = pick;

      counts[pick] += 1;

    });



    return map;

  };



  const isAseoRecepcionDia = (aseoMap, empId, day) => {

    if (!aseoMap || !empId || day == null) return false;

    return aseoMap[day] === empId || aseoMap[String(day)] === empId;

  };



  const horaAseoRecepcion = (esSabado) => (esSabado ? '9:30' : '9:00');



  window.ENGINE_RECEPCION_ASEO = {

    ASEO_RECEPCION_IDS,

    buildAseoRecepcionPorDia,

    isAseoRecepcionDia,

    isEntradaAseoElegible,

    horaAseoRecepcion,

  };



})();

