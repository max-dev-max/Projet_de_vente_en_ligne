/**
 * Client API Assigame — sessions séparées admin / vendeur.
 */
(function (global) {
  'use strict';

  var API_BASE = global.ASSIGAME_API_BASE || '';

  var STORAGE = {
    admin: { token: 'assigame_admin_token', user: 'assigame_admin_user' },
    vendor: { token: 'assigame_vendor_token', user: 'assigame_vendor_user' }
  };

  function resolveScope() {
    if (global.ASSIGAME_AUTH_SCOPE === 'admin' || global.ASSIGAME_AUTH_SCOPE === 'vendor') {
      return global.ASSIGAME_AUTH_SCOPE;
    }
    var path = global.location.pathname || '';
    if (path.indexOf('/admin/') === 0) return 'admin';
    if (path.indexOf('/vendeur/') === 0) return 'vendor';
    if (path.indexOf('connexion-vendeur') >= 0 || path.indexOf('devenir-vendeur') >= 0 || path.indexOf('choix-offre-vendeur') >= 0) {
      return 'vendor';
    }
    return null;
  }

  function readLegacyUser() {
    try {
      var raw = localStorage.getItem('assigame_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function migrateLegacySession(scope) {
    var legacyToken = localStorage.getItem('assigame_token');
    var legacyUser = readLegacyUser();
    if (!legacyToken || !legacyUser) return;

    var isAdmin = legacyUser.role === 'ADMIN';
    if (scope === 'admin' && isAdmin) {
      localStorage.setItem(STORAGE.admin.token, legacyToken);
      localStorage.setItem(STORAGE.admin.user, JSON.stringify(legacyUser));
    } else if (scope === 'vendor' && !isAdmin) {
      localStorage.setItem(STORAGE.vendor.token, legacyToken);
      localStorage.setItem(STORAGE.vendor.user, JSON.stringify(legacyUser));
    }
  }

  function getScopeKeys(scope) {
    scope = scope || resolveScope();
    return scope ? STORAGE[scope] : null;
  }

  function getToken(scope) {
    var keys = getScopeKeys(scope);
    if (keys) {
      var scoped = localStorage.getItem(keys.token);
      if (scoped) return scoped;
      migrateLegacySession(scope);
      scoped = localStorage.getItem(keys.token);
      if (scoped) return scoped;
    }
    return localStorage.getItem('assigame_token');
  }

  function setToken(token, scope) {
    scope = scope || resolveScope();
    if (scope && STORAGE[scope]) {
      if (token) localStorage.setItem(STORAGE[scope].token, token);
      else localStorage.removeItem(STORAGE[scope].token);
    }
    if (!token) localStorage.removeItem('assigame_token');
    else if (!scope) localStorage.setItem('assigame_token', token);
  }

  function getUser(scope) {
    try {
      var keys = getScopeKeys(scope);
      if (keys) {
        var raw = localStorage.getItem(keys.user);
        if (raw) return JSON.parse(raw);
        migrateLegacySession(scope);
        raw = localStorage.getItem(keys.user);
        if (raw) return JSON.parse(raw);
      }
      return readLegacyUser();
    } catch (e) {
      return null;
    }
  }

  function setUser(user, scope) {
    scope = scope || resolveScope();
    if (scope && STORAGE[scope]) {
      if (user) localStorage.setItem(STORAGE[scope].user, JSON.stringify(user));
      else localStorage.removeItem(STORAGE[scope].user);
    }
    if (!user) localStorage.removeItem('assigame_user');
    else if (!scope) localStorage.setItem('assigame_user', JSON.stringify(user));
  }

  function clearLegacyIfMatches(scope) {
    var legacyUser = readLegacyUser();
    if (!legacyUser) return;
    var isAdmin = legacyUser.role === 'ADMIN';
    if (scope === 'admin' && isAdmin) {
      localStorage.removeItem('assigame_token');
      localStorage.removeItem('assigame_user');
    } else if (scope === 'vendor' && !isAdmin) {
      localStorage.removeItem('assigame_token');
      localStorage.removeItem('assigame_user');
    }
  }

  function clearScope(scope) {
    if (!scope || !STORAGE[scope]) return;
    localStorage.removeItem(STORAGE[scope].token);
    localStorage.removeItem(STORAGE[scope].user);
    clearLegacyIfMatches(scope);
  }

  function logout(scope) {
    scope = scope || resolveScope();
    if (scope) {
      clearScope(scope);
      return;
    }
    localStorage.removeItem('assigame_token');
    localStorage.removeItem('assigame_user');
    clearScope('admin');
    clearScope('vendor');
  }

  function persistLogin(res, scope) {
    var user = res.utilisateur || res.user || null;
    scope = scope || resolveScope() || (user && user.role === 'ADMIN' ? 'admin' : 'vendor');

    if (res.token) setToken(res.token, scope);
    if (user) setUser(user, scope);
    return res;
  }

  async function request(path, options) {
    var opts = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    var response = await fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });

    var data = null;
    var text = await response.text();
    if (text) {
      try { data = JSON.parse(text); } catch (e) { data = text; }
    }

    if (!response.ok) {
      var message = (data && data.message) ? data.message : (typeof data === 'string' ? data : 'Erreur API');
      var err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  global.AssigameAPI = {
    resolveScope: resolveScope,
    getToken: getToken,
    setToken: setToken,
    getUser: getUser,
    setUser: setUser,
    logout: logout,
    clearScope: clearScope,

    register: function (payload) {
      return request('/api/auth/register', { method: 'POST', body: payload });
    },
    login: function (email, motDePasse, scope) {
      return request('/api/auth/login', {
        method: 'POST',
        body: { email: email, motDePasse: motDePasse }
      }).then(function (res) {
        return persistLogin(res, scope || resolveScope());
      });
    },
    me: function () {
      return request('/api/auth/me');
    },

    getProduits: function () {
      return request('/api/produits/list');
    },
    getMesProduits: function () {
      return request('/api/produits/mes-produits');
    },
    getProduit: function (id) {
      return request('/api/produits/search/' + id);
    },
    getProduitsSimilaires: function (id) {
      return request('/api/produits/search/' + id + '/similaires');
    },
    getCategories: function () {
      return request('/api/categorieproduit/list');
    },

    uploadProduitImages: function (files) {
      var formData = new FormData();
      Array.prototype.forEach.call(files, function (file) {
        formData.append('files', file);
      });
      var token = getToken();
      var headers = {};
      if (token) headers.Authorization = 'Bearer ' + token;
      return fetch(API_BASE + '/api/produits/upload', {
        method: 'POST',
        headers: headers,
        body: formData
      }).then(function (response) {
        return response.text().then(function (text) {
          var data = null;
          if (text) { try { data = JSON.parse(text); } catch (e) { data = text; } }
          if (!response.ok) {
            var message = (data && data.message) ? data.message : 'Échec de l\'upload des images';
            var err = new Error(message);
            err.status = response.status;
            err.data = data;
            throw err;
          }
          return (data && data.urls) ? data.urls : [];
        });
      });
    },
    createProduit: function (payload) {
      return request('/api/produits/create', { method: 'POST', body: payload });
    },
    updateProduit: function (id, payload) {
      return request('/api/produits/update/' + id, { method: 'PUT', body: payload });
    },
    deleteProduit: function (id) {
      return request('/api/produits/delete/' + id, { method: 'DELETE' });
    },

    getDemandesVendeur: function () {
      return request('/api/admin/demandes-vendeur/list');
    },
    approuverVendeur: function (id) {
      return request('/api/admin/demandes-vendeur/approve/' + id, { method: 'POST' });
    },
    refuserVendeur: function (id) {
      return request('/api/admin/demandes-vendeur/refuse/' + id, { method: 'POST' });
    },
    getDemandesProduits: function () {
      return request('/api/admin/demandes-produits/list');
    },
    getAdminProduits: function () {
      return request('/api/admin/produits/list');
    },
    getAdminVendeurs: function () {
      return request('/api/admin/demandes-vendeur/catalogue');
    },
    getProduitModeration: function (id) {
      return request('/api/admin/demandes-produits/search/' + id);
    },
    approuverProduit: function (id) {
      return request('/api/admin/demandes-produits/approve/' + id, { method: 'POST' });
    },
    refuserProduit: function (id) {
      return request('/api/admin/demandes-produits/refuse/' + id, { method: 'POST' });
    },
    getUtilisateurs: function () {
      return request('/api/utilisateurs/list');
    },
    getUtilisateur: function (email) {
      return request('/api/utilisateurs/search/' + encodeURIComponent(email));
    },
    getTypesVendeur: function () {
      return request('/api/auth/types-vendeur');
    },
    createCategorie: function (payload) {
      return request('/api/categorieproduit/create', { method: 'POST', body: payload });
    },
    updateCategorie: function (nom, payload) {
      return request('/api/categorieproduit/update/' + encodeURIComponent(nom), { method: 'PUT', body: payload });
    },
    deleteCategorie: function (nom) {
      return request('/api/categorieproduit/delete/' + encodeURIComponent(nom), { method: 'DELETE' });
    },
    getTypeUtilisateurs: function () {
      return request('/api/typeutilisateur/list');
    },
    createTypeUtilisateur: function (payload) {
      return request('/api/typeutilisateur/create', { method: 'POST', body: payload });
    },
    updateTypeUtilisateur: function (id, payload) {
      return request('/api/typeutilisateur/update/' + id, { method: 'PUT', body: payload });
    },
    deleteTypeUtilisateur: function (id) {
      return request('/api/typeutilisateur/delete/' + id, { method: 'DELETE' });
    }
  };
})(window);
