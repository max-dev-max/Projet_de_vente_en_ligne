(function (global) {
  'use strict';

  var LOGIN_URL = '/admin/connexion.html';

  function migrateLegacy(scope) {
    var legacyToken = global.localStorage.getItem('assigame_token');
    var legacyUser = null;
    try {
      var raw = global.localStorage.getItem('assigame_user');
      legacyUser = raw ? JSON.parse(raw) : null;
    } catch (e) {
      legacyUser = null;
    }
    if (!legacyToken || !legacyUser) return;

    if (scope === 'admin' && legacyUser.role === 'ADMIN') {
      global.localStorage.setItem('assigame_admin_token', legacyToken);
      global.localStorage.setItem('assigame_admin_user', JSON.stringify(legacyUser));
    }
  }

  function readUser(scope) {
    migrateLegacy(scope);
    if (global.AssigameAPI) {
      return global.AssigameAPI.getUser(scope);
    }
    try {
      var raw = global.localStorage.getItem('assigame_' + scope + '_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function readToken(scope) {
    migrateLegacy(scope);
    if (global.AssigameAPI) {
      return global.AssigameAPI.getToken(scope);
    }
    return global.localStorage.getItem('assigame_' + scope + '_token');
  }

  function hasValidAdminSession() {
    var token = readToken('admin');
    var user = readUser('admin');
    return !!(token && user && user.role === 'ADMIN');
  }

  global.AssigameAdminAuth = {
    LOGIN_URL: LOGIN_URL,
    hasValidAdminSession: hasValidAdminSession,
    redirectToLogin: function () {
      var next = global.location.pathname + global.location.search;
      global.location.replace(
        LOGIN_URL + '?next=' + encodeURIComponent(next)
      );
    }
  };
})(window);
