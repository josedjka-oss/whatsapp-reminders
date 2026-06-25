(function () {
  'use strict';

  /** Debe coincidir con public/version.json → build */
  window.__CAJA_CENTRO_BUILD__ = '20260520c';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => { r.unregister(); });
    });
  }

  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((n) => { caches.delete(n); });
    });
  }
})();
