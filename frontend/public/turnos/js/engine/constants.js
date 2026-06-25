/**
 * constants.js — Fuente única de verdad.
 * IDs alineados con Firestore y DOM existentes (sin migración).
 * Brayan Yate = el "Camilo" del spec operativo (dúo con Mauricio).
 * David Sánchez = ajustes como Cristian, almuerzo fijo 1:00, sin cobertura.
 */
(function () {
  'use strict';

  // ─── CONFIGURACIÓN HORARIA ────────────────────────────────────────────────────

  const CFG = {
    HORAS_ALMUERZO:        1,
    HORAS_ALMUERZO_SAB:    0.5,  // sábado: 30 min (solo sábados)
    MINUTOS_ALMUERZO_SAB:  30,
    HORAS_TOPE_SEMANA:     44,   // objetivo no-fijos
    HORAS_SEMANA_NORMAL:   47,   // fijos (lun-vie 8h + sáb 7h)
    HORAS_SEMANA_FESTIVO:  46,   // fijos con lunes festivo
    HORAS_FESTIVO_SEMANA:  7,    // festivo entre semana cuenta 7h en Σ
    HORAS_SAB:             7,    // sábado efectivas
    HORAS_DIA_NORMAL:      8,    // lun-vie normal
    AJUSTES_SEMANA_NORMAL: 3,    // no-fijos semana normal
    AJUSTES_SEMANA_FESTIVO:2,    // no-fijos semana con lunes festivo
    AM_NORMAL:  '9',
    AM_SABADO:  '930',           // entrada sábado 9:30 (celda am)
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

  /**
   * Lista maestra. Orden = filas en la planilla, agrupadas por equipo (color).
   * type: 'fijo' | 'no-fijo'
   *
   * IDs idénticos a Firestore y atributos data-cell del DOM actual.
   */
  const EMPLEADOS = [
    // Team 1 — mensajeros (azul)
    { id: 'harold_paipa',      name: 'HAROLD PAIPA',      type: 'no-fijo' },
    { id: 'diego_lozano',      name: 'DIEGO LOZANO',      type: 'no-fijo' },
    { id: 'dilan_toro',        name: 'DILAN TORO',         type: 'no-fijo' },
    // Team 2 — Santiago / Miguel / Juan (morado)
    { id: 'santiago_guarnizo', name: 'SANTIAGO GUARNIZO', type: 'no-fijo' },
    { id: 'miguel_fonseca',    name: 'MIGUEL FONSECA',    type: 'no-fijo' },
    { id: 'juan_giron',        name: 'JUAN GIRÓN',        type: 'fijo'    },
    // Team 3 — Brayan R / Brandon / Jesús (cyan)
    { id: 'brayan_ramirez',    name: 'BRAYAN RAMÍREZ',    type: 'fijo'    },
    { id: 'brandon',           name: 'BRANDON',           type: 'fijo'    },
    { id: 'jesus_perez',       name: 'JESÚS PÉREZ',       type: 'no-fijo' },
    // Team 4 — Jhonny / Cristian (amarillo)
    { id: 'jhonny_rodriguez',  name: 'JHONNY RODRÍGUEZ',  type: 'no-fijo' },
    { id: 'cristian_uribe',    name: 'CRISTIAN URIBE',    type: 'no-fijo' },
    // Team 5 — Brayan Yate / Mauricio (rosa)
    { id: 'brayan_yate',       name: 'BRAYAN YATE',       type: 'no-fijo' },
    { id: 'mauricio_bautista', name: 'MAURICIO BAUTISTA', type: 'no-fijo' },
    // Sin equipo de color
    { id: 'jhon_lozano',       name: 'JHON LOZANO',       type: 'fijo'    },
    { id: 'david_sanchez',     name: 'DAVID SÁNCHEZ',     type: 'no-fijo' },
    { id: 'jonathan_sanchez',  name: 'JONATHAN SÁNCHEZ',  type: 'fijo'    },
  ];

  // ─── GRUPOS / EQUIPOS ─────────────────────────────────────────────────────────

  /** Trío mensajería: rotación turnos, almuerzos escalonados 12/1/2, 44h/semana. */
  const GRUPO_MENSAJEROS = ['harold_paipa', 'diego_lozano', 'dilan_toro'];

  /** Equipos visuales en la planilla (colores de fila). Team 1 = mensajeros. */
  const TEAM_MENSAJEROS = GRUPO_MENSAJEROS;
  const TEAM_2 = ['santiago_guarnizo', 'miguel_fonseca', 'juan_giron'];
  const TEAM_3 = ['brayan_ramirez', 'brandon', 'jesus_perez'];
  const TEAM_4 = ['jhonny_rodriguez', 'cristian_uribe'];
  const TEAM_5 = ['brayan_yate', 'mauricio_bautista'];

  /** Clase CSS de equipo por empleado (planilla turnos / almuerzos). */
  const teamClassForEmpId = (empId) => {
    if (TEAM_MENSAJEROS.includes(empId)) return 'team-mensajeros';
    if (TEAM_2.includes(empId)) return 'team-2';
    if (TEAM_3.includes(empId)) return 'team-3';
    if (TEAM_4.includes(empId)) return 'team-4';
    if (TEAM_5.includes(empId)) return 'team-5';
    return '';
  };

  /**
   * Mapa id → índice de fila en la matriz PATRON_TRIO.
   * Harold=0, Dilan=1, Diego=2 (mismo orden que el código original).
   */
  const TRIO_ROW_BY_ID = {
    harold_paipa: 0,
    dilan_toro:   1,
    diego_lozano: 2,
  };

  /** Dúo despacho: almuerzos alternos, Jesús cubre mensajería si hay ausente. */
  const DUO_DESPACHO = ['juan_giron', 'jesus_perez'];

  /**
   * Dúo Santiago / Miguel:
   * - No pueden tener ambos am=10 ni ambos pm=5 el mismo día.
   * - Almuerzos 12/1 según quién entra a las 10; John cubre a las 2.
   */
  const DUO_SANTIAGO_MIGUEL = ['santiago_guarnizo', 'miguel_fonseca'];

  /**
   * Dúo Brayan Yate / Mauricio:
   * - Mismas restricciones cruzadas de ajuste que Santiago/Miguel.
   * - Almuerzos fijos: Mauricio 1:00, Brayan Yate 3:00.
   * - Los ajustes no modifican sus almuerzos.
   */
  const DUO_BRAYAN_MAURICIO = ['brayan_yate', 'mauricio_bautista'];

  /**
   * Dúo cobertura cruzada:
   * - Johnny pm5 mié-jue-vie obligatorio; nunca am=10.
   * - Brayan Ramírez: fijo, sin ajuste.
   * - Si falta uno, Christian cubre al otro durante el almuerzo.
   */
  const DUO_JOHNNY_BRAYAN = ['jhonny_rodriguez', 'brayan_ramirez'];

  /** Fijos: nunca am=10 ni pm=5 lun-vie. Sábado 9:30/5 (excepto Jonathan → 9/5). */
  const GRUPO_FIJO = ['jhon_lozano', 'juan_giron', 'brayan_ramirez', 'brandon', 'jonathan_sanchez'];

  /** Sábado: entrada 9:00 (no 9:30) y almuerzo de 1 h (no 30 min). */
  const EXCEPCION_SABADO_ENTRADA_9 = ['jonathan_sanchez', 'david_sanchez'];
  const IDS_SABADO_ENTRADA_9 = new Set(EXCEPCION_SABADO_ENTRADA_9);

  const usaEntradaSabadoNueve = (empId) => IDS_SABADO_ENTRADA_9.has(empId);
  const usaAlmuerzoHoraSabado = (empId) => IDS_SABADO_ENTRADA_9.has(empId);

  /** No-fijos: deben llegar a exactamente 44h/semana. */
  const GRUPO_NO_FIJO = EMPLEADOS.filter(e => e.type === 'no-fijo').map(e => e.id);

  // Sets para O(1) lookup
  const IDS_FIJO       = new Set(GRUPO_FIJO);
  const IDS_MENSAJEROS = new Set(GRUPO_MENSAJEROS);
  const IDS_NO_FIJO    = new Set(GRUPO_NO_FIJO);

  // Todos los no-fijos que van en grupos de turno (afectan enforces cruzados)
  const GRUPOS_TURNO = [GRUPO_MENSAJEROS, DUO_SANTIAGO_MIGUEL, DUO_BRAYAN_MAURICIO];
  const IDS_TURNO    = new Set([...GRUPO_MENSAJEROS, ...DUO_SANTIAGO_MIGUEL, ...DUO_BRAYAN_MAURICIO]);

  // ─── ALMUERZOS FIJOS ─────────────────────────────────────────────────────────

  /**
   * Empleados con horario de almuerzo invariable.
   * Los que no están aquí tienen lógica propia en lunch-engine.js.
   */
  const ALMUERZO_FIJO = {
    'jhon_lozano':       '2:00',   // fijo
    'brayan_ramirez':    '12:00',  // fijo (cubre a Johnny mientras almuerza)
    'brandon':           '1:00',   // fijo
    'jonathan_sanchez':  '1:00',   // fijo
    'jhonny_rodriguez':  '1:00',   // equipo Johnny/Brayan (fijo)
    'mauricio_bautista': '1:00',   // equipo Brayan Yate/Mauricio (fijo)
    'brayan_yate':       '3:00',   // equipo Brayan Yate/Mauricio (fijo)
    'david_sanchez':     '1:00',   // independiente, almuerzo fijo 1:00
  };

  // ─── RESTRICCIONES DE AJUSTE POR EMPLEADO ────────────────────────────────────

  /**
   * puedeEntrarDiez: puede tener am=10 (ajuste entrada).
   * puedeSalirCinco: puede tener pm=5 (ajuste salida).
   *
   * Johnny: nunca am=10, pero sí pm=5 (mié-jue-vie obligatorio).
   * David Sánchez: igual que Cristian — ajustes libres en ambas direcciones.
   */
  const RESTRICCIONES_AJUSTE = {
    'harold_paipa':      { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'diego_lozano':      { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'dilan_toro':        { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'santiago_guarnizo': { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'miguel_fonseca':    { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'cristian_uribe':    { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'jesus_perez':       { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'jhonny_rodriguez':  { puedeEntrarDiez: false, puedeSalirCinco: true  },
    'brayan_yate':       { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'mauricio_bautista': { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    'david_sanchez':     { puedeEntrarDiez: true,  puedeSalirCinco: true  },
    // Fijos — sin ajuste
    'jhon_lozano':       { puedeEntrarDiez: false, puedeSalirCinco: false },
    'juan_giron':        { puedeEntrarDiez: false, puedeSalirCinco: false },
    'brayan_ramirez':    { puedeEntrarDiez: false, puedeSalirCinco: false },
    'brandon':           { puedeEntrarDiez: false, puedeSalirCinco: false },
    'jonathan_sanchez':  { puedeEntrarDiez: false, puedeSalirCinco: false },
  };

  // ─── ALMUERZOS PERMITIDOS POR GRUPO ──────────────────────────────────────────

  const ALMUERZOS_MENSAJEROS      = ['12:00', '1:00', '2:00'];
  /** Sábado: franjas de 30 min (trío mensajeros). */
  const ALMUERZOS_SABADO          = ['12:00-12:30', '12:30-1:00', '1:00-1:30'];
  const ALMUERZOS_DESPACHO        = ['12:00', '1:00'];
  const ALMUERZOS_SANTIAGO_MIGUEL = ['12:00', '1:00'];

  // ─── FORMATO NOMBRE (columna empleado) ────────────────────────────────────────

  /** Nombre + apellido(s) en HTML para columna fija (móvil: apellido debajo). */
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

  // ─── EXPORT ───────────────────────────────────────────────────────────────────

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
    teamClassForEmpId,
    TRIO_ROW_BY_ID,
    DUO_DESPACHO,
    DUO_SANTIAGO_MIGUEL,
    DUO_BRAYAN_MAURICIO,
    DUO_JOHNNY_BRAYAN,
    GRUPO_FIJO,
    GRUPO_NO_FIJO,
    IDS_FIJO,
    IDS_MENSAJEROS,
    IDS_NO_FIJO,
    GRUPOS_TURNO,
    IDS_TURNO,
    ALMUERZO_FIJO,
    RESTRICCIONES_AJUSTE,
    ALMUERZOS_MENSAJEROS,
    ALMUERZOS_SABADO,
    ALMUERZOS_DESPACHO,
    ALMUERZOS_SANTIAGO_MIGUEL,
    EXCEPCION_SABADO_ENTRADA_9,
    IDS_SABADO_ENTRADA_9,
    usaEntradaSabadoNueve,
    usaAlmuerzoHoraSabado,
    formatEmpNameHtml,
  };

  window.ENGINE_CONSTANTS = ENGINE_CONSTANTS;

})();
