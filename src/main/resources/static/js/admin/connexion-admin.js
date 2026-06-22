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

  function redirectIfAlreadyLoggedIn() {
    var user = AssigameAPI.getUser();
    if (user && AssigameAPI.getToken() && isAdminRole(user.role)) {
      window.location.href = ADMIN_SPACE;
    }
  }

  redirectIfAlreadyLoggedIn();
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

    AssigameAPI.login(email, password)
      .then(function (res) {
        var user = res.utilisateur || res.user || AssigameAPI.getUser();
        if (!user) {
          AssigameAPI.logout();
          showError('Connexion OK mais profil introuvable.');
          return;
        }
        if (!isAdminRole(user.role)) {
          AssigameAPI.logout();
          showError('Ce compte n\'a pas les droits administrateur.');
          return;
        }
        window.location.href = ADMIN_SPACE;
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
