/* Page publique — choix de l'offre vendeur (étape 2 de l'inscription) */
document.addEventListener('DOMContentLoaded', async function () {
  var toast = AssigameUtils.showToast;
  var grid = document.getElementById('pricingGrid');
  if (!grid) return;

  var draft = localStorage.getItem('assigame_vendeur_draft');
  if (!draft) {
    toast('Complétez d\'abord vos informations personnelles');
    window.location.replace('/devenir-vendeur.html');
    return;
  }

  var planMeta = {
    Particulier: {
      tagline: 'Offre Débutant',
      price: '5',
      suffix: '/mois',
      features: [
        'Jusqu\'à 5 produits actifs',
        'Support standard',
        'Commission réduite'
      ],
      cta: 'Choisir l\'offre Particulier',
      icon: 'ph-check-circle',
      iconTone: 'green'
    },
    Professionnel: {
      tagline: 'Offre Croissance',
      price: '10',
      suffix: '/mois',
      featured: true,
      badge: 'RECOMMANDÉ',
      features: [
        'Jusqu\'à 15 produits actifs',
        'Statistiques avancées',
        'Support prioritaire',
        'Badge « Vendeur Pro »'
      ],
      cta: 'Choisir l\'offre Professionnel',
      icon: 'ph-gear-six',
      iconTone: 'blue'
    },
    'Partenaire Vip': {
      tagline: 'Offre Exclusive',
      price: '15',
      suffix: '/mois',
      features: [
        'Produits actifs illimités',
        'Gestionnaire de compte dédié',
        'Mise en avant catalogue',
        'API personnalisée'
      ],
      cta: 'Choisir l\'offre VIP',
      icon: 'ph-star',
      iconTone: 'purple'
    }
  };

  async function selectPlan(plan) {
    var saved;
    try {
      saved = JSON.parse(localStorage.getItem('assigame_vendeur_draft') || '{}');
    } catch (e) {
      toast('Données d\'inscription invalides. Veuillez recommencer.');
      window.location.href = '/devenir-vendeur.html';
      return;
    }

    var payload = {
      nom: saved.nom,
      prenom: saved.prenom,
      email: saved.email,
      telephone: saved.telephone,
      sexe: saved.sexe,
      motDePasse: saved.motDePasse,
      typeVendeur: plan
    };

    try {
      await AssigameAPI.register(payload);
      localStorage.removeItem('assigame_vendeur_draft');
      toast('Demande envoyée avec succès');
      window.location.href = '/vendeur/paiement.html?plan=' + encodeURIComponent(plan);
    } catch (err) {
      toast(err.message || 'Erreur lors de l\'inscription');
    }
  }

  function renderCard(type) {
    var nom = type.nom_typeutilisateur;
    var meta = planMeta[nom] || {
      tagline: type.libelle_typeutilisateur || nom,
      price: '—',
      suffix: '',
      features: ['Quota produits selon offre', 'Support Assigame'],
      cta: 'Choisir cette offre',
      icon: 'ph-check-circle',
      iconTone: 'green'
    };
    var featured = !!meta.featured;
    var description = type.description_typeutilisateur || '';

    return (
      '<article class="card pricing-card choix-offre-card' + (featured ? ' pricing-card--featured' : '') + '">' +
        (meta.badge ? '<div class="pricing-badge">' + meta.badge + '</div>' : '') +
        '<div class="pricing-header">' +
          '<p class="choix-offre-tagline">' + meta.tagline + '</p>' +
          '<h2>' + (type.libelle_typeutilisateur || nom) + '</h2>' +
          '<div class="pricing-price">' + meta.price + '<span> $' + (meta.suffix || '') + '</span></div>' +
          (description ? '<p class="choix-offre-desc">' + description + '</p>' : '') +
        '</div>' +
        '<ul class="pricing-features choix-offre-features choix-offre-features--' + meta.iconTone + '">' +
          meta.features.map(function (f) {
            return '<li><i class="ph ' + meta.icon + '"></i> ' + f + '</li>';
          }).join('') +
        '</ul>' +
        '<button type="button" class="btn ' + (featured ? 'btn-primary' : 'btn-secondary') + ' w-100" data-plan="' + nom + '">' + meta.cta + '</button>' +
      '</article>'
    );
  }

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

    grid.innerHTML = vendeurTypes.map(renderCard).join('');

    grid.querySelectorAll('[data-plan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectPlan(btn.getAttribute('data-plan'));
      });
    });
  } catch (err) {
    grid.innerHTML = '<div class="catalog-error"><p>Impossible de charger les offres.</p></div>';
    toast(err.message || 'Erreur de chargement');
  }
});
