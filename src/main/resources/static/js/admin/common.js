/* Navigation admin partagée + helpers */
(function () {
  var ACTIVE = document.body.getAttribute('data-admin-page');
  if (!ACTIVE) return;
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(function (link) {
    if (link.getAttribute('data-page') === ACTIVE) link.classList.add('active');
  });
})();
