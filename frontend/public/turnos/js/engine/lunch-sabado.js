/**
 * lunch-sabado.js — Asignación almuerzo sábado por orden de roster + rotación semanal.
 */
(function () {
  'use strict';

  const {
    ALMUERZOS_SABADO,
    ALMUERZOS_SABADO_DUO,
    ALMUERZOS_SABADO_UNA_HORA,
  } = window.ENGINE_CONSTANTS;

  /** Índice del sábado laborable en el mes (0 = primer sáb). */
  const sabadoIndexEnMes = (meta, d) => {
    if (!meta?.days || !d?.day) return 0;
    return meta.days.filter(
      (x) => x.esSabado && !x.noLaborable && x.day < d.day
    ).length;
  };

  const rotateRoster = (ordered, start) => [
    ...ordered.slice(start),
    ...ordered.slice(0, start),
  ];

  /**
   * Trío sábado: rota quién va 1.º cada sáb; 1.º→12:30, 2.º→1:00, 3.º→1:30.
   * Así el tercero del roster también alterna (no queda fijo en 1:30).
   */
  const assignTrioSabadoLunch = (ids, d, meta) => {
    const ordered = [...ids].sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    const satIdx  = sabadoIndexEnMes(meta, d);
    const queue   = rotateRoster(ordered, satIdx % ordered.length);
    const out     = {};
    queue.forEach((id, pos) => {
      out[id] = ALMUERZOS_SABADO[pos];
    });
    return out;
  };

  /**
   * Dúo sábado (30 min): rota quién va 1.º; 1.º→12:30, 2.º→1:00.
   */
  const assignDuoSabadoLunch = (ids, d, meta) => {
    const ordered = [...ids].sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    const satIdx  = sabadoIndexEnMes(meta, d);
    const queue   = rotateRoster(ordered, satIdx % 2);
    const out     = {};
    out[queue[0]] = ALMUERZOS_SABADO_DUO[0];
    out[queue[1]] = ALMUERZOS_SABADO_DUO[1];
    return out;
  };

  /**
   * Jonathan / David sábado: almuerzo 1 h alternado (1:00 vs 2:00).
   */
  const assignJonathanDavidSabadoLunch = (ids, d, meta) => {
    const ordered = [...ids].sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    const satIdx  = sabadoIndexEnMes(meta, d);
    const queue   = rotateRoster(ordered, satIdx % 2);
    const out     = {};
    out[queue[0]] = ALMUERZOS_SABADO_UNA_HORA[0];
    out[queue[1]] = ALMUERZOS_SABADO_UNA_HORA[1];
    return out;
  };

  window.ENGINE_LUNCH_SABADO = {
    sabadoIndexEnMes,
    assignTrioSabadoLunch,
    assignDuoSabadoLunch,
    assignJonathanDavidSabadoLunch,
  };
})();
