/**
 * calendar.js
 * Construcción del calendario mensual: días, festivos, chunks semanales lun–sáb.
 * Sin efectos secundarios. Puras funciones.
 */
(function () {
  'use strict';

  const { CFG, FESTIVOS_CO } = window.ENGINE_CONSTANTS;

  const DIAS_SEMANA       = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const DIAS_SEMANA_LARGO = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];

  const pad2  = (n) => String(n).padStart(2, '0');
  const toYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  /**
   * Retorna Set<string> de fechas festivas (YYYY-MM-DD) para el año dado.
   * @param {number} year
   * @returns {Set<string>}
   */
  const getFestivoSet = (year) => new Set(FESTIVOS_CO[year] || []);

  /**
   * true si la fecha es domingo (getDay() === 0).
   * @param {Date} d
   */
  const esDomingo = (d) => d.getDay() === 0;

  /**
   * true si la fecha es no laborable (domingo o festivo).
   * @param {Date} d
   */
  const esNoLaborable = (d) => {
    if (esDomingo(d)) return true;
    return getFestivoSet(d.getFullYear()).has(toYmd(d));
  };

  /**
   * Construye el calendario completo del mes.
   * @param {string} monthKey - formato "YYYY-MM"
   * @returns {{ year, month, lastDay, days: DayMeta[] }}
   *
   * DayMeta:
   *   day        {number}  1..31
   *   date       {Date}
   *   ymd        {string}  "YYYY-MM-DD"
   *   dow        {number}  0=dom .. 6=sáb
   *   dowLabel   {string}  "LUN", "MAR", ...
   *   dowLong    {string}  "LUNES", "MARTES", ...
   *   noLaborable {boolean}
   *   festivo    {boolean}  festivo no-domingo (entre semana o sábado)
   *   esSabado   {boolean}
   */
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
      });
    }

    return { year: y, month: m, lastDay, days };
  };

  /**
   * Agrupa los días en trozos lunes–sábado.
   * Los domingos se omiten. Trozos parciales al inicio/fin del mes son válidos.
   * @param {{ days: DayMeta[] }} meta
   * @returns {DayMeta[][]}
   */
  const buildWeekChunks = (meta) => {
    const chunks = [];
    let cur = [];
    meta.days.forEach((d) => {
      if (d.dow === 0) return; // omitir domingos
      if (d.dow === 1 && cur.length) {
        chunks.push(cur);
        cur = [];
      }
      cur.push(d);
      if (d.dow === 6) {
        chunks.push(cur);
        cur = [];
      }
    });
    if (cur.length) chunks.push(cur);
    return chunks;
  };

  /**
   * true si el chunk es una semana lun–sáb completa (6 días, lun→sáb).
   * Los trozos cortados por inicio/fin de mes NO son semanas completas.
   * @param {DayMeta[]} chunk
   */
  const esChunkCompleto = (chunk) =>
    Array.isArray(chunk) &&
    chunk.length === 6 &&
    chunk[0].dow === 1 &&
    chunk[chunk.length - 1].dow === 6;

  /**
   * El lunes de la semana que contiene `d` (puede ser fuera del mes).
   * Usado para determinar si el lunes de esa semana es festivo.
   * @param {DayMeta} d
   * @param {DayMeta[]} allDays
   * @returns {DayMeta|null}
   */
  const getLunesDeSemana = (d, allDays) => {
    const offset = d.dow === 1 ? 0 : d.dow === 0 ? -6 : -(d.dow - 1);
    const targetDay = d.day + offset;
    return allDays.find(x => x.day === targetDay) || null;
  };

  /**
   * true si `d` es lunes laborable normal (dow===1 y no festivo).
   * @param {DayMeta} d
   */
  const esLunesLaborable = (d) => d.dow === 1 && !d.noLaborable;

  /**
   * true si `d` es martes y el lunes de esa semana fue festivo.
   * Lunes festivo → martes es el primer día laborable → reglas especiales.
   * @param {DayMeta} d
   * @param {DayMeta[]} allDays
   */
  const esMartesPostFestivo = (d, allDays) => {
    if (d.dow !== 2) return false;
    const lun = getLunesDeSemana(d, allDays);
    return !!(lun && lun.festivo);
  };

  /**
   * true si la semana de `chunk` tiene lunes festivo.
   * @param {DayMeta[]} chunk
   */
  const chunkTieneLunesFestivo = (chunk) => {
    const lun = chunk.find(d => d.dow === 1);
    return !!(lun && lun.festivo);
  };

  /**
   * Cuenta sábados laborables en el mes (para columnas Σ en la UI).
   * @param {{ days: DayMeta[] }} meta
   */
  const countSabadosLaborables = (meta) =>
    meta.days.filter(d => d.dow === 6 && !d.noLaborable).length;

  /**
   * Retorna el chunk que termina en el sábado dado.
   * @param {{ days: DayMeta[] }} meta
   * @param {DayMeta} satDay
   * @param {DayMeta[][]} chunks
   */
  const findChunkEndingAtSaturday = (meta, satDay, chunks) => {
    const ch = chunks.find(c => c.length && c[c.length - 1].day === satDay.day);
    return ch || [];
  };

  /**
   * ¿Es un día donde todos los no-fijos deben estar 9/6?
   * = lunes laborable normal O martes post-festivo.
   * El trío mensajeros tiene excepción en martes post-festivo (pueden tener ajuste).
   * @param {DayMeta} d
   * @param {DayMeta[]} allDays
   */
  const esDiaTodosNueveSeis = (d, allDays) => {
    if (d.noLaborable) return false;
    if (esLunesLaborable(d)) return true;
    return esMartesPostFestivo(d, allDays);
  };

  const ENGINE_CALENDAR = {
    getMonthMeta,
    buildWeekChunks,
    esChunkCompleto,
    getLunesDeSemana,
    esLunesLaborable,
    esMartesPostFestivo,
    chunkTieneLunesFestivo,
    countSabadosLaborables,
    findChunkEndingAtSaturday,
    esDiaTodosNueveSeis,
    pad2,
    toYmd,
  };

  window.ENGINE_CALENDAR = ENGINE_CALENDAR;

})();
