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

import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    public static final String STATUT_EN_ATTENTE = "EN_ATTENTE";
    public static final String STATUT_ACTIF = "ACTIF";
    public static final String STATUT_REFUSE = "REFUSE";

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
        if (produitRepository.findByNom_produit(produit.getNom_produit()).isPresent()) {
            throw new RuntimeException("Un produit avec ce nom existe déjà : " + produit.getNom_produit());
        }
        Utilisateur vendeur = resolveVendeurValide(produit.getId_utilisateur());
        if (!isCurrentUserAdmin()) {
            vendeurQuotaService.verifierQuotaPublication(vendeur);
        }
        produit.setId_utilisateur(vendeur);
        produit.setIdcategorie_produit(resolveCategorieValide(produit.getIdcategorie_produit()));
        produit.setStatut(STATUT_EN_ATTENTE);
        return produitRepository.save(produit);
    }

    public Produit updateProduit(Long id, Produit produitDetails) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID " + id));

        Optional<Produit> duplicate = produitRepository.findByNom_produit(produitDetails.getNom_produit());
        if (duplicate.isPresent() && !duplicate.get().getId_produit().equals(id)) {
            throw new RuntimeException(
                    "Un produit avec ce nom existe déjà : " + produitDetails.getNom_produit());
        }

        produit.setNom_produit(produitDetails.getNom_produit());
        produit.setPrix(produitDetails.getPrix());
        produit.setIdcategorie_produit(resolveCategorieValide(produitDetails.getIdcategorie_produit()));

        if (produitDetails.getDescription() != null) {
            produit.setDescription(produitDetails.getDescription());
        }
        if (produitDetails.getImage() != null) {
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
