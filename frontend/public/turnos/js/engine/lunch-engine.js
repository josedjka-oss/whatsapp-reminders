/**
 * lunch-engine.js — Horarios de almuerzo calculados (solo lectura del state).
 */
(function () {
  'use strict';

  const {
    ALMUERZO_FIJO,
    almuerzoFijoSemana,
    GRUPO_MENSAJEROS,
    TRIO_SANTIAGO_MIGUEL_JUAN,
    TRIO_DESPACHO,
    DUO_SANTIAGO_MIGUEL,
    DUO_BRAYAN_MAURICIO,
    DUO_JHONNY_CRISTIAN,
    DUO_JONATHAN_DAVID,
    ALMUERZOS_SABADO,
    ALMUERZOS_SABADO_DUO,
    ALMUERZOS_TRES_FRANJAS,
    CFG,
    usaAlmuerzoHoraSabado,
  } = window.ENGINE_CONSTANTS;

  const { getLunchTrio, getAusenteTrio, getLunchTrioDos } = window.ENGINE_RULES_MESSENGERS;
  const { normAm } = window.ENGINE_HOURS;

  const ALMUERZO_DEFAULT = '1:00';
  const JHONNY_ID   = 'jhonny_rodriguez';
  const CRISTIAN_ID = 'cristian_uribe';

  const {
    assignTrioSabadoLunch,
    assignDuoSabadoLunch,
    assignJonathanDavidSabadoLunch,
  } = window.ENGINE_LUNCH_SABADO;

  const hashDia = (monthKey, d, salt) => {
    let h = 2166136261;
    const s = `${monthKey}|${d.ymd}|${d.day}|${d.dow}|${salt}`;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const PERMS6 = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

  /**
   * Almuerzo 12/1/2 para un grupo de 3: quien entra 10 → 2:00; los otros alternan 12/1.
   */
  const getLunchTresGrupo = (state, d, monthKey, ids, salt, meta) => {
    const dayNum = d.day;
    const conDiez = ids.filter(id => normAm(state.cells[id]?.[dayNum]) === '10');
    const out = {};

    if (d.esSabado) {
      return assignTrioSabadoLunch(ids, d, meta);
    }

    if (conDiez.length === 1) {
      out[conDiez[0]] = '2:00';
      const otros = ids.filter(x => x !== conDiez[0])
        .sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
      const flip = hashDia(monthKey, d, `${salt}|${conDiez[0]}`) & 1;
      out[otros[0]] = flip ? '1:00' : '12:00';
      out[otros[1]] = flip ? '12:00' : '1:00';
      return out;
    }

    const perm = PERMS6[hashDia(monthKey, d, `${salt}-roll`) % 6];
    ids.forEach((id, i) => { out[id] = ALMUERZOS_TRES_FRANJAS[perm[i]]; });
    conDiez.forEach((id) => {
      out[id] = '2:00';
      const others = ids.filter(x => x !== id)
        .sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
      const flip = hashDia(monthKey, d, `${salt}-sub|${id}`) & 1;
      out[others[0]] = flip ? '1:00' : '12:00';
      out[others[1]] = flip ? '12:00' : '1:00';
    });
    return out;
  };

  /** Jhonny / Cristian lun–vie: alternan 1/2; jueves Jhonny 2 / Cristian 1. */
  const getJhonnyCristianLunch = (d, monthKey, meta) => {
    if (d.dow === 4) {
      return { [JHONNY_ID]: '2:00', [CRISTIAN_ID]: '1:00' };
    }
    let n = 0;
    meta.days.forEach((od) => {
      if (od.day >= d.day || od.noLaborable) return;
      n += 1;
    });
    const jhonnyFirst = n % 2 === 0;
    return jhonnyFirst
      ? { [JHONNY_ID]: '1:00', [CRISTIAN_ID]: '2:00' }
      : { [JHONNY_ID]: '2:00', [CRISTIAN_ID]: '1:00' };
  };

  const lunchTimeToMinutes = (raw) => {
    const t = normalizeSingleLunchTime(raw);
    if (!t) return 13 * 60;
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    const mi = parseInt(mStr || '0', 10);
    if (h >= 1 && h <= 11) h += 12;
    return h * 60 + mi;
  };

  const normalizeSingleLunchTime = (raw) => {
    let s = String(raw ?? '').trim().toLowerCase().replace(/\s/g, '');
    if (!s) return '';

    const shortcuts = {
      '12': '12:00', '12:0': '12:00', '12:00': '12:00',
      '1230': '12:30', '12:30': '12:30',
      '1': '1:00', '01': '1:00', '1:0': '1:00', '1:00': '1:00',
      '130': '1:30', '1:30': '1:30',
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

  const getLunchDisplayComputed = (empId, d, monthKey, state, meta) => {
    if (GRUPO_MENSAJEROS.includes(empId)) {
      const map = getLunchTrio(state, d, monthKey, meta);
      return map[empId] ?? ALMUERZO_DEFAULT;
    }

    if (TRIO_SANTIAGO_MIGUEL_JUAN.includes(empId)) {
      const map = getLunchTresGrupo(state, d, monthKey, TRIO_SANTIAGO_MIGUEL_JUAN, 'smj', meta);
      return map[empId] ?? ALMUERZO_DEFAULT;
    }

    if (TRIO_DESPACHO.includes(empId)) {
      const map = getLunchTresGrupo(state, d, monthKey, TRIO_DESPACHO, 'desp', meta);
      return map[empId] ?? ALMUERZO_DEFAULT;
    }

    if (DUO_JHONNY_CRISTIAN.includes(empId)) {
      if (d.esSabado) {
        const map = assignDuoSabadoLunch(DUO_JHONNY_CRISTIAN, d, meta);
        return map[empId] ?? ALMUERZO_DEFAULT;
      }
      const map = getJhonnyCristianLunch(d, monthKey, meta);
      return map[empId] ?? ALMUERZO_DEFAULT;
    }

    if (DUO_JONATHAN_DAVID.includes(empId)) {
      if (d.esSabado) {
        const map = assignJonathanDavidSabadoLunch(DUO_JONATHAN_DAVID, d, meta);
        return map[empId] ?? ALMUERZO_DEFAULT;
      }
    }

    if (DUO_BRAYAN_MAURICIO.includes(empId)) {
      if (d.esSabado) {
        const map = assignDuoSabadoLunch(DUO_BRAYAN_MAURICIO, d, meta);
        return map[empId] ?? ALMUERZO_DEFAULT;
      }
    }

    if (d.esSabado && empId === 'jhon_lozano') {
      return ALMUERZO_FIJO.jhon_lozano;
    }

    const fijo = almuerzoFijoSemana(empId);
    if (fijo) return fijo;

    return ALMUERZO_DEFAULT;
  };

  const getLunchDisplay = (empId, d, monthKey, state, meta) => {
    if (d.noLaborable) return CFG.NO_LAB_MARK;
    const manual = getLunchOverride(state, empId, d.day);
    const base = manual || getLunchDisplayComputed(empId, d, monthKey, state, meta);
    if (d.esSabado && empId === 'jhon_lozano') return '3:00';
    return applyDuracionAlmuerzoSabado(base, d, empId);
  };

  const minutosAlmuerzoSabado = (empId) => (
    empId && usaAlmuerzoHoraSabado(empId)
      ? CFG.HORAS_ALMUERZO * 60
      : CFG.MINUTOS_ALMUERZO_SAB
  );

  const lunchEndMinutesFromStart = (startMin, duracionMin) => (
    startMin + duracionMin
  );

  const formatLunchSabadoRango = (startFranja, duracionMin) => {
    const start = normalizeSingleLunchTime(startFranja);
    if (!start) return String(startFranja ?? '').trim();
    const startMin = lunchTimeToMinutes(start);
    const endMin   = lunchEndMinutesFromStart(startMin, duracionMin);
    return `${start}-${minToDisplay(endMin)}`;
  };

  const applyDuracionAlmuerzoSabado = (franja, d, empId = null) => {
    if (!d?.esSabado || !franja) return franja;
    const s = String(franja).trim();
    if (!s) return s;
    if (/\s*(?:-|–|—|a)\s*/i.test(s)) return s;
    return formatLunchSabadoRango(s, minutosAlmuerzoSabado(empId));
  };

  const parseLunchRange = (franja, esSabado = false, empId = null) => {
    const endFromStart = (startMin) => {
      if (esSabado) {
        return lunchEndMinutesFromStart(startMin, minutosAlmuerzoSabado(empId));
      }
      return (Math.floor(startMin / 60) + 1) * 60;
    };
    const s = String(franja ?? '').trim();
    const parts = s.split(/\s*(?:-|–|—|a)\s*/i);
    if (parts.length >= 2 && parts[1].trim()) {
      const start = lunchTimeToMinutes(parts[0]);
      const end = lunchTimeToMinutes(parts[1]);
      return { start, end: end > start ? end : endFromStart(start) };
    }
    const start = lunchTimeToMinutes(s);
    return { start, end: endFromStart(start) };
  };

  const minToDisplay = (min) => {
    const H   = Math.floor(min / 60);
    const mi  = min % 60;
    const h12 = ((H + 11) % 12) + 1;
    return mi === 0 ? `${h12}:00` : `${h12}:${String(mi).padStart(2, '0')}`;
  };

  const ENGINE_LUNCH = {
    getLunchDisplay,
    getLunchDisplayComputed,
    getLunchOverride,
    normalizeLunchTime,
    normalizeSingleLunchTime,
    lunchTimeToMinutes,
    parseLunchRange,
    getLunchTresGrupo,
    getJhonnyCristianLunch,
    assignTrioSabadoLunch,
    assignDuoSabadoLunch,
    assignJonathanDavidSabadoLunch,
  };

  window.ENGINE_LUNCH = ENGINE_LUNCH;

})();
