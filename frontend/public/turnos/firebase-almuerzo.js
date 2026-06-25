/**
 * Firebase solo para la página almuerzo.html (proyecto = hosting cajacentro-v6).
 * Evita colisionar con otra instancia si se carga firebase-config.js en otro HTML.
 */
(function () {
  'use strict';
  const firebaseConfig = {
    apiKey: 'AIzaSyAQ7UzffEWKSlPwDwSxGLP-ta7zIFPGHpg',
    authDomain: 'cajacentro-v6.firebaseapp.com',
    projectId: 'cajacentro-v6',
    storageBucket: 'cajacentro-v6.firebasestorage.app',
    messagingSenderId: '1031205436046',
    appId: '1:1031205436046:web:4567d91395e4a7f17a27df',
  };

  const tryInit = () => {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') return false;
    try {
      window.almuerzoFirebaseApp = firebase.app('almuerzoSync');
    } catch (e) {
      window.almuerzoFirebaseApp = firebase.initializeApp(firebaseConfig, 'almuerzoSync');
    }
    window.almuerzoDb = window.almuerzoFirebaseApp.firestore();
    window.dispatchEvent(new CustomEvent('almuerzoFirebaseReady'));
    return true;
  };

  if (tryInit()) return;
  let n = 0;
  const t = setInterval(() => {
    n += 1;
    if (tryInit() || n > 80) clearInterval(t);
  }, 40);
})();
