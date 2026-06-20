/**
 * Client API Assigame — aligné sur les endpoints Spring Boot (localhost:8080).
 * Stocke le JWT dans localStorage sous la clé assigame_token.
 */
(function (global) {
  'use strict';

  var API_BASE = global.ASSIGAME_API_BASE || '';

  function getToken() {
    return localStorage.getItem('assigame_token');
  }

  function setToken(token) {
    if (token) localStorage.setItem('assigame_token', token);
    else localStorage.removeItem('assigame_token');
  }

  function getUser() {
    try {
      var raw = localStorage.getItem('assigame_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    if (user) localStorage.setItem('assigame_user', JSON.stringify(user));
    else localStorage.removeItem('assigame_user');
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
    getToken: getToken,
    setToken: setToken,
    getUser: getUser,
    setUser: setUser,
    logout: function () {
      setToken(null);
      setUser(null);
    },

    /* ---- Auth ---- */
    register: function (payload) {
      return request('/api/auth/register', { method: 'POST', body: payload });
    },
    login: function (email, motDePasse) {
      return request('/api/auth/login', {
        method: 'POST',
        body: { email: email, motDePasse: motDePasse }
      }).then(function (res) {
        if (res.token) setToken(res.token);
        if (res.user) setUser(res.user);
        return res;
      });
    },
    me: function () {
      return request('/api/auth/me');
    },

    /* ---- Catalogue (public) ---- */
    getProduits: function () {
      return request('/api/produits');
    },
    getProduit: function (id) {
      return request('/api/produits/' + id);
    },
    getCategories: function () {
      return request('/api/categorieproduit/list');
    },

    /* ---- Vendeur ---- */
    createProduit: function (payload) {
      return request('/api/produits', { method: 'POST', body: payload });
    },
    updateProduit: function (id, payload) {
      return request('/api/produits/' + id, { method: 'PUT', body: payload });
    },
    deleteProduit: function (id) {
      return request('/api/produits/' + id, { method: 'DELETE' });
    },

    /* ---- Admin ---- */
    getDemandesVendeur: function () {
      return request('/api/admin/demandes-vendeur');
    },
    approuverVendeur: function (id) {
      return request('/api/admin/demandes-vendeur/' + id + '/approuver', { method: 'POST' });
    },
    refuserVendeur: function (id) {
      return request('/api/admin/demandes-vendeur/' + id + '/refuser', { method: 'POST' });
    },
    getUtilisateurs: function () {
      return request('/api/utilisateurs');
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
    }
  };
})(window);
