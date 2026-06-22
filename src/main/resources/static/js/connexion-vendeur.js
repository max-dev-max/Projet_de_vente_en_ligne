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

  function redirectIfAlreadyLoggedIn() {
    var user = AssigameAPI.getUser();
    if (user && AssigameAPI.getToken() && !isAdminRole(user.role)) {
      window.location.href = VENDOR_SPACE;
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
        if (isAdminRole(user.role)) {
          AssigameAPI.logout();
          showError('Ce compte est un compte admin.');
          return;
        }
        window.location.href = VENDOR_SPACE;
      })
      .catch(function (err) {
        // Back-end peut renvoyer { message: "..." } via GlobalExceptionHandler
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
