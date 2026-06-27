(function (global) {
  'use strict';

  var LOGIN_URL = '/connexion-vendeur.html';
  var TOKEN_KEY = 'assigame_vendor_token';
  var USER_KEY = 'assigame_vendor_user';

  function vendorStore() {
    return global.sessionStorage;
  }

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

    vendorStore().setItem(TOKEN_KEY, legacyToken);
    vendorStore().setItem(USER_KEY, JSON.stringify(legacyUser));
    global.localStorage.removeItem(TOKEN_KEY);
    global.localStorage.removeItem(USER_KEY);
  }

  function readUser() {
    migrateLegacy();
    if (global.AssigameAPI) {
      return global.AssigameAPI.getUser('vendor');
    }
    try {
      var raw = vendorStore().getItem(USER_KEY);
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
    return vendorStore().getItem(TOKEN_KEY);
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
