// Utilitaires partagés — espace vendeur
(function (global) {
  'use strict';

  var LOGIN_URL = '/connexion-vendeur.html';

  function hasValidVendorSession() {
    return global.AssigameVendorAuth && global.AssigameVendorAuth.hasValidVendorSession();
  }

  function initVendorSession() {
    if (!hasValidVendorSession()) {
      if (global.AssigameVendorAuth) {
        global.AssigameVendorAuth.redirectToLogin();
      } else {
        global.location.href = LOGIN_URL;
      }
      return null;
    }

    var user = AssigameAPI.getUser('vendor');

    var nameEl = document.getElementById('vendorName');
    var emailEl = document.getElementById('vendorEmail');
    if (nameEl) {
      nameEl.textContent = [user.prenom, user.nom].filter(Boolean).join(' ') || user.email || 'Vendeur';
    }
    if (emailEl) {
      emailEl.textContent = user.email || '';
    }

    var avatarEl = document.getElementById('vendorAvatar') || document.querySelector('.sidebar-footer .avatar');
    if (avatarEl) {
      var prenom = (user.prenom || '').charAt(0);
      var nom = (user.nom || '').charAt(0);
      var initials = (prenom + nom).toUpperCase();
      if (!initials && user.email) initials = user.email.charAt(0).toUpperCase();
      avatarEl.textContent = initials || 'V';
    }

    var logoutBtn = document.querySelector('.logout-icon');
    if (logoutBtn && logoutBtn.dataset.logoutBound !== 'true') {
      logoutBtn.dataset.logoutBound = 'true';
      logoutBtn.style.cursor = 'pointer';
      logoutBtn.addEventListener('click', function () {
        AssigameAPI.logout('vendor');
        window.location.replace(LOGIN_URL);
      });
    }

    return user;
  }

  function initVendorSidebar(activePage) {
    document.querySelectorAll('.nav-item[data-page]').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-page') === activePage);
    });
  }

  global.VendorCommon = {
    LOGIN_URL: LOGIN_URL,
    initVendorSession: initVendorSession,
    initVendorSidebar: initVendorSidebar
  };
})(window);
