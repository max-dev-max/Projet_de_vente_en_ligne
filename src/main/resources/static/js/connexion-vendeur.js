/* Connexion vendeur — POST /api/auth/login puis redirection vers l'espace vendeur */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('loginForm');
  var errorEl = document.getElementById('loginError');
  var submitBtn = document.getElementById('btnLogin');
  var VENDOR_SPACE = '/vendeur/dashboard.html';

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
    if (next && next.indexOf('/vendeur/') === 0) {
      return next;
    }
    return VENDOR_SPACE;
  }

  function redirectIfAlreadyLoggedIn() {
    var user = AssigameAPI.getUser('vendor');
    if (user && AssigameAPI.getToken('vendor') && !isAdminRole(user.role)) {
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

    AssigameAPI.login(email, password, 'vendor')
      .then(function (res) {
        var user = res.utilisateur || res.user || AssigameAPI.getUser('vendor');
        if (!user) {
          AssigameAPI.clearScope('vendor');
          showError('Connexion OK mais profil introuvable.');
          return;
        }
        if (isAdminRole(user.role)) {
          AssigameAPI.clearScope('vendor');
          showError('Ce compte est un compte admin.');
          return;
        }
        window.location.href = getRedirectUrl();
      })
      .catch(function (err) {
        var msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) ? err.message : null;
        showError(msg || 'Connexion impossible. Vérifiez vos identifiants.');
        if (console && console.error) console.error(err);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Se connecter';
        }
      });
  });
});
