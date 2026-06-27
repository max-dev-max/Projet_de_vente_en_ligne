# -*- coding: utf-8 -*-
"""Données pour cahier des charges Assigame (~14 pages)."""

ACTEURS = [
    ("Visiteur", "Consulte le catalogue et les fiches produit sans compte ; contact vendeur par téléphone."),
    ("Vendeur", "Publie et gère ses annonces selon son offre (Particulier, Professionnel, Partenaire Vip)."),
    ("Administrateur", "Modère inscriptions et produits ; gère catégories et types vendeur."),
]

EXIGENCES_FONCTIONNELLES_COMPACT = [
    ("EF-01", "Catalogue public : liste produits actifs, filtres, fiches détaillées, produits similaires"),
    ("EF-02", "Inscription vendeur : formulaire, choix d'offre, compte EN_ATTENTE jusqu'à validation"),
    ("EF-03", "Authentification vendeur par email/mot de passe (JWT)"),
    ("EF-04", "Espace vendeur : dashboard, publication (4–6 images), modification, suppression"),
    ("EF-05", "Quotas produits actifs : 5 / 15 / illimité selon l'offre"),
    ("EF-06", "Admin : connexion dédiée, dashboard KPI, modération vendeurs et produits"),
    ("EF-07", "Admin : gestion catégories (CRUD) et types vendeur (nom, description)"),
]

EXIGENCES_NON_FONCTIONNELLES = [
    ("ENF-01", "Authentification JWT stateless ; sessions admin et vendeur séparées"),
    ("ENF-02", "Mots de passe hashés BCrypt"),
    ("ENF-03", "API REST JSON ; persistance PostgreSQL via JPA"),
    ("ENF-04", "Upload images local (5 Mo max) ; interface HTML/CSS/JS responsive"),
]

CAS_UTILISATION_COMPACT = [
    ("UC-01", "Visiteur", "Consulter le catalogue", "Produits ACTIF affichés"),
    ("UC-02", "Visiteur", "Voir fiche produit / contacter vendeur", "Détail et téléphone affichés"),
    ("UC-03", "Vendeur", "S'inscrire et choisir une offre", "Compte EN_ATTENTE créé"),
    ("UC-04", "Vendeur", "Se connecter et gérer ses produits", "JWT ; liste et CRUD produits"),
    ("UC-05", "Vendeur", "Publier un produit", "Produit EN_ATTENTE si quota OK"),
    ("UC-06", "Admin", "Modérer vendeurs et produits", "Statuts ACTIF ou REFUSE"),
    ("UC-07", "Admin", "Gérer catégories et offres vendeur", "Catalogue et offres à jour"),
]

STACK_TECHNIQUE = [
    ("Backend", "Java 17, Spring Boot 4.0.6"),
    ("Base de données", "PostgreSQL, Spring Data JPA"),
    ("Sécurité", "Spring Security, JWT (jjwt)"),
    ("Frontend", "HTML5, CSS3, JavaScript vanilla"),
    ("Build", "Maven"),
]

API_ENDPOINTS_COMPACT = [
    ("POST /api/auth/register", "Public", "Inscription vendeur"),
    ("POST /api/auth/login", "Public", "Connexion → JWT"),
    ("GET /api/produits/list", "Public", "Catalogue produits actifs"),
    ("POST /api/produits/create", "Vendeur", "Créer un produit"),
    ("GET /api/admin/demandes-vendeur/list", "Admin", "Demandes vendeur en attente"),
    ("POST /api/admin/demandes-vendeur/approve/{id}", "Admin", "Approuver vendeur"),
    ("GET /api/admin/demandes-produits/list", "Admin", "Produits en attente"),
    ("POST /api/admin/demandes-produits/approve/{id}", "Admin", "Approuver produit"),
]

SCENARIOS_TEST = [
    ("T-01", "Visiteur consulte le catalogue", "Produits ACTIF affichés"),
    ("T-02", "Vendeur s'inscrit", "Compte EN_ATTENTE"),
    ("T-03", "Admin approuve vendeur et produit", "Compte et produit ACTIF"),
    ("T-04", "Quota Particulier dépassé", "Erreur métier"),
    ("T-05", "Connexion JWT invalide", "Accès API refusé"),
]

SCREENSHOTS = [
    ("F5", "01-catalogue.png", "Catalogue public"),
    ("F6", "02-fiche-produit.png", "Fiche produit"),
    ("F7", "03-devenir-vendeur.png", "Inscription vendeur"),
    ("F8", "05-connexion-vendeur.png", "Connexion vendeur"),
    ("F9", "07-dashboard-admin.png", "Dashboard administrateur"),
    ("F10", "08-demandes-vendeur.png", "Modération vendeurs"),
    ("F11", "09-demandes-produits.png", "Produits en attente"),
    ("F12", "10-categories.png", "Gestion des catégories"),
    ("F13", "11-types-vendeur.png", "Types vendeur"),
    ("F14", "15-ajout-produit.png", "Publication produit"),
]

DIAGRAMS = [
    ("F1", "use-case.png", "Cas d'utilisation"),
    ("F2", "class-diagram.png", "Diagramme de classes"),
    ("F3", "architecture.png", "Architecture"),
]
