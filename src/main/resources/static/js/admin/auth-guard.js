(function () {
  if (/\/admin\/connexion\.html$/.test(window.location.pathname)) return;

  document.documentElement.classList.add('admin-auth-pending');

  var auth = window.AssigameAdminAuth;
  if (!auth || !auth.hasValidAdminSession()) {
    if (window.AssigameAPI) AssigameAPI.clearScope('admin');
    window.location.replace(
      '/admin/connexion.html?next=' + encodeURIComponent(window.location.pathname + window.location.search)
    );
    return;
  }

  document.documentElement.classList.remove('admin-auth-pending');
})();
