/**
 * calendar.js
 * Calendario mensual: días, festivos, semanas calendario lun–sáb (domingo = cierre de semana).
 */
(function () {
  'use strict';

  const { CFG, FESTIVOS_CO } = window.ENGINE_CONSTANTS;

  const DIAS_SEMANA       = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const DIAS_SEMANA_LARGO = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];

  const pad2  = (n) => String(n).padStart(2, '0');
  const toYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  const getFestivoSet = (year) => new Set(FESTIVOS_CO[year] || []);

  const esDomingo = (d) => d.getDay() === 0;

  const esNoLaborable = (d) => {
    if (esDomingo(d)) return true;
    return getFestivoSet(d.getFullYear()).has(toYmd(d));
  };

  const getMonthMeta = (monthKey) => {
    const [y, m] = monthKey.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const festivoSet = getFestivoSet(y);
    const days = [];

    for (let day = 1; day <= lastDay; day++) {
      const dt  = new Date(y, m - 1, day);
      const ymd = toYmd(dt);
      const dow = dt.getDay();
      const esFestivo = !esDomingo(dt) && festivoSet.has(ymd);
      days.push({
        day,
        date:        dt,
        ymd,
        dow,
        dowLabel:    DIAS_SEMANA[dow],
        dowLong:     DIAS_SEMANA_LARGO[dow],
        noLaborable: esDomingo(dt) || esFestivo,
        festivo:     esFestivo,
        esSabado:    dow === 6,
        inMonth:     true,
      });
    }

    return { year: y, month: m, lastDay, days };
  };

  /** Meta de un Date (puede estar fuera del mes visible). */
  const dayMetaFromDate = (dt, monthMeta) => {
    const ymd = toYmd(dt);
    const dow = dt.getDay();
    const inMonth = dt.getFullYear() === monthMeta.year && dt.getMonth() + 1 === monthMeta.month;
    const esFestivo = !esDomingo(dt) && getFestivoSet(dt.getFullYear()).has(ymd);
    return {
      day:         inMonth ? dt.getDate() : null,
      date:        dt,
      ymd,
      dow,
      dowLabel:    DIAS_SEMANA[dow],
      dowLong:     DIAS_SEMANA_LARGO[dow],
      noLaborable: esDomingo(dt) || esFestivo,
      festivo:     esFestivo,
      esSabado:    dow === 6,
      inMonth,
    };
  };

  /**
   * Semanas calendario lun–sáb que tocan el mes.
   * Si el mes empieza miércoles, la semana incluye lun/mar del mes anterior (inMonth=false).
   * El domingo cierra la semana pero no se suma en horas.
   */
  const buildCalendarWeeks = (meta) => {
    if (!meta?.days?.length) return [];

    const first = meta.days[0].date;
    const last  = meta.days[meta.days.length - 1].date;

    const monday = new Date(first);
    const fdow   = monday.getDay();
    monday.setDate(monday.getDate() + (fdow === 0 ? -6 : 1 - fdow));

    const lastSat = new Date(last);
    const ldow    = lastSat.getDay();
    lastSat.setDate(lastSat.getDate() + (ldow === 6 ? 0 : 6 - ldow));

    const weeks = [];
    const cur   = new Date(monday);
    while (cur <= lastSat) {
      const week = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(cur);
        d.setDate(cur.getDate() + i);
        week.push(dayMetaFromDate(d, meta));
      }
      weeks.push(week);
      cur.setDate(cur.getDate() + 7);
    }
    return weeks;
  };

  /** Alias histórico — ahora devuelve semanas calendario completas lun–sáb. */
  const buildWeekChunks = buildCalendarWeeks;

  /** Semana calendario completa: lun–sáb (6 días laborables). */
  const esChunkCompleto = (chunk) =>
    Array.isArray(chunk) &&
    chunk.length === 6 &&
    chunk[0].dow === 1 &&
    chunk[chunk.length - 1].dow === 6;

  /** Días del chunk editables en el mes visible. */
  const chunkDiasEnMes = (chunk) =>
    chunk.filter((d) => d.inMonth && d.day != null);

  const getLunesDeSemana = (d, allDays) => {
    const offset = d.dow === 1 ? 0 : d.dow === 0 ? -6 : -(d.dow - 1);
    const targetDay = d.day + offset;
    return allDays.find(x => x.day === targetDay) || null;
  };

  const esLunesLaborable = (d) => d.dow === 1 && !d.noLaborable;

  const esMartesPostFestivo = (d, allDays) => {
    if (d.dow !== 2) return false;
    if (d.date) {
      const lunDt = new Date(d.date);
      lunDt.setDate(lunDt.getDate() - 1);
      if (lunDt.getDay() !== 1) return false;
      const ymd = toYmd(lunDt);
      return getFestivoSet(lunDt.getFullYear()).has(ymd);
    }
    const lun = getLunesDeSemana(d, allDays);
    return !!(lun && lun.festivo);
  };

  const chunkTieneLunesFestivo = (chunk) => {
    const lun = chunk.find(d => d.dow === 1);
    return !!(lun && lun.festivo);
  };

  const countSabadosLaborables = (meta) =>
    meta.days.filter(d => d.dow === 6 && !d.noLaborable).length;

  /** Semana calendario que termina en el sábado visible del mes. */
  const findChunkEndingAtSaturday = (meta, satDay, chunks) => {
    const weeks = chunks || buildCalendarWeeks(meta);
    return weeks.find(w => w[5]?.inMonth && w[5].day === satDay.day)
      || weeks.find(w => w.some(x => x.inMonth && x.day === satDay.day && x.dow === 6))
      || [];
  };

  const esDiaTodosNueveSeis = (d, allDays) => {
    if (d.noLaborable) return false;
    if (esLunesLaborable(d)) return true;
    return esMartesPostFestivo(d, allDays);
  };

  /** Claves YYYY-MM de meses adyacentes necesarios para Σ semanal. */
  const adjacentMonthKeys = (monthKey) => {
    const [y, m] = monthKey.split('-').map(Number);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad2(m - 1)}`;
    const next = m === 12 ? `${y + 1}-01` : `${y}-${pad2(m + 1)}`;
    return { prev, next };
  };

  const ENGINE_CALENDAR = {
    getMonthMeta,
    dayMetaFromDate,
    buildCalendarWeeks,
    buildWeekChunks,
    esChunkCompleto,
    chunkDiasEnMes,
    getLunesDeSemana,
    esLunesLaborable,
    esMartesPostFestivo,
    chunkTieneLunesFestivo,
    countSabadosLaborables,
    findChunkEndingAtSaturday,
    esDiaTodosNueveSeis,
    adjacentMonthKeys,
    pad2,
    toYmd,
  };

  window.ENGINE_CALENDAR = ENGINE_CALENDAR;

})();
