(function () {
  var path = window.location.pathname;
  if (path.indexOf('/vendeur/') !== 0) return;

  document.documentElement.classList.add('vendor-auth-pending');

  var auth = window.AssigameVendorAuth;
  var loginUrl = '/connexion-vendeur.html?next=' + encodeURIComponent(path + window.location.search);

  function redirectLogin() {
    if (window.AssigameAPI) AssigameAPI.clearScope('vendor');
    window.location.replace(loginUrl);
  }

  if (!auth || !auth.hasValidVendorSession()) {
    redirectLogin();
    return;
  }

  if (!window.AssigameAPI || !AssigameAPI.me) {
    document.documentElement.classList.remove('vendor-auth-pending');
    return;
  }

  AssigameAPI.me('vendor')
    .then(function (user) {
      if (!user || user.role === 'ADMIN' || user.statut !== 'ACTIF') {
        redirectLogin();
        return;
      }
      AssigameAPI.setUser(user, 'vendor');
      document.documentElement.classList.remove('vendor-auth-pending');
    })
    .catch(function () {
      redirectLogin();
    });
})();
