/**
 * Sincronización en tiempo real de programacionAlmuerzos (onSnapshot + respaldo).
 * En móvil el listener se suspende en segundo plano: al volver a la pestaña
 * se fuerza lectura desde servidor (visibility / focus / online).
 */
(function () {
  'use strict';

  const COLLECTION = 'programacionAlmuerzos';
  const POLL_MS_DESKTOP = 15000;
  const POLL_MS_MOBILE = 8000;
  const RESUME_POLL_DEBOUNCE_MS = 400;

  /** @type {Map<string, { unsub: function, applyFn: function, setStatusFn: function|null, options: object }>} */
  const subscriptions = new Map();
  /** @type {Map<string, { lastAppliedRevision: number, lastLocalRevision: number|null }>} */
  const syncStateByMonth = new Map();
  /** @type {Map<string, number>} */
  const pollTimersByMonth = new Map();
  /** @type {Set<string>} */
  const localSaveInProgress = new Set();

  /** @type {{ monthKey: string, payload: object, revision: number } | null} */
  let pendingRemote = null;
  /** @type {((monthKey: string, payload: object, meta: { remote: boolean }) => void) | null} */
  let pendingApplyFn = null;
  let resumePollTimer = null;

  const isMobileDevice = () =>
    window.matchMedia?.('(max-width: 768px), (pointer: coarse)').matches === true;

  const pollIntervalMs = () => (isMobileDevice() ? POLL_MS_MOBILE : POLL_MS_DESKTOP);

  const isUserEditingCell = () =>
    !!document.activeElement?.classList?.contains('cell-in');

  const extractRevision = (payload) => {
    if (!payload || typeof payload !== 'object') return 0;
    const r = payload.planillaRevision;
    if (typeof r === 'number' && Number.isFinite(r)) return r;
    const t = payload.updatedAt;
    if (t && typeof t.toMillis === 'function') return t.toMillis();
    if (t && typeof t.seconds === 'number') return t.seconds * 1000;
    return 0;
  };

  const getMonthSyncState = (monthKey) => {
    if (!syncStateByMonth.has(monthKey)) {
      syncStateByMonth.set(monthKey, { lastAppliedRevision: 0, lastLocalRevision: null });
    }
    return syncStateByMonth.get(monthKey);
  };

  const shouldApplyRemote = (monthKey, revision) => {
    if (localSaveInProgress.has(monthKey)) return false;
    if (!revision || revision <= 0) return false;
    const st = getMonthSyncState(monthKey);
    if (revision <= st.lastAppliedRevision) return false;
    if (st.lastLocalRevision != null && revision === st.lastLocalRevision) {
      st.lastAppliedRevision = revision;
      st.lastLocalRevision = null;
      return false;
    }
    return true;
  };

  const markRevisionApplied = (monthKey, revision) => {
    const st = getMonthSyncState(monthKey);
    if (revision > 0) st.lastAppliedRevision = revision;
  };

  const notifyLocalSave = (monthKey, revision) => {
    if (!monthKey || !revision) return;
    const st = getMonthSyncState(monthKey);
    st.lastLocalRevision = revision;
    st.lastAppliedRevision = Math.max(st.lastAppliedRevision || 0, revision);
  };

  const beginLocalSave = (monthKey, revision) => {
    if (!monthKey) return;
    localSaveInProgress.add(monthKey);
    notifyLocalSave(monthKey, revision);
  };

  const endLocalSave = (monthKey) => {
    if (!monthKey) return;
    localSaveInProgress.delete(monthKey);
  };

  const seedRevisionFromPayload = (monthKey, payload) => {
    const rev = extractRevision(payload);
    if (rev > 0) {
      const st = getMonthSyncState(monthKey);
      st.lastAppliedRevision = rev;
    }
  };

  const unsubscribePlanillaMes = (monthKey) => {
    const sub = subscriptions.get(monthKey);
    if (sub?.unsub) sub.unsub();
    subscriptions.delete(monthKey);

    const pollId = pollTimersByMonth.get(monthKey);
    if (pollId) {
      clearInterval(pollId);
      pollTimersByMonth.delete(monthKey);
    }
    if (pendingRemote?.monthKey === monthKey) pendingRemote = null;
  };

  const unsubscribeAllPlanilla = () => {
    [...subscriptions.keys()].forEach(unsubscribePlanillaMes);
    syncStateByMonth.clear();
  };

  const flushPendingRemote = (applyFn) => {
    if (!pendingRemote || typeof applyFn !== 'function') return false;
    const { monthKey, payload, revision } = pendingRemote;
    pendingRemote = null;
    markRevisionApplied(monthKey, revision);
    applyFn(monthKey, payload, { remote: true });
    return true;
  };

  const tryApplySnapshot = (monthKey, payload, applyFn, setStatusFn, options, revision) => {
    if (localSaveInProgress.has(monthKey)) return;
    if (!shouldApplyRemote(monthKey, revision)) return;

    if (options.deferWhileEditing && isUserEditingCell()) {
      pendingRemote = { monthKey, payload, revision };
      setStatusFn?.('Hay cambios en la nube — se aplicarán al terminar de editar.', 'warn');
      return;
    }

    markRevisionApplied(monthKey, revision);
    applyFn(monthKey, payload, { remote: true });
    setStatusFn?.('Planilla actualizada desde otro dispositivo.', 'ok');
  };

  const pollPlanillaFromServer = async (monthKey, applyFn, setStatusFn, options) => {
    const db = window.almuerzoDb;
    if (!db || !monthKey || typeof applyFn !== 'function') return;
    if (localSaveInProgress.has(monthKey)) return;
    try {
      const snap = await db.collection(COLLECTION).doc(monthKey).get({ source: 'server' });
      if (!snap.exists) return;
      const payload = snap.data();
      const revision = extractRevision(payload);
      if (!shouldApplyRemote(monthKey, revision)) return;
      tryApplySnapshot(monthKey, payload, applyFn, setStatusFn, options, revision);
    } catch (e) {
      console.warn('PLANILLA_FIRESTORE_SYNC poll', monthKey, e);
    }
  };

  const refreshAllFromServer = async () => {
    const db = window.almuerzoDb;
    if (!db || subscriptions.size === 0) return;
    try {
      await db.enableNetwork();
    } catch (e) {
      /* ignore */
    }
    subscriptions.forEach((meta, monthKey) => {
      void pollPlanillaFromServer(monthKey, meta.applyFn, meta.setStatusFn, meta.options);
    });
  };

  const scheduleResumePoll = () => {
    if (document.hidden) return;
    clearTimeout(resumePollTimer);
    resumePollTimer = setTimeout(() => {
      void refreshAllFromServer();
      if (pendingApplyFn) flushPendingRemote(pendingApplyFn);
    }, RESUME_POLL_DEBOUNCE_MS);
  };

  const startPollTimer = (monthKey, applyFn, setStatusFn, options) => {
    const existing = pollTimersByMonth.get(monthKey);
    if (existing) clearInterval(existing);

    const pollId = setInterval(() => {
      if (document.hidden) return;
      void pollPlanillaFromServer(monthKey, applyFn, setStatusFn, options);
    }, pollIntervalMs());
    pollTimersByMonth.set(monthKey, pollId);
  };

  const subscribePlanillaMes = (monthKey, applyFn, setStatusFn, options = {}) => {
    const db = window.almuerzoDb;
    if (!db || !monthKey || typeof applyFn !== 'function') return;

    unsubscribePlanillaMes(monthKey);
    pendingApplyFn = applyFn;

    const opts = {
      deferWhileEditing: options.deferWhileEditing !== false,
    };

    let isFirstSnapshot = true;

    const unsub = db.collection(COLLECTION).doc(monthKey).onSnapshot(
      (snap) => {
        if (!snap.exists) return;

        const payload = snap.data();
        if (!payload || typeof payload !== 'object') return;
        const revision = extractRevision(payload);

        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          seedRevisionFromPayload(monthKey, payload);
          return;
        }

        if (snap.metadata.hasPendingWrites) return;
        if (localSaveInProgress.has(monthKey)) return;

        tryApplySnapshot(monthKey, payload, applyFn, setStatusFn, opts, revision);
      },
      (err) => {
        console.error('PLANILLA_FIRESTORE_SYNC onSnapshot', monthKey, err);
        setStatusFn?.('Error de sincronización en vivo.', 'err');
      }
    );

    subscriptions.set(monthKey, { unsub, applyFn, setStatusFn, options: opts });
    startPollTimer(monthKey, applyFn, setStatusFn, opts);

    setTimeout(() => {
      void pollPlanillaFromServer(monthKey, applyFn, setStatusFn, opts);
    }, 2000);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    scheduleResumePoll();
  });

  window.addEventListener('focus', scheduleResumePoll);
  window.addEventListener('pageshow', (ev) => {
    if (ev.persisted) scheduleResumePoll();
  });
  window.addEventListener('online', scheduleResumePoll);

  window.PLANILLA_FIRESTORE_SYNC = {
    subscribe: subscribePlanillaMes,
    unsubscribe: unsubscribePlanillaMes,
    unsubscribeAll: unsubscribeAllPlanilla,
    notifyLocalSave,
    beginLocalSave,
    endLocalSave,
    seedRevisionFromPayload,
    flushPending: flushPendingRemote,
    refreshAllFromServer,
    isUserEditingCell,
    getPendingRemote: () => pendingRemote,
    extractRevision,
  };
})();
