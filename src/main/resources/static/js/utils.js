/**
 * Utilitaires UI partagés — toasts, formatage, badges statut.
 */
(function (global) {
  'use strict';

  function showToast(message, duration) {
    var toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._hideTimer);
    toastEl._hideTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, duration || 2200);
  }

  function formatPriceFCFA(amount) {
    var n = Number(amount);
    if (isNaN(n)) return '—';
    return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA';
  }

  function formatDateFR(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function statutBadgeClass(statut) {
    var map = {
      ACTIF: 'badge-active',
      EN_ATTENTE: 'badge-pending',
      REFUSE: 'badge-refused',
      SUSPENDU: 'badge-refused',
      INACTIF: 'badge-refused'
    };
    return map[statut] || 'badge-pending';
  }

  function statutLabel(statut) {
    var map = {
      ACTIF: 'Actif',
      EN_ATTENTE: 'En attente',
      REFUSE: 'Refusé',
      SUSPENDU: 'Suspendu',
      INACTIF: 'Inactif'
    };
    return map[statut] || statut || '—';
  }

  function requireAuth(role) {
    var scope = AssigameAPI.resolveScope && AssigameAPI.resolveScope();
    var user = scope ? AssigameAPI.getUser(scope) : AssigameAPI.getUser();
    var token = scope ? AssigameAPI.getToken(scope) : AssigameAPI.getToken();
    if (!token || !user) {
      showToast('Connexion requise');
      return false;
    }
    if (role && user.role !== role) {
      showToast('Accès non autorisé');
      return false;
    }
    return true;
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function placeholderImage() {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
  }

  function initPasswordToggles(root) {
    var scope = root || document;
    scope.querySelectorAll('.password-field').forEach(function (wrapper) {
      var input = wrapper.querySelector('input');
      var btn = wrapper.querySelector('.toggle-password');
      if (!input || !btn || btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';

      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var isVisible = input.type === 'text';
        input.type = isVisible ? 'password' : 'text';
        btn.classList.toggle('is-visible', !isVisible);
        btn.setAttribute('aria-pressed', isVisible ? 'false' : 'true');
        btn.setAttribute('aria-label', isVisible ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
      });
    });
  }

  global.AssigameUtils = {
    showToast: showToast,
    formatPriceFCFA: formatPriceFCFA,
    formatDateFR: formatDateFR,
    statutBadgeClass: statutBadgeClass,
    statutLabel: statutLabel,
    requireAuth: requireAuth,
    getQueryParam: getQueryParam,
    placeholderImage: placeholderImage,
    initPasswordToggles: initPasswordToggles
  };
})(window);
