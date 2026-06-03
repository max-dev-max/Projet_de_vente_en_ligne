package com.esgis2026.assigame.service;

import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.repository.ProduitRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    private final ProduitRepository produitRepository;

    public ProduitService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    /**
     * Récupère la liste de tous les produits.
     * @return Une liste de produits.
     */
    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    /**
     * Recherche un produit spécifique par son identifiant.
     * @param id L'identifiant du produit.
     * @return Un Optional contenant le produit s'il est trouvé.
     */
    public Optional<Produit> getProduitById(Long id) {
        return produitRepository.findById(id);
    }

    /**
     * Crée un nouveau produit dans la base de données.
     * @param produit Les données du produit à créer.
     * @return Le produit sauvegardé.
     */
    public Produit createProduit(Produit produit) {
        return produitRepository.save(produit);
    }

    /**
     * Met à jour un produit existant avec de nouvelles données.
     * @param id L'identifiant du produit à modifier.
     * @param produitDetails Les nouvelles informations du produit.
     * @return Le produit mis à jour.
     */
    public Produit updateProduit(Long id, Produit produitDetails) {
        return produitRepository.findById(id)
                .map(produit -> {
                    produit.setNom_produit(produitDetails.getNom_produit());
                    produit.setPrix(produitDetails.getPrix());
                    produit.setIdcategorie_produit(produitDetails.getIdcategorie_produit());
                    return produitRepository.save(produit);
                })
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID " + id));
    }

    /**
     * Supprime un produit de la base de données en utilisant son identifiant.
     * @param id L'identifiant du produit à supprimer.
     */
    public void deleteProduit(Long id) {
        produitRepository.deleteById(id);
    }
}
