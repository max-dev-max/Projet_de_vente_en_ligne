/* Garde d'accès admin + navigation partagée */
(function (global) {
  'use strict';

  var LOGIN_URL = '/admin/connexion.html';

  function isLoginPage() {
    return /\/admin\/connexion\.html$/.test(global.location.pathname);
  }

  function hasValidAdminSession() {
    return global.AssigameAdminAuth && global.AssigameAdminAuth.hasValidAdminSession();
  }

  function logoutAdmin() {
    if (global.AssigameAPI && typeof global.AssigameAPI.logout === 'function') {
      global.AssigameAPI.logout('admin');
    } else {
      global.localStorage.removeItem('assigame_admin_token');
      global.localStorage.removeItem('assigame_admin_user');
      global.localStorage.removeItem('assigame_token');
      global.localStorage.removeItem('assigame_user');
    }
    global.location.replace(LOGIN_URL);
  }

  function initAdminNav() {
    var active = document.body && document.body.getAttribute('data-admin-page');
    if (!active) return;

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(function (link) {
      if (link.getAttribute('data-page') === active) {
        link.classList.add('active');
      }
    });
  }

  function initAdminLogout(buttonId) {
    var btn = document.getElementById(buttonId || 'btnLogout');
    if (!btn || btn.dataset.logoutBound === 'true') return;

    btn.dataset.logoutBound = 'true';
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      logoutAdmin();
    });
  }

  global.AdminCommon = {
    LOGIN_URL: LOGIN_URL,
    logoutAdmin: logoutAdmin,
    initAdminNav: initAdminNav,
    initAdminLogout: initAdminLogout
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (isLoginPage()) return;
    initAdminLogout('btnLogout');
    if (!hasValidAdminSession()) return;
    initAdminNav();
  });
})(window);
