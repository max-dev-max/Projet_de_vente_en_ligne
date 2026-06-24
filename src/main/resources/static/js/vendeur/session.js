(function (global) {
  'use strict';

  var LOGIN_URL = '/connexion-vendeur.html';

  function migrateLegacy() {
    var legacyToken = global.localStorage.getItem('assigame_token');
    var legacyUser = null;
    try {
      var raw = global.localStorage.getItem('assigame_user');
      legacyUser = raw ? JSON.parse(raw) : null;
    } catch (e) {
      legacyUser = null;
    }
    if (!legacyToken || !legacyUser || legacyUser.role === 'ADMIN') return;

    global.localStorage.setItem('assigame_vendor_token', legacyToken);
    global.localStorage.setItem('assigame_vendor_user', JSON.stringify(legacyUser));
  }

  function readUser() {
    migrateLegacy();
    if (global.AssigameAPI) {
      return global.AssigameAPI.getUser('vendor');
    }
    try {
      var raw = global.localStorage.getItem('assigame_vendor_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function readToken() {
    migrateLegacy();
    if (global.AssigameAPI) {
      return global.AssigameAPI.getToken('vendor');
    }
    return global.localStorage.getItem('assigame_vendor_token');
  }

  function hasValidVendorSession() {
    var token = readToken();
    var user = readUser();
    return !!(token && user && user.role !== 'ADMIN');
  }

  global.AssigameVendorAuth = {
    LOGIN_URL: LOGIN_URL,
    hasValidVendorSession: hasValidVendorSession,
    redirectToLogin: function () {
      var next = global.location.pathname + global.location.search;
      global.location.replace(
        LOGIN_URL + '?next=' + encodeURIComponent(next)
      );
    }
  };
})(window);
