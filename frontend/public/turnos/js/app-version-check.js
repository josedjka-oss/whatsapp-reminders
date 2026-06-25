(function () {

    const POLL_MS = 90000;

    const UPDATE_PENDING_KEY = 'ccAppUpdatePending';

    const esPaginaTurnos = () => /turnos|programacion-almuerzos/i.test(window.location.pathname || '');

    const fetchRemoteVersion = async () => {
        try {
    const versionUrl = esPaginaTurnos()
        ? `/turnos/version.json?t=${Date.now()}`
        : `/version.json?t=${Date.now()}`;
            const res = await fetch(versionUrl, { cache: 'no-store' });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    };

    const buildEsperado = (data) => {
        if (!data) return null;
        if (esPaginaTurnos()) return data.turnosBuild || data.build || null;
        return data.build || null;
    };

    const tienePanelAdminActivo = () => !!document.querySelector('.admin-panel');

    const marcarActualizacionPendiente = (remote) => {
        try {
            sessionStorage.setItem(UPDATE_PENDING_KEY, remote);
        } catch {
            /* ignore */
        }
    };

    const aplicarRecargaPorNuevaVersion = () => {
        if (typeof window.cajaCentroGuardarEstadoNavegacion === 'function') {
            window.cajaCentroGuardarEstadoNavegacion();
        }
        window.location.reload();
    };

    const checkForUpdate = async () => {
        const BUILD = window.__CAJA_CENTRO_BUILD__;
        if (!BUILD) return;

        const data = await fetchRemoteVersion();
        const remote = buildEsperado(data);
        if (!remote || remote === BUILD) return;

        if (tienePanelAdminActivo()) {
            marcarActualizacionPendiente(remote);
            return;
        }

        try {
            sessionStorage.removeItem(UPDATE_PENDING_KEY);
        } catch {
            /* ignore */
        }

        aplicarRecargaPorNuevaVersion();
    };

    const start = () => {
        setInterval(checkForUpdate, POLL_MS);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) checkForUpdate();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
