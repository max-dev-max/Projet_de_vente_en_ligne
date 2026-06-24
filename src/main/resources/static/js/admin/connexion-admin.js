/* Connexion admin — POST /api/auth/login puis redirection vers le dashboard admin */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('loginForm');
  var errorEl = document.getElementById('loginError');
  var submitBtn = document.getElementById('btnLogin');
  var ADMIN_SPACE = '/admin/administration.html';

  function isAdminRole(role) {
    return role === 'ADMIN';
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function getRedirectUrl() {
    var next = AssigameUtils.getQueryParam('next');
    if (next && next.indexOf('/admin/') === 0 && next !== '/admin/connexion.html') {
      return next;
    }
    return ADMIN_SPACE;
  }

  function redirectIfAlreadyLoggedIn() {
    var user = AssigameAPI.getUser('admin');
    if (user && AssigameAPI.getToken('admin') && isAdminRole(user.role)) {
      window.location.href = getRedirectUrl();
    }
  }

  redirectIfAlreadyLoggedIn();
  AssigameUtils.initPasswordToggles();
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showError('');

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connexion…';
    }

    AssigameAPI.login(email, password, 'admin')
      .then(function (res) {
        var user = res.utilisateur || res.user || AssigameAPI.getUser('admin');
        if (!user) {
          AssigameAPI.clearScope('admin');
          showError('Connexion OK mais profil introuvable.');
          return;
        }
        if (!isAdminRole(user.role)) {
          AssigameAPI.clearScope('admin');
          showError('Ce compte n\'a pas les droits administrateur.');
          return;
        }
        window.location.href = getRedirectUrl();
      })
      .catch(function (err) {
        var msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) ? err.message : null;
        showError(msg || 'Connexion impossible. Vérifiez vos identifiants.');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Se connecter';
        }
      });
  });
});
