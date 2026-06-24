(function () {
  var path = window.location.pathname;
  if (path.indexOf('/vendeur/') !== 0) return;

  document.documentElement.classList.add('vendor-auth-pending');

  var auth = window.AssigameVendorAuth;
  if (!auth || !auth.hasValidVendorSession()) {
    if (window.AssigameAPI) AssigameAPI.clearScope('vendor');
    window.location.replace(
      '/connexion-vendeur.html?next=' + encodeURIComponent(path + window.location.search)
    );
    return;
  }

  document.documentElement.classList.remove('vendor-auth-pending');
})();
