/**
 * lunch-engine.js
 * Calcula el horario de almuerzo de cada empleado para cada día.
 * Solo lectura del estado — no muta nada.
 *
 * Reglas por grupo:
 *   Trío mensajeros      → 12/1/2 escalonados (quien entra 10 → 2:00)
 *   Juan / Jesús         → Jesús 10→1:00 / Juan 12:00; si Jesús 9 → alterna por día
 *   Santiago / Miguel    → 12/1 (quien entra 10 → 1:00); Jhon Lozano cubre a las 2
 *   Brayan Yate/Mauricio → fijos: Mauricio 1:00, Brayan Yate 3:00
 *   Johnny / Brayan R    → fijos: Johnny 1:00, Brayan R 12:00
 *   Cristian             → 1:00 por defecto; 2:00 si entra a las 10
 *   David Sánchez        → 1:00 fijo (independiente, sin lógica especial)
 *   Fijos restantes      → ver ALMUERZO_FIJO en constants.js
 */
(function () {
  'use strict';

  const {
    ALMUERZO_FIJO,
    GRUPO_MENSAJEROS,
    DUO_SANTIAGO_MIGUEL,
    DUO_BRAYAN_MAURICIO,
    ALMUERZOS_SABADO,
    CFG,
    usaAlmuerzoHoraSabado,
  } = window.ENGINE_CONSTANTS;

  const { getLunchTrio, getAusenteTrio, getLunchTrioDos } = window.ENGINE_RULES_MESSENGERS;
  const { normAm }                                        = window.ENGINE_HOURS;

  const ALMUERZO_DEFAULT = '1:00';
  const JUAN_ID = 'juan_giron';
  const JESUS_ID = 'jesus_perez';

  const almuerzoJhonny = () => ALMUERZO_FIJO['jhonny_rodriguez'] || '1:00';

  /** Convierte token horario → minutos desde medianoche (12:32→752, 1:00→780). */
  const lunchTimeToMinutes = (raw) => {
    const t = normalizeSingleLunchTime(raw);
    if (!t) return 13 * 60;
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const mi = parseInt(mStr || '0', 10);
    if (h >= 1 && h <= 11) h += 12;
    return h * 60 + mi;
  };

  /** Un solo horario: 12, 1, 12:32, 13:00… → "h:mm" (formato 12 h). */
  const normalizeSingleLunchTime = (raw) => {
    let s = String(raw ?? '').trim().toLowerCase().replace(/\s/g, '');
    if (!s) return '';

    const shortcuts = {
      '12': '12:00', '12:0': '12:00', '12:00': '12:00',
      '1': '1:00', '01': '1:00', '1:0': '1:00', '1:00': '1:00',
      '13': '1:00', '13:0': '1:00', '13:00': '1:00',
      '2': '2:00', '14': '2:00', '14:0': '2:00', '14:00': '2:00',
      '3': '3:00', '15': '3:00', '3:0': '3:00', '3:00': '3:00',
      '4': '4:00', '16': '4:00', '4:0': '4:00', '4:00': '4:00',
    };
    if (shortcuts[s]) return shortcuts[s];

    const m = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(s);
    if (!m) return '';

    let h = parseInt(m[1], 10);
    const mi = m[2] != null ? parseInt(m[2], 10) : 0;
    if (Number.isNaN(h) || Number.isNaN(mi) || mi < 0 || mi > 59) return '';

    if (h === 13) h = 1;
    else if (h === 14) h = 2;
    else if (h === 15) h = 3;
    else if (h === 16) h = 4;
    if (h < 1 || h > 12) return '';

    return mi === 0 ? `${h}:00` : `${h}:${String(mi).padStart(2, '0')}`;
  };

  /**
   * Normaliza entrada manual.
   * Soporta: 12:32 · 12:32-1:00 · 12:32 a 1 · atajos 12, 1, 2…
   */
  const normalizeLunchTime = (raw) => {
    const s = String(raw ?? '').trim();
    if (!s) return '';

    const rangeMatch = /^(.+?)\s*(?:-|–|—|a|to)\s*(.+)$/i.exec(s);
    if (rangeMatch) {
      const start = normalizeSingleLunchTime(rangeMatch[1]);
      const end = normalizeSingleLunchTime(rangeMatch[2]);
      if (start && end) return `${start}-${end}`;
      if (start) return start;
    }

    const single = normalizeSingleLunchTime(s);
    if (single) return single;

    return s;
  };

  const getLunchOverride = (state, empId, day) => {
    const ov = state.lunchOverrides?.[empId]?.[day]
      ?? state.lunchOverrides?.[empId]?.[String(day)];
    if (ov == null || String(ov).trim() === '') return '';
    return normalizeLunchTime(ov);
  };

  // ─── JUAN / JESÚS ─────────────────────────────────────────────────────────────

  /**
   * Construye mapa día → { juan_giron, jesus_perez } para todo el mes.
   *
   * Reglas:
   *   - Si hay ausente del trío ese día: Jesús cubre a los dos presentes.
   *     Su almuerzo = primer hueco disponible sin solaparse con coberturas.
   *   - Jesús am=10 → almuerza 1:00, Juan almuerza 12:00.
   *   - Jesús am=9  → alterna 12:00/1:00 respecto al día laborable anterior.
   *
   * @param {object} state
   * @param {object} meta
   * @param {string} monthKey
   * @returns {Map<number,{juan_giron:string, jesus_perez:string}>}
   */
  const buildJuanJesusLunch = (state, meta, monthKey) => {
    const map     = new Map();
    let prevJesus = undefined;

    meta.days.forEach((d) => {
      if (d.noLaborable) return;

      const juanLunch = almuerzoJhonny();

      // Ausente del trío → Jesús cubre
      const ausente = getAusenteTrio(state, d.day);
      if (ausente && GRUPO_MENSAJEROS.includes(ausente)) {
        const resultado = computeJesusJuanConAusenteTrio(state, d, monthKey);
        if (resultado) {
          map.set(d.day, { ...resultado, [JUAN_ID]: juanLunch });
          const jT = resultado[JESUS_ID];
          if (jT === '1:00' || jT === '12:00') prevJesus = jT;
          return;
        }
      }

      const jaAm = normAm(state.cells[JESUS_ID]?.[d.day]);

      if (jaAm === '10') {
        map.set(d.day, { [JESUS_ID]: '1:00', [JUAN_ID]: juanLunch });
        prevJesus = '1:00';
        return;
      }

      let jesusT;
      if (prevJesus === undefined) {
        jesusT = '1:00';
      } else {
        jesusT = prevJesus === '1:00' ? '12:00' : '1:00';
      }
      map.set(d.day, { [JESUS_ID]: jesusT, [JUAN_ID]: juanLunch });
      prevJesus = jesusT;
    });

    return map;
  };

  /**
   * Calcula almuerzos de Jesús y Juan cuando un mensajero del trío está ausente.
   * Jesús cubre los almuerzos de los dos presentes → almuerza en el primer hueco libre.
   */
  const computeJesusJuanConAusenteTrio = (state, d, monthKey) => {
    const ausente = getAusenteTrio(state, d.day);
    const ids     = GRUPO_MENSAJEROS.filter(x => x !== ausente);
    if (ids.length !== 2) return null;

    const lunchTrio  = getLunchTrio(state, d, monthKey);
    const durMin     = d.esSabado ? CFG.MINUTOS_ALMUERZO_SAB : 60;
    const coberturas = ids
      .map((id) => {
        const ov = getLunchOverride(state, id, d.day);
        const slot = ov || lunchTrio[id] || '1:00';
        const { start, end } = parseLunchRange(slot, d.esSabado);
        return { from: start, to: end };
      })
      .sort((a, b) => a.from - b.from);

    const disjoint   = (a0, a1, b0, b1) => a1 <= b0 || b1 <= a0;
    const candidatos = [12, 13, 14, 15, 16, 17].map(h => h * 60);

    for (const jStart of candidatos) {
      const jEnd = jStart + durMin;
      if (!coberturas.every(k => disjoint(jStart, jEnd, k.from, k.to))) continue;
      return {
        [JESUS_ID]: minToDisplay(jStart),
      };
    }
    return null;
  };

  // ─── SANTIAGO / MIGUEL ────────────────────────────────────────────────────────

  /**
   * Quien entra a las 10 → 1:00; el otro → 12:00.
   * Ambos con 9 → alterna por día (hash estable).
   * Jhon Lozano cubre a las 2 (almuerzo fijo en constants).
   */
  const getSantiagoMiguelLunch = (state, d, monthKey) => {
    const [sId, mId] = DUO_SANTIAGO_MIGUEL;

    if (d.esSabado) {
      const flip = hashDia(monthKey, d, 'sm-sab') & 1;
      return flip
        ? { [sId]: ALMUERZOS_SABADO[0], [mId]: ALMUERZOS_SABADO[1] }
        : { [sId]: ALMUERZOS_SABADO[1], [mId]: ALMUERZOS_SABADO[2] };
    }

    const sAm = normAm(state.cells[sId]?.[d.day]);
    const mAm = normAm(state.cells[mId]?.[d.day]);
    const out  = {};

    if (sAm === '10' && mAm !== '10') {
      out[sId] = '1:00'; out[mId] = '12:00';
    } else if (mAm === '10' && sAm !== '10') {
      out[mId] = '1:00'; out[sId] = '12:00';
    } else {
      const flip = hashDia(monthKey, d, 'sm') & 1;
      out[sId] = flip ? '1:00' : '12:00';
      out[mId] = flip ? '12:00' : '1:00';
    }
    return out;
  };

  // ─── DISPATCH PRINCIPAL ───────────────────────────────────────────────────────

  /** Horario calculado por reglas (sin override manual). */
  const getLunchDisplayComputed = (empId, d, monthKey, state, jjLunchByDay) => {
    if (empId === JUAN_ID) {
      return d.esSabado ? '1:00-1:30' : almuerzoJhonny();
    }

    if (GRUPO_MENSAJEROS.includes(empId)) {
      const map = getLunchTrio(state, d, monthKey);
      return map[empId] ?? ALMUERZO_DEFAULT;
    }

    if (empId === JESUS_ID) {
      const row = jjLunchByDay?.get(d.day);
      return row?.[empId] ?? ALMUERZO_DEFAULT;
    }

    if (DUO_SANTIAGO_MIGUEL.includes(empId)) {
      const map = getSantiagoMiguelLunch(state, d, monthKey);
      return map[empId] ?? ALMUERZO_DEFAULT;
    }

    if (empId === 'cristian_uribe') {
      return normAm(state.cells[empId]?.[d.day]) === '10' ? '2:00' : '1:00';
    }

    if (empId === 'david_sanchez') return '1:00';

    if (ALMUERZO_FIJO[empId]) return ALMUERZO_FIJO[empId];

    return ALMUERZO_DEFAULT;
  };

  /** Override manual o horario calculado. Sábado: franja 30 min (excepto Jonathan/David → 1 h). */
  const getLunchDisplay = (empId, d, monthKey, state, jjLunchByDay) => {
    if (d.noLaborable) return window.ENGINE_CONSTANTS.CFG.NO_LAB_MARK;
    const manual = getLunchOverride(state, empId, d.day);
    const base = manual || getLunchDisplayComputed(empId, d, monthKey, state, jjLunchByDay);
    return applyDuracionAlmuerzoSabado(base, d, empId);
  };

  // ─── UTILIDADES ───────────────────────────────────────────────────────────────

  /** Fin de almuerzo: sábado +30 min; entre semana = hora en punto siguiente. */
  const lunchEndMinutesFromStart = (startMin, esSabado = false) => {
    if (esSabado) return startMin + CFG.MINUTOS_ALMUERZO_SAB;
    return (Math.floor(startMin / 60) + 1) * 60;
  };

  const formatLunchSabado30 = (startFranja) => {
    const start = normalizeSingleLunchTime(startFranja);
    if (!start) return String(startFranja ?? '').trim();
    const startMin = lunchTimeToMinutes(start);
    const endMin = lunchEndMinutesFromStart(startMin, true);
    return `${start}-${minToDisplay(endMin)}`;
  };

  /** En sábado muestra rango 30 min; Jonathan/David mantienen almuerzo de 1 h. */
  const applyDuracionAlmuerzoSabado = (franja, d, empId = null) => {
    if (!d?.esSabado || !franja) return franja;
    if (empId && usaAlmuerzoHoraSabado(empId)) return franja;
    const s = String(franja).trim();
    if (!s) return s;
    if (/\s*(?:-|–|—|a)\s*/i.test(s)) return s;
    return formatLunchSabado30(s);
  };

  /** Inicio y fin en minutos; sábado = 30 min si no hay rango explícito. */
  const parseLunchRange = (franja, esSabado = false) => {
    const s = String(franja ?? '').trim();
    const parts = s.split(/\s*(?:-|–|—|a)\s*/i);
    if (parts.length >= 2 && parts[1].trim()) {
      const start = lunchTimeToMinutes(parts[0]);
      const end = lunchTimeToMinutes(parts[1]);
      return { start, end: end > start ? end : lunchEndMinutesFromStart(start, esSabado) };
    }
    const start = lunchTimeToMinutes(s);
    return { start, end: lunchEndMinutesFromStart(start, esSabado) };
  };

  const franjaToMin = (franja) => {
    const startPart = String(franja ?? '').trim().split(/\s*(?:-|–|—|a)\s*/i)[0].trim();
    return lunchTimeToMinutes(startPart);
  };

  const minToDisplay = (min) => {
    const H   = Math.floor(min / 60);
    const mi  = min % 60;
    const h12 = ((H + 11) % 12) + 1;
    return mi === 0 ? `${h12}:00` : `${h12}:${String(mi).padStart(2, '0')}`;
  };

  const hashDia = (monthKey, d, salt) => {
    let h = 2166136261;
    const s = `${monthKey}|${d.ymd}|${d.day}|${d.dow}|${salt}`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  const ENGINE_LUNCH = {
    buildJuanJesusLunch,
    getLunchDisplay,
    getLunchDisplayComputed,
    getLunchOverride,
    normalizeLunchTime,
    normalizeSingleLunchTime,
    lunchTimeToMinutes,
    parseLunchRange,
    getSantiagoMiguelLunch,
  };

  window.ENGINE_LUNCH = ENGINE_LUNCH;

})();
