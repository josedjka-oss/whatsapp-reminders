/**
 * turnos-auth.js — Protección con clave para planilla editable (turnos / programación).
 * Consulta pública: turnos-consulta.html (no carga este script).
 */
(function () {
  'use strict';

  const ADMIN_PIN = '302400';
  const CONSULTA_URL = '/turnos/consulta.html';

  /** Solo en memoria: al recargar (F5) se pierde y vuelve a pedir clave. */
  let authedInMemory = false;

  const isAuthed = () => authedInMemory === true;

  const setAuthed = () => {
    authedInMemory = true;
  };

  try {
    sessionStorage.removeItem('ccTurnosAdminAuth');
  } catch (_) { /* ignore */ }

  const injectStyles = () => {
    if (document.getElementById('turnos-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'turnos-auth-styles';
    style.textContent = `
      .turnos-auth-gate {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #134d41 0%, #1a6b5a 50%, #1e3a8a 100%);
        padding: 20px;
      }
      .turnos-auth-card {
        width: 100%; max-width: 360px;
        background: #fff; border-radius: 12px;
        padding: 28px 24px 24px; box-shadow: 0 12px 40px rgba(0,0,0,.25);
        text-align: center;
      }
      .turnos-auth-card h2 {
        font-size: 1.15rem; font-weight: 700; color: #134d41; margin-bottom: 8px;
      }
      .turnos-auth-card p {
        font-size: 0.88rem; color: #5a7268; margin-bottom: 18px; line-height: 1.45;
      }
      .turnos-auth-card input {
        width: 100%; padding: 12px 14px; font-size: 1.1rem;
        border: 2px solid #d0ddd9; border-radius: 8px;
        text-align: center; letter-spacing: 0.15em;
      }
      .turnos-auth-card input:focus {
        outline: none; border-color: #1a6b5a; box-shadow: 0 0 0 3px rgba(26,107,90,.2);
      }
      .turnos-auth-err {
        color: #c0392b; font-size: 0.85rem; margin-top: 10px; min-height: 1.2em;
      }
      .turnos-auth-actions {
        display: flex; flex-direction: column; gap: 10px; margin-top: 18px;
      }
      .turnos-auth-btn {
        padding: 12px 16px; border: none; border-radius: 8px;
        font-size: 0.95rem; font-weight: 700; cursor: pointer;
      }
      .turnos-auth-btn-primary { background: #1a6b5a; color: #fff; }
      .turnos-auth-btn-primary:hover { background: #134d41; }
      .turnos-auth-btn-ghost { background: #f1f5f9; color: #334155; }
      .turnos-auth-btn-ghost:hover { background: #e2e8f0; }
      html.turnos-auth-pending body { visibility: hidden; }
      html.turnos-auth-pending .turnos-auth-gate { visibility: visible; }
    `;
    document.head.appendChild(style);
  };

  const showGate = () =>
    new Promise((resolve, reject) => {
      injectStyles();
      document.documentElement.classList.add('turnos-auth-pending');

      const gate = document.createElement('div');
      gate.className = 'turnos-auth-gate';
      gate.setAttribute('role', 'dialog');
      gate.setAttribute('aria-modal', 'true');
      gate.setAttribute('aria-labelledby', 'turnosAuthTitle');
      gate.innerHTML = `
        <div class="turnos-auth-card">
          <h2 id="turnosAuthTitle">Acceso a planilla</h2>
          <p>Ingresa la clave para editar turnos y programación.</p>
          <input type="password" id="turnosAuthPin" inputmode="numeric"
            autocomplete="off" maxlength="12" aria-label="Clave de acceso"
            placeholder="••••••" />
          <p class="turnos-auth-err" id="turnosAuthErr" aria-live="polite"></p>
          <div class="turnos-auth-actions">
            <button type="button" class="turnos-auth-btn turnos-auth-btn-primary" id="turnosAuthSubmit">
              Entrar
            </button>
            <button type="button" class="turnos-auth-btn turnos-auth-btn-ghost" id="turnosAuthConsulta">
              Ver solo consulta
            </button>
          </div>
        </div>`;

      document.documentElement.appendChild(gate);

      const pinIn = gate.querySelector('#turnosAuthPin');
      const errEl = gate.querySelector('#turnosAuthErr');
      const btnSubmit = gate.querySelector('#turnosAuthSubmit');
      const btnConsulta = gate.querySelector('#turnosAuthConsulta');

      const unlock = () => {
        setAuthed();
        gate.remove();
        document.documentElement.classList.remove('turnos-auth-pending');
        resolve(true);
      };

      const trySubmit = () => {
        const val = (pinIn?.value || '').trim();
        if (val === ADMIN_PIN) {
          unlock();
          return;
        }
        if (errEl) errEl.textContent = 'Clave incorrecta. Intenta de nuevo.';
        if (pinIn) {
          pinIn.value = '';
          pinIn.focus();
        }
      };

      btnSubmit?.addEventListener('click', trySubmit);
      pinIn?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') trySubmit();
      });
      btnConsulta?.addEventListener('click', () => {
        window.location.href = CONSULTA_URL;
        reject(new Error('redirect-consulta'));
      });

      pinIn?.focus();
    });

  window.ccTurnosIsAuthed = isAuthed;

  window.ccTurnosRequireAuth = () => {
    if (isAuthed()) return Promise.resolve(true);
    return showGate();
  };
})();
