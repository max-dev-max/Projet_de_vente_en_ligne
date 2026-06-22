document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var grid = document.getElementById('pricingGrid');
  if (!grid) return;

  var quotas = {
    Particulier: '5 produits actifs max',
    Professionnel: '15 produits actifs max',
    'Partenaire Vip': 'Produits actifs illimités'
  };

  var prices = {
    Particulier: { amount: '0 FCFA', suffix: '/mois' },
    Professionnel: { amount: '19 000 FCFA', suffix: '/mois' },
    'Partenaire Vip': { amount: 'Sur devis', suffix: '' }
  };

  grid.innerHTML = '<p class="catalog-loading">Chargement des offres…</p>';

  try {
    var types = await AssigameAPI.getTypesVendeur();
    var vendeurTypes = (types || []).filter(function (t) {
      return t.nom_typeutilisateur !== 'ADMIN';
    });

    if (!vendeurTypes.length) {
      grid.innerHTML = '<p class="catalog-empty">Aucune offre disponible pour le moment.</p>';
      return;
    }

    grid.innerHTML = vendeurTypes.map(function (type, index) {
      var nom = type.nom_typeutilisateur;
      var price = prices[nom] || { amount: '—', suffix: '' };
      var featured = nom === 'Professionnel';
      var btnClass = featured ? 'btn btn-primary w-100' : 'btn btn-secondary w-100';
      var planParam = encodeURIComponent(nom);

      return (
        '<div class="card pricing-card' + (featured ? ' pricing-card--featured' : '') + '">' +
          (featured ? '<div class="pricing-badge">Le plus populaire</div>' : '') +
          '<div class="pricing-header">' +
            '<h2>' + (type.libelle_typeutilisateur || nom) + '</h2>' +
            '<div class="pricing-price">' + price.amount + (price.suffix ? '<span>' + price.suffix + '</span>' : '') + '</div>' +
            '<p>' + (type.description_typeutilisateur || '') + '</p>' +
          '</div>' +
          '<ul class="pricing-features">' +
            '<li><i class="ph ph-check-circle"></i> ' + (quotas[nom] || 'Quota produits selon offre') + '</li>' +
            '<li><i class="ph ph-check-circle"></i> Modération admin avant publication</li>' +
            '<li><i class="ph ph-check-circle"></i> Support Assigame</li>' +
          '</ul>' +
          '<a href="/vendeur/paiement.html?plan=' + planParam + '" class="' + btnClass + '">Sélectionner</a>' +
        '</div>'
      );
    }).join('');
  } catch (err) {
    grid.innerHTML = '<div class="catalog-error"><p>Impossible de charger les offres.</p></div>';
    toast(err.message || 'Erreur de chargement');
  }
});
