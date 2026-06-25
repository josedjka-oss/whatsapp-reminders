/**
 * lunch-sabado.js — Asignación almuerzo sábado por orden de roster + rotación semanal.
 */
(function () {
  'use strict';

  const { ALMUERZOS_SABADO, ALMUERZOS_SABADO_DUO } = window.ENGINE_CONSTANTS;

  /** Índice del sábado laborable en el mes (0 = primer sáb). */
  const sabadoIndexEnMes = (meta, d) => {
    if (!meta?.days || !d?.day) return 0;
    return meta.days.filter(
      (x) => x.esSabado && !x.noLaborable && x.day < d.day
    ).length;
  };

  /**
   * Trío sábado: 1.º→12:30, 2.º→1:00, 3.º→1:30; rota el bloque cada sábado.
   */
  const assignTrioSabadoLunch = (ids, d, meta) => {
    const ordered = [...ids].sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    const offset  = sabadoIndexEnMes(meta, d) % ALMUERZOS_SABADO.length;
    const out     = {};
    ordered.forEach((id, i) => {
      out[id] = ALMUERZOS_SABADO[(i + offset) % ALMUERZOS_SABADO.length];
    });
    return out;
  };

  /**
   * Dúo sábado: 1.º→12:30, 2.º→1:00; alternan quién va primero cada sábado.
   */
  const assignDuoSabadoLunch = (ids, d, meta) => {
    const ordered = [...ids].sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    const flip    = sabadoIndexEnMes(meta, d) % 2;
    const out     = {};
    out[ordered[0]] = flip ? ALMUERZOS_SABADO_DUO[1] : ALMUERZOS_SABADO_DUO[0];
    out[ordered[1]] = flip ? ALMUERZOS_SABADO_DUO[0] : ALMUERZOS_SABADO_DUO[1];
    return out;
  };

  window.ENGINE_LUNCH_SABADO = {
    sabadoIndexEnMes,
    assignTrioSabadoLunch,
    assignDuoSabadoLunch,
  };
})();
