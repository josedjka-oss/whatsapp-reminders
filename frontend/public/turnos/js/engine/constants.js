/**
 * constants.js — Fuente única de verdad.
 * IDs alineados con Firestore y DOM existentes (sin migración).
 */
(function () {
  'use strict';

  // ─── CONFIGURACIÓN HORARIA ────────────────────────────────────────────────────

  const CFG = {
    HORAS_ALMUERZO:        1,
    HORAS_ALMUERZO_SAB:    0.5,
    MINUTOS_ALMUERZO_SAB:  30,
    HORAS_TOPE_SEMANA:     44,
    HORAS_SEMANA_NORMAL:   47,
    HORAS_SEMANA_FESTIVO:  46,
    HORAS_FESTIVO_SEMANA:  7,
    HORAS_SAB:             7,
    HORAS_DIA_NORMAL:      8,
    AJUSTES_SEMANA_NORMAL: 3,
    AJUSTES_SEMANA_FESTIVO:2,
    AM_NORMAL:  '9',
    AM_SABADO:  '930',
    AM_AJUSTE:  '10',
    PM_NORMAL:  '6',
    PM_AJUSTE:  '5',
    PM_SAB:     '5',
    NO_LAB_MARK: '--',
  };

  // ─── FESTIVOS ─────────────────────────────────────────────────────────────────

  const FESTIVOS_CO = {
    2024: [
      '2024-01-01','2024-01-08','2024-03-25','2024-03-28','2024-03-29','2024-05-01',
      '2024-05-13','2024-06-03','2024-06-10','2024-07-01','2024-07-20','2024-08-07',
      '2024-08-19','2024-10-14','2024-11-04','2024-11-11','2024-12-08','2024-12-25',
    ],
    2025: [
      '2025-01-01','2025-01-06','2025-03-24','2025-04-17','2025-04-18','2025-05-01',
      '2025-06-02','2025-06-23','2025-06-30','2025-07-20','2025-08-07','2025-08-18',
      '2025-10-13','2025-11-03','2025-11-17','2025-12-08','2025-12-25',
    ],
    2026: [
      '2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01',
      '2026-05-18','2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07',
      '2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25',
    ],
    2027: [
      '2027-01-01','2027-01-11','2027-03-22','2027-03-25','2027-03-26','2027-05-01',
      '2027-05-10','2027-05-31','2027-06-07','2027-07-05','2027-07-20','2027-08-07',
      '2027-08-16','2027-10-18','2027-11-01','2027-11-15','2027-12-08','2027-12-25',
    ],
    2028: [
      '2028-01-01','2028-01-10','2028-03-20','2028-04-13','2028-04-14','2028-05-01',
      '2028-05-29','2028-06-19','2028-06-26','2028-07-03','2028-07-20','2028-08-07',
      '2028-08-21','2028-10-16','2028-11-06','2028-11-13','2028-12-08','2028-12-25',
    ],
  };

  // ─── EMPLEADOS ────────────────────────────────────────────────────────────────

  const EMPLEADOS = [
    { id: 'harold_paipa',      name: 'HAROLD PAIPA',      type: 'no-fijo' },
    { id: 'diego_lozano',      name: 'DIEGO LOZANO',      type: 'no-fijo' },
    { id: 'dilan_toro',        name: 'DILAN TORO',         type: 'no-fijo' },
    { id: 'santiago_guarnizo', name: 'SANTIAGO GUARNIZO', type: 'no-fijo' },
    { id: 'miguel_fonseca',    name: 'MIGUEL FONSECA',    type: 'no-fijo' },
    { id: 'juan_giron',        name: 'JUAN GIRÓN',        type: 'fijo'    },
    { id: 'brayan_ramirez',    name: 'BRAYAN RAMÍREZ',    type: 'fijo'    },
    { id: 'brandon',           name: 'BRANDON',           type: 'no-fijo' },
    { id: 'jesus_perez',       name: 'JESÚS PÉREZ',       type: 'no-fijo' },
    { id: 'jhonny_rodriguez',  name: 'JHONNY RODRÍGUEZ',  type: 'no-fijo' },
    { id: 'cristian_uribe',    name: 'CRISTIAN URIBE',    type: 'no-fijo' },
    { id: 'brayan_yate',       name: 'BRAYAN YATE',       type: 'no-fijo' },
    { id: 'mauricio_bautista', name: 'MAURICIO BAUTISTA', type: 'no-fijo' },
    { id: 'jhon_lozano',       name: 'JHON LOZANO',       type: 'fijo'    },
    { id: 'david_sanchez',     name: 'DAVID SÁNCHEZ',     type: 'no-fijo' },
    { id: 'jonathan_sanchez',  name: 'JONATHAN SÁNCHEZ',  type: 'fijo'    },
  ];

  // ─── GRUPOS / EQUIPOS ─────────────────────────────────────────────────────────

  const GRUPO_MENSAJEROS = ['harold_paipa', 'diego_lozano', 'dilan_toro'];

  const TEAM_MENSAJEROS = GRUPO_MENSAJEROS;
  const TEAM_2 = ['santiago_guarnizo', 'miguel_fonseca', 'juan_giron'];
  const TEAM_3 = ['brayan_ramirez', 'brandon', 'jesus_perez'];
  const TEAM_4 = ['jhonny_rodriguez'];
  const TEAM_5 = ['brayan_yate', 'mauricio_bautista'];
  const TEAM_6 = ['jonathan_sanchez', 'david_sanchez'];

  const teamClassForEmpId = (empId) => {
    if (TEAM_MENSAJEROS.includes(empId)) return 'team-mensajeros';
    if (TEAM_2.includes(empId)) return 'team-2';
    if (TEAM_3.includes(empId)) return 'team-3';
    if (TEAM_4.includes(empId)) return 'team-4';
    if (TEAM_5.includes(empId)) return 'team-5';
    if (TEAM_6.includes(empId)) return 'team-6';
    return '';
  };

  const TRIO_ROW_BY_ID = {
    harold_paipa: 0,
    dilan_toro:   1,
    diego_lozano: 2,
  };

  /** Dúo turno Santiago / Miguel (Juan fijo 9/6 aparte). */
  const DUO_SANTIAGO_MIGUEL = ['santiago_guarnizo', 'miguel_fonseca'];

  /** Trío almuerzo Santiago / Miguel / Juan. */
  const TRIO_SANTIAGO_MIGUEL_JUAN = ['santiago_guarnizo', 'miguel_fonseca', 'juan_giron'];

  /** Trío despacho: almuerzos 12/1/2 rotativos; Brayan R fijo horario. */
  const TRIO_DESPACHO = ['brayan_ramirez', 'brandon', 'jesus_perez'];

  /** Dúo turno Jesús / Brandon (mismo patrón S/M). */
  const DUO_JESUS_BRANDON = ['jesus_perez', 'brandon'];

  const DUO_BRAYAN_MAURICIO = ['brayan_yate', 'mauricio_bautista'];

  /** Dúo Jonathan / David (equipo 6 — almuerzo sábado y color planilla). */
  const DUO_JONATHAN_DAVID = ['jonathan_sanchez', 'david_sanchez'];

  /** Fijos horario: 9/6 lun–vie, 9:30/5 sáb (Jonathan/David → 9/5 sáb). */
  const GRUPO_FIJO = ['jhon_lozano', 'juan_giron', 'brayan_ramirez', 'jonathan_sanchez'];

  const EXCEPCION_SABADO_ENTRADA_9 = ['jonathan_sanchez', 'david_sanchez'];
  const IDS_SABADO_ENTRADA_9 = new Set(EXCEPCION_SABADO_ENTRADA_9);

  const usaEntradaSabadoNueve = (empId) => IDS_SABADO_ENTRADA_9.has(empId);
  const usaAlmuerzoHoraSabado = (empId) => IDS_SABADO_ENTRADA_9.has(empId);

  const GRUPO_NO_FIJO = EMPLEADOS.filter(e => e.type === 'no-fijo').map(e => e.id);

  const IDS_FIJO       = new Set(GRUPO_FIJO);
  const IDS_MENSAJEROS = new Set(GRUPO_MENSAJEROS);
  const IDS_NO_FIJO    = new Set(GRUPO_NO_FIJO);

  const GRUPOS_TURNO = [
    GRUPO_MENSAJEROS,
    DUO_SANTIAGO_MIGUEL,
    DUO_JESUS_BRANDON,
    DUO_BRAYAN_MAURICIO,
  ];
  const IDS_TURNO = new Set([
    ...GRUPO_MENSAJEROS,
    ...DUO_SANTIAGO_MIGUEL,
    ...DUO_JESUS_BRANDON,
    ...DUO_BRAYAN_MAURICIO,
  ]);

  // ─── ALMUERZOS FIJOS ─────────────────────────────────────────────────────────

  const ALMUERZO_FIJO = {
    'jhon_lozano':       '3:00',
    'jonathan_sanchez':  '1:00',
    'mauricio_bautista': '1:00',
    'brayan_yate':       '3:00',
    'david_sanchez':     '1:00',
  };

  /** Almuerzo fijo lun–vie; sábado usa rotación por equipo (salvo Jhon Lozano 3:00). */
  const almuerzoFijoSemana = (empId) => ALMUERZO_FIJO[empId] ?? null;

  const RESTRICCIONES_AJUSTE = {
    'harold_paipa':      { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'diego_lozano':      { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'dilan_toro':        { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'santiago_guarnizo': { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'miguel_fonseca':    { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'cristian_uribe':    { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'jesus_perez':       { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'brandon':           { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'jhonny_rodriguez':  { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'brayan_yate':       { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'mauricio_bautista': { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'david_sanchez':     { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'jhon_lozano':       { puedeEntrarDiez: false, puedeSalirCinco: false },
    'juan_giron':        { puedeEntrarDiez: false, puedeSalirCinco: false },
    'brayan_ramirez':    { puedeEntrarDiez: false, puedeSalirCinco: false },
    'jonathan_sanchez':  { puedeEntrarDiez: false, puedeSalirCinco: false },
  };

  const ALMUERZOS_MENSAJEROS      = ['12:00', '1:00', '2:00'];
  /** Tríos sábado (30 min): 12:30 · 1:00 · 1:30 → 1:30-2:00. */
  const ALMUERZOS_SABADO          = ['12:30', '1:00', '1:30'];
  /** Dúos sábado (30 min): solo 12:30-1:00 y 1:00-1:30. */
  const ALMUERZOS_SABADO_DUO      = ['12:30', '1:00'];
  const ALMUERZOS_TRES_FRANJAS    = ['12:00', '1:00', '2:00'];

  const formatEmpNameHtml = (fullName) => {
    const raw = String(fullName || '').trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return `<span class="emp-name-stack emp-name-single" aria-label="${raw}"><span class="emp-nombre">${raw}</span></span>`;
    }
    const nombre = parts[0];
    const apellido = parts.slice(1).join(' ');
    return `<span class="emp-name-stack" aria-label="${raw}"><span class="emp-nombre">${nombre}</span><span class="emp-apellido">${apellido}</span></span>`;
  };

  const ENGINE_CONSTANTS = {
    CFG,
    FESTIVOS_CO,
    EMPLEADOS,
    GRUPO_MENSAJEROS,
    TEAM_MENSAJEROS,
    TEAM_2,
    TEAM_3,
    TEAM_4,
    TEAM_5,
    TEAM_6,
    teamClassForEmpId,
    TRIO_ROW_BY_ID,
    TRIO_SANTIAGO_MIGUEL_JUAN,
    TRIO_DESPACHO,
    DUO_SANTIAGO_MIGUEL,
    DUO_JESUS_BRANDON,
    DUO_BRAYAN_MAURICIO,
    DUO_JONATHAN_DAVID,
    GRUPO_FIJO,
    GRUPO_NO_FIJO,
    IDS_FIJO,
    IDS_MENSAJEROS,
    IDS_NO_FIJO,
    GRUPOS_TURNO,
    IDS_TURNO,
    ALMUERZO_FIJO,
    almuerzoFijoSemana,
    RESTRICCIONES_AJUSTE,
    ALMUERZOS_MENSAJEROS,
    ALMUERZOS_SABADO,
    ALMUERZOS_SABADO_DUO,
    ALMUERZOS_TRES_FRANJAS,
    EXCEPCION_SABADO_ENTRADA_9,
    IDS_SABADO_ENTRADA_9,
    usaEntradaSabadoNueve,
    usaAlmuerzoHoraSabado,
    formatEmpNameHtml,
  };

  window.ENGINE_CONSTANTS = ENGINE_CONSTANTS;

})();
