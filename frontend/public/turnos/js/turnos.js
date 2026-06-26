/**
 * turnos.js
 * Orquestador de la planilla de turnos mensual.
 * Delega toda la lógica de reglas en window.ENGINE_*.
 * Comparte la colección Firestore "programacionAlmuerzos" con la página original.
 */
(function () {
  'use strict';

  const READ_ONLY = window.TURNOS_READ_ONLY === true;

  // ── ALIASES ENGINE ─────────────────────────────────────────────────────────

  const {
    CFG, EMPLEADOS,
    GRUPO_MENSAJEROS, GRUPO_FIJO,
    IDS_FIJO, IDS_MENSAJEROS,
    DUO_SANTIAGO_MIGUEL, DUO_JESUS_BRANDON, DUO_BRAYAN_MAURICIO,
    formatEmpNameHtml,
    teamClassForEmpId,
  } = window.ENGINE_CONSTANTS;

  const fmtEmpName = typeof formatEmpNameHtml === 'function'
    ? formatEmpNameHtml
    : (fullName) => String(fullName || '');

  const teamClassFor = teamClassForEmpId;

  const {
    getMonthMeta,
    buildWeekChunks,
    findChunkEndingAtSaturday,
    countSabadosLaborables,
    pad2,
    esChunkCompleto,
    adjacentMonthKeys,
  } = window.ENGINE_CALENDAR;

  const {
    getDisplayedHours,
    sumWeekHours,
    computeMonthlyExtras,
    esDiaMarcadoNoLab,
    esAusenteTrio,
    esEntradaAusenteCero,
    esAusenteEntradaCeroRaw,
    normAm,
    normPm,
    isEntradaSabado,
    formatAmDisplay,
  } = window.ENGINE_HOURS;

  const isEntradaDiez = (v) => normAm({ am: v }) === '10';
  const isSalidaCinco = (v) => normPm({ pm: v }) === '5';

  const isManualAseoToken = (raw) => /^9\s*A$/i.test(String(raw ?? '').trim());
  const isManualCocinaToken = (raw) => /^9\s*C$/i.test(String(raw ?? '').trim());
  const isManualBasuraToken = (raw) => /^6\s*B$/i.test(String(raw ?? '').trim());

  /** Normaliza am guardado en state (9 · 10 · 930) para elegibilidad aseo/basura. */
  const normalizeCellAm = (raw) => {
    const v = String(raw ?? '').trim();
    if (v === '') return '';
    if (isManualAseoToken(v) || isManualCocinaToken(v)) return '9';
    if (esAusenteEntradaCeroRaw(v)) return '0';
    const parsed = normAm({ am: v });
    if (parsed === null) return v;
    if (parsed === 9.5 || isEntradaSabado(v)) return CFG.AM_SABADO;
    if (parsed === 10) return '10';
    if (parsed === 9) return '9';
    return v;
  };

  const normalizeCellPm = (raw) => {
    const v = String(raw ?? '').trim();
    if (v === '') return '';
    if (isManualBasuraToken(v)) return '6';
    const parsed = normPm({ pm: v });
    if (parsed === 17) return '5';
    if (parsed === 18) return '6';
    return v;
  };

  const getAseoOverrideEmp = (day) =>
    state.aseoOverrides?.[day] ?? state.aseoOverrides?.[String(day)] ?? null;

  const getBasuraOverrideEmp = (day) =>
    state.basuraOverrides?.[day] ?? state.basuraOverrides?.[String(day)] ?? null;

  const getCocinaOverrideEmp = (day) =>
    state.cocinaOverrides?.[day] ?? state.cocinaOverrides?.[String(day)] ?? null;

  const amDisplayForCell = (empId, d, c) => {
    if (getAseoOverrideEmp(d.day) === empId) return '9A';
    if (getCocinaOverrideEmp(d.day) === empId) return '9C';
    return formatAmDisplay(c.am) || '';
  };

  const pmDisplayForCell = (empId, d, c) => {
    if (getBasuraOverrideEmp(d.day) === empId) return '6B';
    return c.pm || '';
  };

  /** Recalcula aseo/basura (dependen de am/pm actuales) y repinta. */
  const refreshAseoBasuraFromDom = () => {
    collectFromDom();
    render(true);
  };

  const { buildAseoRecepcionPorDia, isAseoRecepcionDia, horaAseoRecepcion } = window.ENGINE_RECEPCION_ASEO;
  const { buildCocinaRecepcionPorDia, isCocinaRecepcionDia, horaCocinaRecepcion } = window.ENGINE_RECEPCION_COCINA;
  const { buildBasuraPorDia, isBasuraSacadaDia }         = window.ENGINE_SACADA_BASURA;

  const openTdAmPm = (marcado, rowKind, c, dayMeta, flags = {}) => {
    const { isAseo, isCocina, isBasura } = flags;
    if (marcado) return '<td class="celda-dia-marcado-naranja">';
    if (isAseo && rowKind === 'am') {
      const hr = horaAseoRecepcion(!!dayMeta?.esSabado);
      return `<td class="celda-aseo-recepcion" title="Aseo recepción ${hr}">`;
    }
    if (isCocina && rowKind === 'am') {
      const hr = horaCocinaRecepcion(!!dayMeta?.esSabado);
      return `<td class="celda-cocina-recepcion" title="Cocina ${hr}">`;
    }
    if (isBasura && rowKind === 'pm') {
      return '<td class="celda-sacada-basura" title="Sacada de basura 18:00">';
    }
    if (rowKind === 'am' && isEntradaDiez(c.am)) return '<td class="celda-ajuste-hora">';
    if (rowKind === 'am' && dayMeta?.esSabado && isEntradaSabado(c.am)) {
      return '<td class="celda-ajuste-hora" title="Entrada 9:30">';
    }
    if (rowKind === 'pm' && isSalidaCinco(c.pm) && !dayMeta?.esSabado) return '<td class="celda-ajuste-hora">';
    return '<td>';
  };

  const { ensureStateShape,
          applyPostCapRules,
          runMessengerForwardRepair,
          fillMissingCellsOnly,
          recalcExtras,
          step_normalizeSabadoEntrada } = window.ENGINE_SCHEDULER;
  const { buildLocksFromCells }     = window.ENGINE_PUT_CELL;
  const { getLunchDisplay,
          normalizeLunchTime,
          hasManualLunchOverride,
          purgeStaleLunchOverrides,
          shouldKeepLunchOverride }  = window.ENGINE_LUNCH;

  // ── CONSTANTES ─────────────────────────────────────────────────────────────

  const FORWARD_REPAIR_IDS = new Set([
    ...IDS_MENSAJEROS,
    ...DUO_SANTIAGO_MIGUEL,
    ...DUO_JESUS_BRANDON,
    ...DUO_BRAYAN_MAURICIO,
  ]);
  const COLLECTION  = 'programacionAlmuerzos';
  /** Documentos anteriores guardaban locks de todas las celdas; solo respetar locks explícitos. */
  const LOCK_POLICY = 'explicit-only';
  const COL_PHONES  = 'empleadosTelefonos';
  const NO_LAB_MARK = CFG.NO_LAB_MARK;
  const DIAS_SEMANA = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const DIAS_LARGO  = ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'];

  // ── ESTADO ─────────────────────────────────────────────────────────────────

  let state = {
    monthKey:             '',
    horasExtras:          {},
    cells:                {},
    lunchOverrides:       {},
    aseoOverrides:        {},
    cocinaOverrides:      {},
    basuraOverrides:      {},
    flagsDiaMarcadoNoLab: {},
    trioAusentePorDia:    {},
    manualAmPmLocks:      {},
    crossMonthCells:      {},
  };

  // ── HELPERS DOM ────────────────────────────────────────────────────────────

  const el       = (id) => document.getElementById(id);
  const setStatus = (msg, kind) => {
    const n = el('progStatus');
    if (!n) return;
    n.textContent = msg;
    n.className   = kind ? kind : '';
  };

  const monthKeyFromDate = (d = new Date()) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

  const getActiveMonthKey = () => {
    const raw = el('monthPicker')?.value?.trim();
    if (raw && /^\d{4}-\d{2}$/.test(raw)) return raw;
    if (state.monthKey && /^\d{4}-\d{2}$/.test(String(state.monthKey))) return state.monthKey;
    return monthKeyFromDate();
  };

  const syncMonthPicker = (monthKey) => {
    const mp = el('monthPicker');
    if (!mp || !monthKey) return;
    try { mp.value = monthKey; } catch (_) { /* Safari iOS */ }
  };

  const cloneCells = (cells) => JSON.parse(JSON.stringify(cells || {}));
  const cloneJson = (obj) => JSON.parse(JSON.stringify(obj || {}));

  const ensureManualLocks = () => {
    if (!state.manualAmPmLocks) state.manualAmPmLocks = {};
  };

  const lockAmPmField = (empId, day, field) => {
    if (!empId || day == null || (field !== 'am' && field !== 'pm')) return;
    ensureManualLocks();
    if (!state.manualAmPmLocks[empId]) state.manualAmPmLocks[empId] = {};
    if (!state.manualAmPmLocks[empId][day]) state.manualAmPmLocks[empId][day] = {};
    state.manualAmPmLocks[empId][day][field] = true;
  };

  const lockVisibleAmPmFromDom = () => {
    const wrap = el('sheetWrap');
    if (!wrap) return;
    wrap.querySelectorAll('.cell-in[data-cell]').forEach((inp) => {
      const raw = inp.getAttribute('data-cell') || '';
      const m = /^(.+)-(\d+)-(am|pm)$/.exec(raw);
      if (!m || !inp.value.trim()) return;
      lockAmPmField(m[1], Number(m[2]), m[3]);
    });
  };

  const refreshManualLocksFromCells = (meta) => {
    state.manualAmPmLocks = buildLocksFromCells(
      state.cells,
      meta,
      EMPLEADOS,
      state.manualAmPmLocks
    );
  };

  /** Ignora manualAmPmLocks heredados que congelaban toda la planilla al guardar. */
  const normalizeLoadedLocks = (payload, monthKey) => {
    if (!payload || payload.lockPolicy === LOCK_POLICY) {
      return payload?.manualAmPmLocks
        ? JSON.parse(JSON.stringify(payload.manualAmPmLocks))
        : {};
    }
    const locks = payload.manualAmPmLocks;
    if (!locks || typeof locks !== 'object') return {};
    const meta = getMonthMeta(monthKey);
    let lockFields = 0;
    let laborableDays = 0;
    meta.days.forEach((d) => { if (!d.noLaborable) laborableDays++; });
    EMPLEADOS.forEach(({ id }) => {
      Object.keys(locks[id] || {}).forEach((dayStr) => {
        const fl = locks[id][dayStr];
        if (fl?.am) lockFields++;
        if (fl?.pm) lockFields++;
      });
    });
    const totalFields = Math.max(1, EMPLEADOS.length * laborableDays * 2);
    if (lockFields > totalFields * 0.15) {
      console.warn(
        `[turnos] ${monthKey}: ignorando ${lockFields} locks heredados; use TURNOS_DEBUG.regenerate() si hace falta.`
      );
      return {};
    }
    return JSON.parse(JSON.stringify(locks));
  };

  /** Restaura solo celdas que el usuario bloqueó manualmente (no toda la planilla). */
  const overlayLockedCells = (savedCells, locks) => {
    if (!savedCells || !locks) return;
    EMPLEADOS.forEach(({ id }) => {
      const empLocks = locks[id];
      if (!empLocks) return;
      Object.keys(empLocks).forEach((dayStr) => {
        const day   = Number(dayStr);
        const fl    = empLocks[dayStr] || empLocks[day];
        const saved = savedCells[id]?.[dayStr] ?? savedCells[id]?.[day];
        if (!saved || !fl) return;
        if (!state.cells[id]) state.cells[id] = {};
        const cur = state.cells[id][day] || { am: '', pm: '' };
        state.cells[id][day] = {
          am: fl.am ? String(saved.am ?? '') : cur.am,
          pm: fl.pm ? String(saved.pm ?? '') : cur.pm,
        };
      });
    });
  };

  const ingestCellsToCrossMonth = (cells, sourceMonthKey, targetMonthKey) => {
    if (!cells) return;
    const srcMeta = getMonthMeta(sourceMonthKey);
    const weeks   = buildWeekChunks(getMonthMeta(targetMonthKey));
    if (!state.crossMonthCells) state.crossMonthCells = {};

    weeks.forEach((week) => {
      week.forEach((d) => {
        if (d.inMonth) return;
        const srcDay = srcMeta.days.find((x) => x.ymd === d.ymd);
        if (!srcDay) return;
        EMPLEADOS.forEach(({ id }) => {
          const c = cells[id]?.[srcDay.day] ?? cells[id]?.[String(srcDay.day)];
          if (!c) return;
          if (!state.crossMonthCells[id]) state.crossMonthCells[id] = {};
          state.crossMonthCells[id][d.ymd] = {
            am: c.am != null ? String(c.am) : '',
            pm: c.pm != null ? String(c.pm) : '',
          };
        });
      });
    });
  };

  const loadAdjacentMonthCells = async (monthKey) => {
    const db = window.almuerzoDb;
    if (!db) return;
    state.crossMonthCells = {};
    const { prev, next } = adjacentMonthKeys(monthKey);
    for (const adjKey of [prev, next]) {
      try {
        let snap;
        try {
          snap = await db.collection(COLLECTION).doc(adjKey).get({ source: 'server' });
        } catch (_) {
          snap = await db.collection(COLLECTION).doc(adjKey).get({ source: 'cache' });
        }
        if (!snap.exists) continue;
        ingestCellsToCrossMonth(snap.data()?.cells, adjKey, monthKey);
      } catch (err) {
        console.warn('Turnos: no se pudo cargar mes adyacente', adjKey, err);
      }
    }
  };

  const rebalanceAfterCrossMonth = (monthKey) => {
    const meta = getMonthMeta(monthKey);
    applyPostCapRules(state, meta, monthKey);
    recalcExtras(state, monthKey);
  };

  let autoSaveTimer = null;
  const scheduleAutoSave = () => {
    if (READ_ONLY) return;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => { void saveToFirebase(true); }, 900);
  };

  let planillaSyncMonthKey = '';

  const applyRemotePlanilla = (monthKey, payload, meta) => {
    void applyPayload(monthKey, payload, { remote: !!meta?.remote });
  };

  const flushPendingPlanillaSync = () => {
    window.PLANILLA_FIRESTORE_SYNC?.flushPending?.(applyRemotePlanilla);
  };

  const startPlanillaLiveSync = (monthKey) => {
    const sync = window.PLANILLA_FIRESTORE_SYNC;
    if (!sync || !monthKey) return;
    if (planillaSyncMonthKey && planillaSyncMonthKey !== monthKey) {
      sync.unsubscribe(planillaSyncMonthKey);
    }
    planillaSyncMonthKey = monthKey;
    sync.subscribe(
      monthKey,
      applyRemotePlanilla,
      setStatus,
      { deferWhileEditing: false }
    );
  };

  // ── COLLECT FROM DOM ───────────────────────────────────────────────────────

  const collectFromDom = () => {
    const monthKey = getActiveMonthKey();
    const meta = getMonthMeta(monthKey);
    const wrap = el('sheetWrap');
    const q    = (sel) => (wrap ? wrap.querySelector(sel) : document.querySelector(sel));

    if (!state.lunchOverrides) state.lunchOverrides = {};

    const nextAseoOverrides    = {};
    const nextCocinaOverrides  = {};
    const nextBasuraOverrides  = {};

    EMPLEADOS.forEach((emp) => {
      if (!state.cells[emp.id]) state.cells[emp.id] = {};
      meta.days.forEach((d) => {
        const { day, noLaborable } = d;
        if (noLaborable) {
          state.cells[emp.id][day] = { am: '', pm: '' };
          if (state.lunchOverrides[emp.id]?.[day]) {
            delete state.lunchOverrides[emp.id][day];
            if (Object.keys(state.lunchOverrides[emp.id]).length === 0) {
              delete state.lunchOverrides[emp.id];
            }
          }
          if (state.flagsDiaMarcadoNoLab?.[emp.id]?.[day])
            delete state.flagsDiaMarcadoNoLab[emp.id][day];
          return;
        }
        const amIn = q(`input[data-cell="${emp.id}-${day}-am"]`);
        const pmIn = q(`input[data-cell="${emp.id}-${day}-pm"]`);
        const amRaw = amIn ? amIn.value.trim() : '';
        const pmRaw = pmIn ? pmIn.value.trim() : '';

        if (isManualAseoToken(amRaw)) nextAseoOverrides[day] = emp.id;
        if (isManualCocinaToken(amRaw)) nextCocinaOverrides[day] = emp.id;
        if (isManualBasuraToken(pmRaw)) nextBasuraOverrides[day] = emp.id;

        if (esAusenteEntradaCeroRaw(amRaw)) {
          state.cells[emp.id][day] = { am: '0', pm: '' };
        } else if (isManualAseoToken(amRaw) || isManualCocinaToken(amRaw)) {
          state.cells[emp.id][day] = {
            am: d.esSabado ? CFG.AM_SABADO : '9',
            pm: normalizeCellPm(pmRaw),
          };
        } else {
          state.cells[emp.id][day] = {
            am: normalizeCellAm(amRaw),
            pm: normalizeCellPm(pmRaw),
          };
        }

        const lunchIn = q(`input[data-cell="${emp.id}-${day}-lunch"]`);
        if (!lunchIn) return;
        const raw = lunchIn.value.trim();
        if (!raw) {
          if (state.lunchOverrides[emp.id]?.[day]) {
            delete state.lunchOverrides[emp.id][day];
            if (Object.keys(state.lunchOverrides[emp.id]).length === 0) {
              delete state.lunchOverrides[emp.id];
            }
          }
          return;
        }
        const normalized = normalizeLunchTime(raw);
        if (!state.lunchOverrides[emp.id]) state.lunchOverrides[emp.id] = {};
        state.lunchOverrides[emp.id][day] = normalized;
        if (!shouldKeepLunchOverride(emp.id, d, monthKey, state, meta)) {
          delete state.lunchOverrides[emp.id][day];
          if (Object.keys(state.lunchOverrides[emp.id]).length === 0) {
            delete state.lunchOverrides[emp.id];
          }
        }
      });
    });

    state.aseoOverrides   = nextAseoOverrides;
    state.cocinaOverrides = nextCocinaOverrides;
    state.basuraOverrides = nextBasuraOverrides;
    state.monthKey = monthKey;
    recalcExtras(state, monthKey);
  };

  // ── RENDER THEAD ───────────────────────────────────────────────────────────

  const renderThead = (meta) => {
    let row = `<th class="sticky-corner-thead" scope="colgroup">Nº día</th>
      <th class="he-head" scope="colgroup">H.ext.</th>`;
    meta.days.forEach((d) => {
      const tag = d.noLaborable ? (d.dow === 0 ? 'Domingo' : 'Festivo') : '';
      row += `<th class="day-head thead-one-row ${d.noLaborable ? 'nl' : ''}" scope="col" title="${d.ymd}">
        <div class="dh-num">${d.day}</div>
        <div class="dh-dow-sm">${DIAS_SEMANA[d.dow]}</div>
        <div class="dow-long">${DIAS_LARGO[d.dow]}</div>
        ${tag ? `<span class="dh-tag">${tag}</span>` : ''}
      </th>`;
      if (d.dow === 6) row += `<th class="week-sum-head" scope="col">Σ</th>`;
    });
    return `<tr class="thead-r1">${row}</tr>`;
  };

  // ── RENDER CELDAS ──────────────────────────────────────────────────────────

  const renderDayCells = (empId, rowKind, meta, monthKey, chunks, aseoMap, cocinaMap, basuraMap) => {
    const empLabel = EMPLEADOS.find(e => e.id === empId)?.name || empId;
    const roVal = (v) => {
      const t = formatAmDisplay(v);
      return t || '–';
    };
    let html = '';

    meta.days.forEach((d) => {
      const c       = state.cells[empId]?.[d.day] || { am: '', pm: '' };
      const ausente = !d.noLaborable && esAusenteTrio(state, empId, d.day);
      const noLab   = !d.noLaborable && esDiaMarcadoNoLab(state, empId, d.day);
      const ausenteCero = !d.noLaborable && esEntradaAusenteCero(c);
      const marcado = ausente || noLab || ausenteCero;
      const oCls    = marcado ? ' celda-dia-marcado-naranja' : '';
      const isAseo   = isAseoRecepcionDia(aseoMap, empId, d.day)
        || getAseoOverrideEmp(d.day) === empId;
      const isCocina = isCocinaRecepcionDia(cocinaMap, empId, d.day)
        || getCocinaOverrideEmp(d.day) === empId;
      const isBasura = isBasuraSacadaDia(basuraMap, empId, d.day)
        || getBasuraOverrideEmp(d.day) === empId;
      const tdFlags  = { isAseo, isCocina, isBasura };

      if (rowKind === 'am') {
        if (d.noLaborable) {
          html += `<td class="nl">${NO_LAB_MARK}</td>`;
        } else if (isAseo) {
          html += `${openTdAmPm(marcado, 'am', c, d, tdFlags)}
            <div class="celda-aseo-inner">
              <span class="aseo-in-label">Aseo</span>
              ${READ_ONLY
                ? `<span class="cell-readonly" aria-label="${empLabel} día ${d.day} aseo">${amDisplayForCell(empId, d, c) || '–'}</span>`
                : `<input type="text" inputmode="text" class="cell-in"
                data-cell="${empId}-${d.day}-am" value="${amDisplayForCell(empId, d, c)}"
                title="9A = aseo manual este día"
                aria-label="${empLabel} día ${d.day} aseo recepción ${horaAseoRecepcion(!!d.esSabado)}" />`}
            </div></td>`;
        } else if (isCocina) {
          html += `${openTdAmPm(marcado, 'am', c, d, tdFlags)}
            <div class="celda-cocina-inner">
              <span class="cocina-in-label">Cocina</span>
              ${READ_ONLY
                ? `<span class="cell-readonly" aria-label="${empLabel} día ${d.day} cocina">${amDisplayForCell(empId, d, c) || '–'}</span>`
                : `<input type="text" inputmode="text" class="cell-in"
                data-cell="${empId}-${d.day}-am" value="${amDisplayForCell(empId, d, c)}"
                title="9C = cocina manual este día"
                aria-label="${empLabel} día ${d.day} cocina ${horaCocinaRecepcion(!!d.esSabado)}" />`}
            </div></td>`;
        } else {
          html += `${openTdAmPm(marcado, 'am', c, d, tdFlags)}
            ${READ_ONLY
              ? `<span class="cell-readonly" aria-label="${empLabel} día ${d.day} entrada">${amDisplayForCell(empId, d, c) || roVal(c.am)}</span>`
              : `<input type="text" inputmode="text" class="cell-in"
              data-cell="${empId}-${d.day}-am" value="${amDisplayForCell(empId, d, c)}"
              title="9A = aseo · 9C = cocina manual"
              aria-label="${empLabel} día ${d.day} entrada" />`}</td>`;
        }

      } else if (rowKind === 'pm') {
        if (d.noLaborable) {
          html += `<td class="nl">${NO_LAB_MARK}</td>`;
        } else if (isBasura) {
          html += `${openTdAmPm(marcado, 'pm', c, d, tdFlags)}
            <div class="celda-basura-inner">
              <span class="basura-in-label">Basura</span>
              ${READ_ONLY
                ? `<span class="cell-readonly" aria-label="${empLabel} día ${d.day} basura">${pmDisplayForCell(empId, d, c) || '–'}</span>`
                : `<input type="text" inputmode="text" class="cell-in"
                data-cell="${empId}-${d.day}-pm" value="${pmDisplayForCell(empId, d, c)}"
                title="6B = basura manual este día"
                aria-label="${empLabel} día ${d.day} sacada de basura 18:00" />`}
            </div></td>`;
        } else {
          html += `${openTdAmPm(marcado, 'pm', c, d, tdFlags)}
            ${READ_ONLY
              ? `<span class="cell-readonly" aria-label="${empLabel} día ${d.day} salida">${roVal(c.pm)}</span>`
              : `<input type="text" inputmode="text" class="cell-in"
              data-cell="${empId}-${d.day}-pm" value="${pmDisplayForCell(empId, d, c)}"
              title="6B = basura manual este día"
              aria-label="${empLabel} día ${d.day} salida" />`}</td>`;
        }

      } else if (rowKind === 'lunch') {
        if (d.noLaborable) {
          html += `<td class="nl">${NO_LAB_MARK}</td>`;
        } else {
          const txt    = getLunchDisplay(empId, d, monthKey, state, meta) || '';
          const manual = hasManualLunchOverride(empId, d, monthKey, state, meta);
          html += `<td class="lunch-cell${oCls}">
            ${READ_ONLY || !manual
              ? `<span class="lunch-time-txt cell-readonly">${txt || '–'}</span>`
              : `<input type="text" inputmode="text" class="cell-in cell-in-lunch"
              data-cell="${empId}-${d.day}-lunch"
              value="${txt}"
              placeholder="12:30"
              title="Almuerzo manual (solo si difiere del automático). Vacío = horario automático."
              aria-label="${empLabel} día ${d.day} almuerzo" />`}</td>`;
        }
      }

      if (d.dow === 6) {
        const ch  = findChunkEndingAtSaturday(meta, d, chunks);
        const sum = sumWeekHours(empId, ch, state);
        html += rowKind === 'lunch'
          ? `<td class="week-sum-cell">${sum}</td>`
          : `<td class="week-sum-cell week-sum-placeholder" aria-hidden="true"></td>`;
      }
    });

    return html;
  };

  // ── RENDER PRINCIPAL ───────────────────────────────────────────────────────

  const render = (skipEnsure = true) => {
    const monthKey = getActiveMonthKey();
    syncMonthPicker(monthKey);
    if (!skipEnsure) ensureStateShape(state, monthKey);

    const meta        = getMonthMeta(monthKey);
    const chunks      = buildWeekChunks(meta);
    const basuraMap    = buildBasuraPorDia(state, meta, monthKey);
    const aseoMap      = buildAseoRecepcionPorDia(state, meta, monthKey, basuraMap);
    const cocinaMap    = buildCocinaRecepcionPorDia(state, meta, monthKey, basuraMap, aseoMap);
    const wrap        = el('sheetWrap');
    if (!wrap) return;

    const prevScroll = wrap.querySelector('.sheet-scroll');
    const savedScrollTop  = prevScroll?.scrollTop  ?? 0;
    const savedScrollLeft = prevScroll?.scrollLeft ?? 0;

    const colCount = 2 + meta.days.length + countSabadosLaborables(meta);
    let body = '';

    EMPLEADOS.forEach((emp) => {
      const he   = computeMonthlyExtras(emp.id, chunks, state);
      const team = teamClassFor(emp.id);
      const tc   = team ? ` ${team}` : '';
      body += `
        <tr class="emp-block-start${tc}">
          <th class="sticky-left emp-name" rowspan="3" scope="rowgroup">${fmtEmpName(emp.name)}</th>
          <th class="he-cell" rowspan="3" scope="row">
            <span class="he-lbl">H.ext.</span>
            <span class="he-val">${he}</span>
          </th>
          ${renderDayCells(emp.id, 'am', meta, monthKey, chunks, aseoMap, cocinaMap, basuraMap)}
        </tr>
        <tr class="emp-lunch-row${tc}">
          ${renderDayCells(emp.id, 'lunch', meta, monthKey, chunks, aseoMap, cocinaMap, basuraMap)}
        </tr>
        <tr class="emp-pm-row${tc}">
          ${renderDayCells(emp.id, 'pm', meta, monthKey, chunks, aseoMap, cocinaMap, basuraMap)}
        </tr>
        <tr class="spacer"><td colspan="${colCount}"></td></tr>`;
    });

    wrap.innerHTML = `
      <div class="sheet-scroll" role="region" aria-label="Planilla de turnos" tabindex="0">
        <table class="sheet-table">
          <thead>${renderThead(meta)}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;

    const nextScroll = wrap.querySelector('.sheet-scroll');
    if (nextScroll) {
      nextScroll.scrollTop  = savedScrollTop;
      nextScroll.scrollLeft = savedScrollLeft;
    }

    attachListeners(wrap, monthKey);
  };

  // ── EVENT LISTENERS ────────────────────────────────────────────────────────

  const attachListeners = (wrap, monthKey) => {
    if (READ_ONLY) return;

    // Edición manual am/pm — trío/dúos reparan días siguientes; am/pm recalcula aseo/basura
    wrap.querySelectorAll('.cell-in:not(.cell-in-lunch)').forEach((inp) => {
      inp.addEventListener('change', () => {
        refreshAseoBasuraFromDom();
      });
      inp.addEventListener('blur', (ev) => {
        const raw = ev.target?.getAttribute('data-cell') || '';
        const m = /^(.+)-(\d+)-(am|pm)$/.exec(raw);
        if (!m) return;
        lockAmPmField(m[1], Number(m[2]), m[3]);
        collectFromDom();
        if (FORWARD_REPAIR_IDS.has(m[1])) {
          runMessengerForwardRepair(state, monthKey, Number(m[2]), m[1]);
        } else {
          rebalanceAfterCrossMonth(monthKey);
        }
        render(true);
        flushPendingPlanillaSync();
        scheduleAutoSave();
      });
    });

    wrap.querySelectorAll('.cell-in-lunch').forEach((inp) => {
      inp.addEventListener('blur', () => {
        collectFromDom();
        render(true);
        flushPendingPlanillaSync();
      });
    });

  };

  // ── FIREBASE: GUARDAR ──────────────────────────────────────────────────────

  const saveToFirebase = async (quiet = false) => {
    const db = window.almuerzoDb;
    if (!db) {
      if (!quiet) setStatus('Firebase no listo.', 'err');
      return false;
    }

    const monthKey = state.monthKey || getActiveMonthKey();
    const planillaRevision = Date.now();
    const sync = window.PLANILLA_FIRESTORE_SYNC;
    sync?.beginLocalSave?.(monthKey, planillaRevision);

    const btn = el('btnGuardarFirebase');
    const labelPrev = btn?.textContent || '';
    if (btn && !quiet) {
      btn.disabled = true;
      btn.textContent = 'Guardando…';
    }
    if (!quiet) setStatus('Guardando en Firebase…', '');

    try {
      if (document.activeElement?.classList?.contains('cell-in')) {
        document.activeElement.blur();
      }
      collectFromDom();
      lockVisibleAmPmFromDom();
      const meta = getMonthMeta(monthKey);

      const payload = {
        monthKey,
        lockPolicy:           LOCK_POLICY,
        horasExtras:          cloneJson(state.horasExtras),
        cells:                cloneCells(state.cells),
        lunchOverrides:       cloneJson(state.lunchOverrides),
        aseoOverrides:        cloneJson(state.aseoOverrides),
        cocinaOverrides:      cloneJson(state.cocinaOverrides),
        basuraOverrides:      cloneJson(state.basuraOverrides),
        flagsDiaMarcadoNoLab: cloneJson(state.flagsDiaMarcadoNoLab),
        trioAusentePorDia:    cloneJson(state.trioAusentePorDia),
        manualAmPmLocks:      cloneJson(state.manualAmPmLocks),
        planillaRevision,
        updatedAt:            firebase.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = db.collection(COLLECTION).doc(monthKey);
      await docRef.set(payload, { merge: true });

      const verifySnap = await docRef.get({ source: 'server' });
      const savedRev = verifySnap.data()?.planillaRevision;
      if (!verifySnap.exists || savedRev !== planillaRevision) {
        throw new Error('El servidor no confirmó el guardado.');
      }

      render(true);
      if (!quiet) setStatus('Guardado en Firebase correctamente.', 'ok');
      else setStatus('Cambios guardados automáticamente.', 'ok');
      return true;
    } catch (e) {
      console.error(e);
      if (!quiet) setStatus('Error al guardar. Revisa reglas Firestore.', 'err');
      return false;
    } finally {
      sync?.endLocalSave?.(monthKey);
      if (btn && !quiet) {
        btn.disabled = false;
        btn.textContent = labelPrev;
      }
    }
  };

  const handleGuardarClick = () => {
    void saveToFirebase();
  };

  // ── FIREBASE: CARGAR ───────────────────────────────────────────────────────

  const loadFromFirebase = async () => {
    await loadMonthOrGenerate(getActiveMonthKey());
  };

  const bootstrapEmptyMonth = async (monthKey) => {
    state = {
      monthKey,
      horasExtras:          {},
      cells:                {},
      lunchOverrides:       {},
      aseoOverrides:        {},
      cocinaOverrides:      {},
      basuraOverrides:      {},
      flagsDiaMarcadoNoLab: {},
      trioAusentePorDia:    {},
      manualAmPmLocks:      {},
      crossMonthCells:      {},
    };
    ensureStateShape(state, monthKey);
    await loadAdjacentMonthCells(monthKey);
    rebalanceAfterCrossMonth(monthKey);
    render(true);
    setStatus('Planilla lista.', '');
  };

  const loadMonthOrGenerate = async (monthKey) => {
    const db = window.almuerzoDb;
    if (!db) {
      setStatus('Firebase no listo.', 'err');
      return;
    }
    syncMonthPicker(monthKey);
    try {
      let snap;
      let fromCache = false;
      try {
        snap = await db.collection(COLLECTION).doc(monthKey).get({ source: 'server' });
      } catch (serverErr) {
        console.warn('Turnos: servidor Firestore no disponible, intentando caché local', serverErr);
        snap = await db.collection(COLLECTION).doc(monthKey).get({ source: 'cache' });
        fromCache = true;
      }
      if (!snap.exists) {
        await bootstrapEmptyMonth(monthKey);
        startPlanillaLiveSync(monthKey);
        return;
      }
      await applyPayload(monthKey, snap.data());
      window.PLANILLA_FIRESTORE_SYNC?.seedRevisionFromPayload?.(monthKey, snap.data());
      startPlanillaLiveSync(monthKey);
      if (fromCache) {
        setStatus(
          '⚠️ Planilla desde caché local — puede estar desactualizada. Conecte red y recargue (Ctrl+Shift+R).',
          'warn'
        );
        return;
      }
      setStatus(READ_ONLY ? 'Consulta — datos cargados.' : 'Datos cargados desde Firebase.', 'ok');
    } catch (e) {
      console.error('Turnos loadMonthOrGenerate', monthKey, e);
      const detail = e?.message ? String(e.message) : String(e);
      setStatus(`Error al cargar desde Firebase: ${detail}`, 'err');
    }
  };

  // ── APPLY PAYLOAD ──────────────────────────────────────────────────────────

  const applyPayload = async (monthKey, payload, options = {}) => {
    syncMonthPicker(monthKey);
    const savedCells = payload?.cells ? cloneCells(payload.cells) : null;
    const savedLocks = normalizeLoadedLocks(payload, monthKey);

    state = {
      monthKey,
      horasExtras:          {},
      cells:                {},
      lunchOverrides:       {},
      aseoOverrides:        {},
      cocinaOverrides:      {},
      basuraOverrides:      {},
      flagsDiaMarcadoNoLab: {},
      trioAusentePorDia:    {},
      manualAmPmLocks:      {},
      crossMonthCells:      {},
    };

    if (payload && typeof payload === 'object') {
      if (payload.aseoOverrides && typeof payload.aseoOverrides === 'object') {
        state.aseoOverrides = JSON.parse(JSON.stringify(payload.aseoOverrides));
      }
      if (payload.basuraOverrides && typeof payload.basuraOverrides === 'object') {
        state.basuraOverrides = JSON.parse(JSON.stringify(payload.basuraOverrides));
      }

      if (payload.cocinaOverrides && typeof payload.cocinaOverrides === 'object') {
        state.cocinaOverrides = JSON.parse(JSON.stringify(payload.cocinaOverrides));
      }

      if (payload.lunchOverrides) {
        Object.keys(payload.lunchOverrides).forEach((empId) => {
          if (!state.lunchOverrides[empId]) state.lunchOverrides[empId] = {};
          Object.keys(payload.lunchOverrides[empId]).forEach((dayStr) => {
            const day = Number(dayStr);
            const val = payload.lunchOverrides[empId][dayStr];
            if (val != null && String(val).trim() !== '') {
              state.lunchOverrides[empId][day] = normalizeLunchTime(val);
            }
          });
        });
      }

      if (savedCells) {
        Object.keys(savedCells).forEach((empId) => {
          Object.keys(savedCells[empId] || {}).forEach((dayStr) => {
            const day = Number(dayStr);
            const v   = savedCells[empId][dayStr];
            if (v?.lunch != null && String(v.lunch).trim() !== '') {
              const dMeta = getMonthMeta(monthKey).days.find((x) => x.day === day);
              if (dMeta && window.ENGINE_LUNCH?.isAutoComputedLunch?.(empId, dMeta)) return;
              if (!state.lunchOverrides[empId]) state.lunchOverrides[empId] = {};
              state.lunchOverrides[empId][day] = normalizeLunchTime(v.lunch);
            }
          });
        });
      }

      if (payload.flagsDiaMarcadoNoLab) {
        state.flagsDiaMarcadoNoLab = JSON.parse(JSON.stringify(payload.flagsDiaMarcadoNoLab));
      }

      GRUPO_MENSAJEROS.forEach((eid) => {
        const byD = state.flagsDiaMarcadoNoLab[eid];
        if (!byD) return;
        Object.keys(byD).forEach((dk) => {
          if (!byD[dk]) return;
          const dn = Number(dk);
          if (isNaN(dn)) return;
          if (!state.trioAusentePorDia[dn]) state.trioAusentePorDia[dn] = eid;
          delete byD[dk];
        });
      });

      if (payload.trioAusentePorDia) {
        Object.keys(payload.trioAusentePorDia).forEach((k) => {
          const day = Number(k);
          const v   = payload.trioAusentePorDia[k];
          if (!isNaN(day) && v && GRUPO_MENSAJEROS.includes(String(v))) {
            state.trioAusentePorDia[day] = String(v);
          }
        });
      }
    }

    purgeStaleLunchOverrides(state, monthKey);
    ensureStateShape(state, monthKey);
    overlayLockedCells(savedCells, savedLocks);
    state.manualAmPmLocks = savedLocks;

    await loadAdjacentMonthCells(monthKey);
    rebalanceAfterCrossMonth(monthKey);
    recalcExtras(state, monthKey);
    render(true);
  };

  // ── EXPORT EXCEL ───────────────────────────────────────────────────────────

  const exportExcel = () => {
    if (typeof XLSX === 'undefined') { setStatus('Librería Excel no cargada.', 'err'); return; }
    collectFromDom();
    const monthKey     = state.monthKey;
    const meta         = getMonthMeta(monthKey);
    const chunks       = buildWeekChunks(meta);
    const rows         = [];
    const satCols      = countSabadosLaborables(meta);
    const padHe        = meta.days.length + satCols;

    const h0 = ['','',''], h1 = ['','',''];
    meta.days.forEach((d) => {
      h0.push(String(d.day));
      h1.push(DIAS_LARGO[d.dow] + (d.noLaborable ? (d.dow === 0 ? ' · Dom' : ' · Fest') : ''));
      if (d.dow === 6) { h0.push('Σ'); h1.push('Lun–sáb'); }
    });
    rows.push(h0, h1);

    EMPLEADOS.forEach((emp) => {
      const rD = ['', 'Horas/día', ''];
      meta.days.forEach((d) => {
        const c = state.cells[emp.id]?.[d.day] || {};
        const h = getDisplayedHours(d, c, emp.id, state);
        rD.push(h === null ? NO_LAB_MARK : String(h));
        if (d.dow === 6) {
          const ch = findChunkEndingAtSaturday(meta, d, chunks);
          rD.push(String(sumWeekHours(emp.id, ch, state)));
        }
      });
      rows.push(rD);
      rows.push([emp.name, 'H.EXTRAS', String(computeMonthlyExtras(emp.id, chunks, state)),
                 ...Array(padHe).fill('')]);

      const rAm = ['', 'am', 'Entrada'];
      const rAl = ['', 'Alm.', '1h'];
      const rPm = ['', 'pm', 'Salida'];
      meta.days.forEach((d) => {
        const c = state.cells[emp.id]?.[d.day] || {};
        const nl = d.noLaborable;
        rAm.push(nl ? NO_LAB_MARK : (formatAmDisplay(c.am) || ''));
        rAl.push(nl ? NO_LAB_MARK : getLunchDisplay(emp.id, d, monthKey, state, meta));
        rPm.push(nl ? NO_LAB_MARK : (c.pm || ''));
        if (d.dow === 6) { rAm.push(''); rAl.push(''); rPm.push(''); }
      });
      rows.push(rAm, rAl, rPm, []);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Turnos');
    XLSX.writeFile(wb, `turnos_${monthKey}.xlsx`);
    setStatus('Excel descargado.', 'ok');
  };

  // ── PLANTILLA JUNIO ────────────────────────────────────────────────────────

  const applyJuneTurnTemplate = () => {
    const monthKey = getActiveMonthKey();
    if (!monthKey || Number(monthKey.split('-')[1]) !== 6) {
      setStatus('Selecciona un mes de junio y pulsa de nuevo.', 'warn');
      return;
    }
    const meta = getMonthMeta(monthKey);
    EMPLEADOS.forEach(({ id }) => {
      if (!state.cells[id]) state.cells[id] = {};
      meta.days.forEach((d) => { delete state.cells[id][d.day]; });
    });
    ensureStateShape(state, monthKey, buildJuneColMap(monthKey, meta));
    render(true);
    setStatus('Plantilla junio aplicada con rotación semanal del trío.', 'ok');
  };

  const buildJuneColMap = (monthKey, meta) => {
    const chunks = buildWeekChunks(meta);
    const map    = new Map();
    const hashUint = (s) => {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    };
    const rng32 = (seed) => {
      let a = seed >>> 0;
      return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a; t ^= t >>> 15; t = Math.imul(t, t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };
    const shuffleFive = (mk, wi) => {
      const rng = rng32((hashUint(mk) + Math.imul(wi, 0x9e3779b9)) >>> 0);
      const arr = [0,1,2,3,4];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    chunks.forEach((chunk, wi) => {
      const perm = esChunkCompleto(chunk) ? shuffleFive(monthKey, wi) : null;
      chunk.forEach((d) => {
        if (d.dow === 0) return;
        if (d.dow === 6) { map.set(d.day, 5); return; }
        map.set(d.day, perm ? perm[d.dow - 1] : d.dow - 1);
      });
    });
    return map;
  };

  // ── CAMBIO DE MES ──────────────────────────────────────────────────────────

  const handleMonthChange = () => {
    const mk = getActiveMonthKey();
    if (planillaSyncMonthKey && planillaSyncMonthKey !== mk) {
      window.PLANILLA_FIRESTORE_SYNC?.unsubscribe?.(planillaSyncMonthKey);
      planillaSyncMonthKey = '';
    }
    if (READ_ONLY) {
      void loadFromFirebase();
      return;
    }
    void loadMonthOrGenerate(mk);
  };

  // ── PRUEBAS V8 — DISPONIBILIDAD MENSAJEROS ───────────────────────────────

  const CF_PROBAR_DISP = 'https://us-central1-cajacentro-v6.cloudfunctions.net/probarDisponibilidadMensajeros';

  const fechaHoyInput = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const callProbarV8 = async (params) => {
    const url = new URL(CF_PROBAR_DISP);
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== '') url.searchParams.set(k, String(v));
    });
    setStatus('Enviando señal a V8…', '');
    try {
      const res = await fetch(url.toString(), { method: 'GET' });
      const data = await res.json();
      if (!data.ok && !data.skipped) {
        setStatus(data.error || data.v8?.error || 'Error al enviar señal.', 'err');
        return data;
      }
      if (data.skipped) {
        setStatus(data.reason || 'Envío omitido (configuración V8).', 'warn');
        return data;
      }
      if (data.modo === 'instantaneo') {
        const estado = data.disponible ? 'DISPONIBLE' : 'NO DISPONIBLE';
        setStatus(`V8 OK — M${data.mensajero} → ${estado}`, 'ok');
        return data;
      }
      const n = data.v8?.eventosGuardados ?? data.eventosGenerados ?? 0;
      setStatus(`V8 OK — ${n} evento(s) guardados (${data.fecha || ''})`, 'ok');
      return data;
    } catch (e) {
      console.error(e);
      setStatus('Error de red al contactar V8.', 'err');
      return null;
    }
  };

  const initPanelPruebasV8 = () => {
    const panel = el('panelPruebasV8');
    if (!panel) return;

    const fechaIn = el('testV8Fecha');
    if (fechaIn && !fechaIn.value) fechaIn.value = fechaHoyInput();

    el('btnTestSyncDia')?.addEventListener('click', () => {
      const fecha = el('testV8Fecha')?.value || fechaHoyInput();
      void callProbarV8({ accion: 'sync-dia', fecha });
    });

    panel.querySelectorAll('[data-test-disp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        void callProbarV8({
          accion: 'instant',
          mensajero: btn.getAttribute('data-mensajero'),
          disponible: btn.getAttribute('data-disponible'),
        });
      });
    });

    panel.querySelectorAll('[data-test-planilla]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fecha = el('testV8Fecha')?.value || fechaHoyInput();
        void callProbarV8({
          accion: 'planilla-dia',
          mensajero: btn.getAttribute('data-mensajero'),
          fecha,
        });
      });
    });
  };

  // ── WHATSAPP — TELÉFONOS Y PRUEBAS ───────────────────────────────────────

  const CF_PROBAR_WA = 'https://us-central1-cajacentro-v6.cloudfunctions.net/probarWhatsAppTareas';
  const WHATSAPP_RENDER_API = 'https://whatsapp-reminders-mzex.onrender.com';
  const WHATSAPP_TEST_PROXY = '/api/turnos/whatsapp-test';
  const WA_CONTACT_PRUEBA = { id: 'custom_prueba', name: 'PRUEBA' };

  const escapeHtml = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const whatsappTasksForEmp = (empId) => {
    const aseo = window.ENGINE_RECEPCION_ASEO?.ASEO_RECEPCION_IDS || [];
    const cocina = window.ENGINE_RECEPCION_COCINA?.COCINA_RECEPCION_IDS || [];
    const basura = window.ENGINE_SACADA_BASURA?.BASURA_SACADA_IDS || [];
    return {
      aseo: aseo.includes(empId),
      cocina: cocina.includes(empId),
      basura: basura.includes(empId),
    };
  };

  const whatsappEmpIds = () => {
    const aseo = window.ENGINE_RECEPCION_ASEO?.ASEO_RECEPCION_IDS || [];
    const cocina = window.ENGINE_RECEPCION_COCINA?.COCINA_RECEPCION_IDS || [];
    const basura = window.ENGINE_SACADA_BASURA?.BASURA_SACADA_IDS || [];
    const ids = [...new Set([...aseo, ...cocina, ...basura])];
    const order = Object.keys(window.ENGINE_CONSTANTS?.EMPLEADOS_WHATSAPP_DEFAULT || {});
    if (!order.length) return ids;
    return [...ids].sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  };

  const formatPhoneForInput = (stored) => {
    let s = String(stored || '').trim();
    if (s.startsWith('whatsapp:')) s = s.slice('whatsapp:'.length);
    return s;
  };

  const normalizeWhatsAppPhone = (raw) => {
    let s = String(raw || '').trim();
    if (!s) return '';
    if (s.startsWith('whatsapp:')) s = s.slice('whatsapp:'.length);
    const digits = s.replace(/\D/g, '');
    if (!digits) return '';
    if (s.startsWith('+') || digits.length > 10) {
      return `whatsapp:+${digits}`;
    }
    return `whatsapp:+57${digits}`;
  };

  const defaultWhatsAppPhone = (empId) =>
    formatPhoneForInput(window.ENGINE_CONSTANTS?.EMPLEADOS_WHATSAPP_DEFAULT?.[empId] || '');

  const renderWhatsAppTaskBadges = (empId) => {
    const tasks = whatsappTasksForEmp(empId);
    const badges = [];
    if (tasks.aseo) badges.push('<span class="wa-badge wa-badge-aseo">Aseo</span>');
    if (tasks.cocina) badges.push('<span class="wa-badge wa-badge-cocina">Cocina-Pasillo</span>');
    if (tasks.basura) badges.push('<span class="wa-badge wa-badge-basura">Basura</span>');
    if (!badges.length) return '';
    return `<span class="wa-task-badges">${badges.join('')}</span>`;
  };

  const empNameById = (empId) => {
    const found = EMPLEADOS.find((e) => e.id === empId);
    return found?.name || empId;
  };

  const isCustomContactId = (id) => String(id || '').startsWith('custom_');
  const isPinnedCustomId = (id) => id === WA_CONTACT_PRUEBA.id;

  const renderPruebaContactRow = (contact = {}) => {
    const phone = formatPhoneForInput(contact.phone || '');
    return `
      <div class="wa-phone-row wa-phone-row-pinned" data-wa-row="custom" data-wa-id="${WA_CONTACT_PRUEBA.id}" data-wa-pinned="true">
        <span class="wa-phone-name wa-phone-name-fixed">${escapeHtml(WA_CONTACT_PRUEBA.name)}</span>
        <span class="wa-task-badges">
          <span class="wa-badge wa-badge-aseo">Aseo</span>
          <span class="wa-badge wa-badge-cocina">Cocina</span>
          <span class="wa-badge wa-badge-basura">Basura</span>
        </span>
        <input type="tel" class="wa-phone-input" data-wa-phone="${WA_CONTACT_PRUEBA.id}"
          value="${escapeHtml(phone)}" placeholder="+573001234567" autocomplete="tel"
          aria-label="Teléfono WhatsApp contacto PRUEBA" />
        <span class="wa-pinned-note">Fijo · pruebas manuales</span>
      </div>
    `;
  };

  const renderPlanillaPhoneRows = () => {
    const list = el('whatsappPhonesList');
    if (!list) return;
    list.innerHTML = whatsappEmpIds().map((empId) => `
      <div class="wa-phone-row" data-wa-row="planilla" data-wa-emp="${escapeHtml(empId)}">
        <span class="wa-phone-name">${escapeHtml(empNameById(empId))}</span>
        ${renderWhatsAppTaskBadges(empId)}
        <input type="tel" class="wa-phone-input" data-wa-phone="${empId}"
          value="${escapeHtml(defaultWhatsAppPhone(empId))}"
          placeholder="+573001234567" autocomplete="tel"
          aria-label="Teléfono WhatsApp ${escapeHtml(empNameById(empId))}" />
      </div>
    `).join('');
  };

  const renderCustomContactRow = (contact = {}) => {
    if (contact.id === WA_CONTACT_PRUEBA.id) return renderPruebaContactRow(contact);
    const id = contact.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return `
      <div class="wa-phone-row" data-wa-row="custom" data-wa-id="${escapeHtml(id)}">
        <input type="text" class="wa-phone-name-input" data-wa-name="${escapeHtml(id)}"
          value="${escapeHtml(contact.name || '')}" placeholder="Nombre"
          aria-label="Nombre contacto adicional" />
        <input type="tel" class="wa-phone-input" data-wa-phone="${escapeHtml(id)}"
          value="${escapeHtml(formatPhoneForInput(contact.phone || ''))}" placeholder="+573001234567" autocomplete="tel"
          aria-label="Teléfono contacto adicional" />
        <button type="button" class="wa-btn-remove" data-wa-remove="${escapeHtml(id)}"
          aria-label="Eliminar contacto">Quitar</button>
      </div>
    `;
  };

  const appendCustomContactRow = (contact = {}) => {
    const list = el('whatsappCustomList');
    if (!list) return;
    list.insertAdjacentHTML('beforeend', renderCustomContactRow(contact));
    syncWhatsAppContactSelect();
  };

  const renderPruebaContact = (contact = {}) => {
    const list = el('whatsappPruebaList');
    if (!list) return;
    list.innerHTML = renderPruebaContactRow(contact);
  };

  const renderCustomContactRows = (contacts = [], prueba = null) => {
    const pruebaData = prueba
      || contacts.find((c) => c.id === WA_CONTACT_PRUEBA.id)
      || WA_CONTACT_PRUEBA;
    renderPruebaContact(pruebaData);

    const list = el('whatsappCustomList');
    if (!list) return;
    const others = contacts.filter((c) => c.id !== WA_CONTACT_PRUEBA.id);
    list.innerHTML = others.map((c) => renderCustomContactRow(c)).join('');
    syncWhatsAppContactSelect();
  };

  const renderWhatsAppPhoneRows = () => {
    renderPlanillaPhoneRows();
  };

  const listQueryPhoneInput = (docId) =>
    document.querySelector(`input[data-wa-phone="${docId}"]`);

  const collectContactsFromDom = () => {
    const contacts = [];
    whatsappEmpIds().forEach((empId) => {
      const raw = String(listQueryPhoneInput(empId)?.value || '').trim();
      const phone = normalizeWhatsAppPhone(raw);
      if (phone) contacts.push({ id: empId, name: empNameById(empId), phone, custom: false });
    });
    document.querySelectorAll('[data-wa-row="custom"]').forEach((row) => {
      const id = row.getAttribute('data-wa-id');
      const pinned = row.getAttribute('data-wa-pinned') === 'true';
      const name = pinned
        ? WA_CONTACT_PRUEBA.name
        : String(row.querySelector('[data-wa-name]')?.value || '').trim();
      const raw = String(row.querySelector('[data-wa-phone]')?.value || '').trim();
      const phone = normalizeWhatsAppPhone(raw);
      if (id && (name || phone)) contacts.push({ id, name: name || id, phone, custom: true, pinned });
    });
    const pruebaRaw = String(listQueryPhoneInput(WA_CONTACT_PRUEBA.id)?.value || '').trim();
    const pruebaPhone = normalizeWhatsAppPhone(pruebaRaw);
    if (pruebaPhone) {
      const existing = contacts.find((c) => c.id === WA_CONTACT_PRUEBA.id);
      if (existing) existing.phone = pruebaPhone;
      else contacts.push({ id: WA_CONTACT_PRUEBA.id, name: WA_CONTACT_PRUEBA.name, phone: pruebaPhone, custom: true, pinned: true });
    }
    return contacts;
  };

  const syncContactsToRender = async (contacts) => {
    const toSync = contacts.filter((c) => c.phone);
    if (!toSync.length) return { synced: 0, failed: 0, results: [] };

    const results = await Promise.all(toSync.map(async (c) => {
      try {
        const res = await fetch(`${WHATSAPP_RENDER_API}/api/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: c.name, phone: c.phone }),
        });
        const data = await res.json().catch(() => ({}));
        return { id: c.id, ok: res.ok, status: res.status, error: data.error || null };
      } catch (e) {
        return { id: c.id, ok: false, status: 0, error: e.message || 'Error de red' };
      }
    }));

    return {
      synced: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    };
  };

  const syncWhatsAppContactSelect = () => {
    const select = el('waTestContactSelect');
    if (!select) return;
    const prev = select.value;
    const contacts = collectContactsFromDom().filter((c) => c.phone);
    select.innerHTML = '<option value="">— Selecciona contacto —</option>'
      + contacts.map((c) => {
        const label = `${c.name}${c.custom && !c.pinned ? ' (extra)' : ''} · ${formatPhoneForInput(c.phone)}`;
        return `<option value="${escapeHtml(c.id)}" data-phone="${escapeHtml(c.phone)}">${escapeHtml(label)}</option>`;
      }).join('');
    if (prev && [...select.options].some((o) => o.value === prev)) select.value = prev;
  };

  const loadWhatsAppPhones = async () => {
    const db = window.almuerzoDb;
    renderPlanillaPhoneRows();
    if (!db) return;
    try {
      const snap = await db.collection(COL_PHONES).get();
      const customContacts = [];
      let pruebaData = null;
      snap.forEach((doc) => {
        const data = doc.data() || {};
        const id = doc.id;
        if (data.custom === true || isCustomContactId(id)) {
          if (id === WA_CONTACT_PRUEBA.id) {
            pruebaData = { id, name: data.name || WA_CONTACT_PRUEBA.name, phone: data.phone || '' };
            return;
          }
          customContacts.push({ id, name: data.name || '', phone: data.phone || '' });
          return;
        }
        const input = listQueryPhoneInput(id);
        if (input) input.value = formatPhoneForInput(data.phone || defaultWhatsAppPhone(id));
      });
      renderCustomContactRows(customContacts, pruebaData);
    } catch (e) {
      console.error(e);
      renderCustomContactRows([]);
    }
  };

  const saveWhatsAppPhones = async () => {
    const db = window.almuerzoDb;
    if (!db) { setStatus('Firebase no listo.', 'err'); return; }
    const btn = el('btnSaveWhatsAppPhones');
    const labelPrev = btn?.textContent || '';
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
    setStatus('Guardando teléfonos…', '');
    try {
      const batch = db.batch();
      const keptCustomIds = new Set();

      whatsappEmpIds().forEach((empId) => {
        const raw = String(listQueryPhoneInput(empId)?.value || '').trim();
        const phone = normalizeWhatsAppPhone(raw);
        const ref = db.collection(COL_PHONES).doc(empId);
        if (phone) {
          batch.set(ref, {
            empId,
            name: empNameById(empId),
            phone,
            tasks: whatsappTasksForEmp(empId),
            custom: false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          const input = listQueryPhoneInput(empId);
          if (input) input.value = formatPhoneForInput(phone);
        } else {
          batch.delete(ref);
        }
      });

      document.querySelectorAll('[data-wa-row="custom"]').forEach((row) => {
        const id = row.getAttribute('data-wa-id');
        if (!id) return;
        keptCustomIds.add(id);
        const pinned = row.getAttribute('data-wa-pinned') === 'true';
        const name = pinned
          ? WA_CONTACT_PRUEBA.name
          : String(row.querySelector('[data-wa-name]')?.value || '').trim();
        const raw = String(row.querySelector('[data-wa-phone]')?.value || '').trim();
        const phone = normalizeWhatsAppPhone(raw);
        const ref = db.collection(COL_PHONES).doc(id);
        if (name || phone) {
          batch.set(ref, {
            empId: id,
            name: name || 'Contacto prueba',
            phone,
            custom: true,
            pinned,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          const phoneInput = row.querySelector('[data-wa-phone]');
          if (phoneInput && phone) phoneInput.value = formatPhoneForInput(phone);
        } else if (!pinned) {
          batch.delete(ref);
        }
      });

      {
        const pruebaRaw = String(listQueryPhoneInput(WA_CONTACT_PRUEBA.id)?.value || '').trim();
        const pruebaPhone = normalizeWhatsAppPhone(pruebaRaw);
        keptCustomIds.add(WA_CONTACT_PRUEBA.id);
        const pruebaRef = db.collection(COL_PHONES).doc(WA_CONTACT_PRUEBA.id);
        if (pruebaPhone) {
          batch.set(pruebaRef, {
            empId: WA_CONTACT_PRUEBA.id,
            name: WA_CONTACT_PRUEBA.name,
            phone: pruebaPhone,
            custom: true,
            pinned: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          const pruebaInput = listQueryPhoneInput(WA_CONTACT_PRUEBA.id);
          if (pruebaInput) pruebaInput.value = formatPhoneForInput(pruebaPhone);
        }
      }

      const existingCustom = await db.collection(COL_PHONES).where('custom', '==', true).get();
      existingCustom.forEach((doc) => {
        if (!keptCustomIds.has(doc.id) && !isPinnedCustomId(doc.id)) batch.delete(doc.ref);
      });

      await batch.commit();
      syncWhatsAppContactSelect();

      const contacts = collectContactsFromDom();
      const sync = await syncContactsToRender(contacts);
      if (sync.failed > 0) {
        setStatus(`Teléfonos en Firebase. Render: ${sync.synced} OK, ${sync.failed} fallaron (revisa consola).`, 'warn');
        console.warn('[WhatsApp] sync Render', sync.results);
      } else if (sync.synced > 0) {
        setStatus(`Teléfonos guardados (${sync.synced} contactos en Render).`, 'ok');
      } else {
        setStatus('Teléfonos guardados en Firebase.', 'ok');
      }
    } catch (e) {
      console.error(e);
      setStatus('Error al guardar teléfonos.', 'err');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = labelPrev; }
    }
  };

  const setWaPreview = (text) => {
    const out = el('waPreviewOut');
    if (out) out.textContent = text;
  };

  const resolveTaskMapsForDate = (fechaYmd) => {
    const monthKey = fechaYmd.slice(0, 7);
    const day = parseInt(fechaYmd.slice(8, 10), 10);
    const meta = getMonthMeta(monthKey);
    const basuraMap = buildBasuraPorDia(state, meta, monthKey);
    const aseoMap = buildAseoRecepcionPorDia(state, meta, monthKey, basuraMap);
    const cocinaMap = buildCocinaRecepcionPorDia(state, meta, monthKey, basuraMap, aseoMap);
    return { day, aseoMap, cocinaMap, basuraMap };
  };

  const resolveEmpIdForTaskOnDate = (task, fechaYmd) => {
    const { day, aseoMap, cocinaMap, basuraMap } = resolveTaskMapsForDate(fechaYmd);
    if (task === 'ASEO_RECEPCION') return aseoMap[day] || null;
    if (task === 'COCINA_RECEPCION') return cocinaMap[day] || null;
    if (task === 'SACAR_BASURA') return basuraMap[day] || null;
    return null;
  };

  const resolvePhoneForEmpId = async (empId) => {
    if (!empId) return '';
    const raw = String(listQueryPhoneInput(empId)?.value || '').trim();
    if (raw) return normalizeWhatsAppPhone(raw);
    const db = window.almuerzoDb;
    if (!db) return '';
    try {
      const doc = await db.collection(COL_PHONES).doc(empId).get();
      return normalizeWhatsAppPhone(doc.data()?.phone || '');
    } catch {
      return '';
    }
  };

  const sendWhatsAppViaProxy = async (phone, task, fecha) => {
    setStatus('Enviando WhatsApp…', '');
    try {
      const res = await fetch(WHATSAPP_TEST_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, task, date: fecha }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus(data.error || data.render?.error || 'Error WhatsApp.', 'err');
        setWaPreview(JSON.stringify(data, null, 2));
        return data;
      }
      setStatus(`WhatsApp OK — ${formatPhoneForInput(phone)} (${task})`, 'ok');
      setWaPreview(JSON.stringify(data, null, 2));
      return data;
    } catch (e) {
      console.error(e);
      setStatus('Error de red al enviar WhatsApp.', 'err');
      return null;
    }
  };

  const previewTaskLocal = async (task, fecha) => {
    if (task !== 'COCINA_RECEPCION') return null;
    const empId = resolveEmpIdForTaskOnDate(task, fecha);
    const phone = await resolvePhoneForEmpId(empId);
    return {
      empId: empId || null,
      phone: phone || null,
      reason: empId ? (phone ? null : 'sin teléfono en empleadosTelefonos') : 'sin cocina asignada ese día',
    };
  };

  const sendPlanillaWhatsApp = async (task) => {
    const fecha = el('testWaFecha')?.value || fechaHoyInput();
    if (task === 'COCINA_RECEPCION') {
      const empId = resolveEmpIdForTaskOnDate(task, fecha);
      const phone = await resolvePhoneForEmpId(empId);
      if (!empId) {
        setStatus('No hay cocina asignada ese día en la planilla.', 'warn');
        return;
      }
      if (!phone) {
        setStatus(`Sin teléfono para ${empNameById(empId)} (cocina del día).`, 'warn');
        return;
      }
      await sendWhatsAppViaProxy(phone, task, fecha);
      return;
    }
    void callProbarWhatsApp({ accion: 'enviar', task, fecha, force: '1' });
  };

  const callProbarWhatsApp = async (params) => {
    const url = new URL(CF_PROBAR_WA);
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== '') url.searchParams.set(k, String(v));
    });
    setStatus('Consultando WhatsApp…', '');
    try {
      const res = await fetch(url.toString(), { method: 'GET' });
      const data = await res.json();
      if (data.modo === 'direct') {
        if (!data.ok && !data.skipped) {
          setStatus(data.error || data.render?.error || 'Error WhatsApp.', 'err');
        } else if (data.skipped) {
          setStatus(data.reason || 'Envío omitido.', 'warn');
        } else {
          setStatus(`Prueba OK → ${data.phone} (${data.task})`, 'ok');
        }
        setWaPreview(JSON.stringify(data, null, 2));
        return data;
      }
      if (data.modo === 'preview') {
        const lines = [
          `Fecha: ${data.fecha}`,
          `ASEO → ${data.task === 'ASEO_RECEPCION' ? data.empId : '(ver tarea)'}`,
          `EmpId: ${data.empId || '—'}`,
          `Teléfono: ${data.phone || '—'}`,
          `Enviaría: ${data.wouldSend ? 'SÍ' : 'NO'}`,
          data.reason ? `Motivo: ${data.reason}` : '',
          data.configUrl ? `URL Render: ${data.configUrl}` : 'URL Render: (no configurada en Functions)',
        ].filter(Boolean);
        setWaPreview(lines.join('\n'));
        setStatus(data.wouldSend ? 'Vista previa OK — listo para enviar.' : 'Vista previa — no se enviaría.', data.wouldSend ? 'ok' : 'warn');
        return data;
      }
      if (!data.ok && !data.skipped) {
        setStatus(data.error || data.render?.error || 'Error WhatsApp.', 'err');
        setWaPreview(JSON.stringify(data, null, 2));
        return data;
      }
      if (data.skipped) {
        setStatus(data.reason || 'Envío omitido.', 'warn');
        setWaPreview(JSON.stringify(data, null, 2));
        return data;
      }
      setStatus(`WhatsApp OK — ${data.task} → ${data.phone || data.empId}`, 'ok');
      setWaPreview(JSON.stringify(data, null, 2));
      return data;
    } catch (e) {
      console.error(e);
      setStatus('Error de red al contactar WhatsApp.', 'err');
      return null;
    }
  };

  const previewWhatsAppDia = async () => {
    const fecha = el('testWaFecha')?.value || fechaHoyInput();
    setStatus('Vista previa…', '');
    try {
      const fetchPreview = async (task) => {
        const local = await previewTaskLocal(task, fecha);
        if (local) return local;
        const url = new URL(CF_PROBAR_WA);
        url.searchParams.set('accion', 'preview');
        url.searchParams.set('task', task);
        url.searchParams.set('fecha', fecha);
        const res = await fetch(url.toString());
        return res.json();
      };
      const [aseo, cocina, basura] = await Promise.all([
        fetchPreview('ASEO_RECEPCION'),
        fetchPreview('COCINA_RECEPCION'),
        fetchPreview('SACAR_BASURA'),
      ]);
      const lines = [
        `Fecha: ${fecha}`,
        '',
        'ASEO_RECEPCION (9:00):',
        `  ${aseo?.empId || '—'} · ${formatPhoneForInput(aseo?.phone) || 'sin teléfono'}`,
        aseo?.reason ? `  ${aseo.reason}` : '',
        '',
        'COCINA — Aseo Cocina-Pasillo (9:00):',
        `  ${cocina?.empId || '—'} · ${formatPhoneForInput(cocina?.phone) || 'sin teléfono'}`,
        cocina?.reason ? `  ${cocina.reason}` : '',
        '',
        'SACAR_BASURA (18:00):',
        `  ${basura?.empId || '—'} · ${formatPhoneForInput(basura?.phone) || 'sin teléfono'}`,
        basura?.reason ? `  ${basura.reason}` : '',
      ].filter((l) => l !== '');
      setWaPreview(lines.join('\n'));
      setStatus('Vista previa del día.', 'ok');
    } catch (e) {
      console.error(e);
      setStatus('Error en vista previa.', 'err');
    }
  };

  const sendDirectWhatsAppTest = () => {
    const select = el('waTestContactSelect');
    const task = el('waTestTaskSelect')?.value || 'ASEO_RECEPCION';
    const fecha = el('testWaFecha')?.value || fechaHoyInput();
    const opt = select?.selectedOptions?.[0];
    const phone = opt?.getAttribute('data-phone') || '';
    const name = opt?.textContent?.trim() || '';
    if (!phone) {
      setStatus('Selecciona un contacto con teléfono.', 'warn');
      return;
    }
    void sendWhatsAppViaProxy(phone, task, fecha);
    setWaPreview(`Enviando ${task} a ${name}\nTel: ${formatPhoneForInput(phone)}\nFecha: ${fecha}`);
  };

  const sendPruebaWhatsApp = (task) => {
    const raw = String(listQueryPhoneInput(WA_CONTACT_PRUEBA.id)?.value || '').trim();
    const phone = normalizeWhatsAppPhone(raw);
    const fecha = el('testWaFecha')?.value || fechaHoyInput();
    if (!phone) {
      setStatus('Ingresa el teléfono de PRUEBA y guarda antes de enviar.', 'warn');
      return;
    }
    void sendWhatsAppViaProxy(phone, task, fecha);
    setWaPreview(`Enviando ${task} a PRUEBA\nTel: ${formatPhoneForInput(phone)}\nFecha: ${fecha}`);
  };

  const initPanelWhatsApp = () => {
    const panel = el('panelWhatsApp');
    if (!panel) return;

    const fechaIn = el('testWaFecha');
    if (fechaIn && !fechaIn.value) fechaIn.value = fechaHoyInput();

    renderPlanillaPhoneRows();
    renderCustomContactRows([], WA_CONTACT_PRUEBA);

    const tryLoadPhones = () => {
      if (window.almuerzoDb) void loadWhatsAppPhones();
    };
    if (window.almuerzoDb) tryLoadPhones();
    else window.addEventListener('almuerzoFirebaseReady', tryLoadPhones, { once: true });

    el('btnWaAddCustom')?.addEventListener('click', () => {
      appendCustomContactRow({ name: '', phone: '' });
    });

    el('whatsappCustomList')?.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-wa-remove]');
      if (!btn) return;
      const row = btn.closest('[data-wa-row="custom"]');
      if (row?.getAttribute('data-wa-pinned') === 'true') return;
      row?.remove();
      syncWhatsAppContactSelect();
    });

    panel.addEventListener('input', (ev) => {
      if (ev.target.matches('.wa-phone-input, .wa-phone-name-input')) {
        syncWhatsAppContactSelect();
      }
    });

    el('btnSaveWhatsAppPhones')?.addEventListener('click', () => { void saveWhatsAppPhones(); });
    el('btnWaPreview')?.addEventListener('click', () => { void previewWhatsAppDia(); });
    el('btnWaEnviarAseo')?.addEventListener('click', () => { void sendPlanillaWhatsApp('ASEO_RECEPCION'); });
    el('btnWaEnviarCocina')?.addEventListener('click', () => { void sendPlanillaWhatsApp('COCINA_RECEPCION'); });
    el('btnWaEnviarBasura')?.addEventListener('click', () => { void sendPlanillaWhatsApp('SACAR_BASURA'); });
    el('btnWaSendDirect')?.addEventListener('click', sendDirectWhatsAppTest);
    el('btnWaPruebaAseo')?.addEventListener('click', () => sendPruebaWhatsApp('ASEO_RECEPCION'));
    el('btnWaPruebaCocina')?.addEventListener('click', () => sendPruebaWhatsApp('COCINA_RECEPCION'));
    el('btnWaPruebaBasura')?.addEventListener('click', () => sendPruebaWhatsApp('SACAR_BASURA'));
  };

  // ── INIT ───────────────────────────────────────────────────────────────────

  const init = () => {
    const mp = el('monthPicker');
    if (!mp) return;

    syncMonthPicker(monthKeyFromDate());
    mp.addEventListener('change', handleMonthChange);
    if (!READ_ONLY) {
      el('btnGuardarFirebase')?.addEventListener('click', handleGuardarClick);
    }

    const tryLoadFirebase = () => {
      if (window.almuerzoDb) void loadMonthOrGenerate(getActiveMonthKey());
    };

    if (READ_ONLY) {
      if (window.almuerzoDb) tryLoadFirebase();
      else window.addEventListener('almuerzoFirebaseReady', tryLoadFirebase, { once: true });
      return;
    }

    if (window.almuerzoDb) tryLoadFirebase();
    else window.addEventListener('almuerzoFirebaseReady', tryLoadFirebase, { once: true });

    initPanelPruebasV8();
    initPanelWhatsApp();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  function boot() {
    const run = () => init();
    if (READ_ONLY || typeof window.ccTurnosRequireAuth !== 'function') {
      run();
      return;
    }
    window.ccTurnosRequireAuth().then(run).catch(() => { /* redirige a consulta */ });
  }

  /** Consola: TURNOS_DEBUG.validate() o TURNOS_DEBUG.validate('2026-06') */
  window.TURNOS_DEBUG = {
    getState: () => state,
    getMonthKey: () => getActiveMonthKey(),
    validate: (monthKey) =>
      window.ENGINE_VALIDATOR?.printValidation(state, monthKey || getActiveMonthKey()),
    regenerate: async (monthKey) => {
      const mk = monthKey || getActiveMonthKey();
      if (mk !== state.monthKey) {
        await loadMonthOrGenerate(mk);
      }
      state.manualAmPmLocks = {};
      purgeStaleLunchOverrides(state, mk);
      ensureStateShape(state, mk);
      await loadAdjacentMonthCells(mk);
      rebalanceAfterCrossMonth(mk);
      recalcExtras(state, mk);
      state.monthKey = mk;
      syncMonthPicker(mk);
      render(true);
      return window.ENGINE_VALIDATOR?.printValidation(state, mk);
    },
    regenerateAndSave: async (monthKey) => {
      const mk = monthKey || getActiveMonthKey();
      const errors = await window.TURNOS_DEBUG.regenerate(mk);
      const ok = await saveToFirebase(false);
      return { errors, saved: ok, monthKey: mk };
    },
  };

})();
