package com.esgis2026.assigame.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.CategorieProduit;
import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.CategorieProduitRepository;
import com.esgis2026.assigame.repository.ProduitRepository;
import com.esgis2026.assigame.repository.UtilisateurRepository;
import com.esgis2026.assigame.security.CustomUserDetails;

import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    public static final String STATUT_EN_ATTENTE = "EN_ATTENTE";
    public static final String STATUT_ACTIF = "ACTIF";
    public static final String STATUT_REFUSE = "REFUSE";

    private static final int MIN_IMAGES = 4;
    private static final int MAX_IMAGES = 6;
    private static final int MAX_DESCRIPTION_LENGTH = 2000;

    private final ProduitRepository produitRepository;
    private final CategorieProduitRepository categorieProduitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VendeurQuotaService vendeurQuotaService;

    public ProduitService(ProduitRepository produitRepository,
            CategorieProduitRepository categorieProduitRepository,
            UtilisateurRepository utilisateurRepository,
            VendeurQuotaService vendeurQuotaService) {
        this.produitRepository = produitRepository;
        this.categorieProduitRepository = categorieProduitRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.vendeurQuotaService = vendeurQuotaService;
    }

    public List<Produit> getProduitsPublics() {
        return produitRepository.findAllActifs();
    }

    public Optional<Produit> getProduitPublicById(Long id) {
        return produitRepository.findById(id)
                .filter(produit -> STATUT_ACTIF.equals(produit.getStatut()));
    }

    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    public Optional<Produit> getProduitById(Long id) {
        return produitRepository.findById(id);
    }

    public Produit createProduit(Produit produit) {
        validerImages(produit.getImage());
        validerDescription(produit.getDescription());

        boolean admin = isCurrentUserAdmin();
        Utilisateur vendeur = (admin && produit.getId_utilisateur() != null
                && produit.getId_utilisateur().getId_utilisateur() != null)
                        ? resolveVendeurValide(produit.getId_utilisateur())
                        : currentUtilisateur();

        Optional<Produit> existant = produitRepository.findByNomAndVendeur(
                produit.getNom_produit(), vendeur.getId_utilisateur());

        if (existant.isPresent()) {
            Produit ancien = existant.get();
            if (STATUT_ACTIF.equals(ancien.getStatut())) {
                throw new RuntimeException(
                        "Vous avez déjà un produit publié avec ce nom. Choisissez un autre nom.");
            }
            return mettreAJourProduitExistant(ancien, produit, admin);
        }

        if (!admin) {
            vendeurQuotaService.verifierQuotaPublication(vendeur);
        }
        produit.setId_utilisateur(vendeur);
        produit.setIdcategorie_produit(resolveCategorieValide(produit.getIdcategorie_produit()));
        produit.setStatut(STATUT_EN_ATTENTE);
        return produitRepository.save(produit);
    }

    private Produit mettreAJourProduitExistant(Produit ancien, Produit produitDetails, boolean admin) {
        ancien.setPrix(produitDetails.getPrix());
        ancien.setDescription(produitDetails.getDescription());
        ancien.setImage(produitDetails.getImage());
        ancien.setIdcategorie_produit(resolveCategorieValide(produitDetails.getIdcategorie_produit()));
        if (!admin) {
            ancien.setStatut(STATUT_EN_ATTENTE);
        }
        return produitRepository.save(ancien);
    }

    /** Vérifie que le champ image contient entre 4 et 6 chemins (CSV). */
    private void validerImages(String imageCsv) {
        long count = (imageCsv == null || imageCsv.isBlank())
                ? 0
                : java.util.Arrays.stream(imageCsv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .count();
        if (count < MIN_IMAGES || count > MAX_IMAGES) {
            throw new RuntimeException(
                    "Vous devez fournir entre " + MIN_IMAGES + " et " + MAX_IMAGES + " photos (reçu : " + count + ").");
        }
    }

    private void validerDescription(String description) {
        if (description != null && description.length() > MAX_DESCRIPTION_LENGTH) {
            throw new RuntimeException(
                    "La description ne peut pas dépasser " + MAX_DESCRIPTION_LENGTH + " caractères.");
        }
    }

    /** Retourne l'utilisateur actuellement authentifié. */
    private Utilisateur currentUtilisateur() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new RuntimeException("Vous devez être connecté pour publier un produit.");
        }
        return utilisateurRepository.findByIdWithType(principal.getUtilisateur().getId_utilisateur())
                .orElseThrow(() -> new RuntimeException("Utilisateur connecté introuvable."));
    }

    public Produit updateProduit(Long id, Produit produitDetails) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID " + id));

        Optional<Produit> duplicate = produitRepository.findByNomAndVendeur(
                produitDetails.getNom_produit(), produit.getId_utilisateur().getId_utilisateur());
        if (duplicate.isPresent() && !duplicate.get().getId_produit().equals(id)) {
            throw new RuntimeException(
                    "Vous avez déjà un autre produit avec ce nom : " + produitDetails.getNom_produit());
        }

        produit.setNom_produit(produitDetails.getNom_produit());
        produit.setPrix(produitDetails.getPrix());
        produit.setIdcategorie_produit(resolveCategorieValide(produitDetails.getIdcategorie_produit()));

        if (produitDetails.getDescription() != null) {
            validerDescription(produitDetails.getDescription());
            produit.setDescription(produitDetails.getDescription());
        }
        if (produitDetails.getImage() != null) {
            validerImages(produitDetails.getImage());
            produit.setImage(produitDetails.getImage());
        }

        if (!isCurrentUserAdmin()) {
            produit.setStatut(STATUT_EN_ATTENTE);
        }

        return produitRepository.save(produit);
    }

    public void deleteProduit(Long id) {
        produitRepository.deleteById(id);
    }

    private CategorieProduit resolveCategorieValide(CategorieProduit categorie) {
        if (categorie == null || categorie.getIdcategorie_produit() == null) {
            throw new RuntimeException("Une catégorie valide est obligatoire pour publier un produit");
        }
        return categorieProduitRepository.findById(categorie.getIdcategorie_produit())
                .orElseThrow(() -> new RuntimeException(
                        "Catégorie introuvable avec l'ID " + categorie.getIdcategorie_produit()));
    }

    private Utilisateur resolveVendeurValide(Utilisateur vendeur) {
        if (vendeur == null || vendeur.getId_utilisateur() == null) {
            throw new RuntimeException("Un vendeur valide est obligatoire pour publier un produit");
        }
        return utilisateurRepository.findByIdWithType(vendeur.getId_utilisateur())
                .orElseThrow(() -> new RuntimeException(
                        "Vendeur introuvable avec l'ID " + vendeur.getId_utilisateur()));
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
