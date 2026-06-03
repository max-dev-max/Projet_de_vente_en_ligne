package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.*;
import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.service.ProduitService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService produitService;

    public ProduitController(ProduitService produitService) {
        this.produitService = produitService;
    }

    /**
     * Récupère tous les produits disponibles.
     * @return Liste de produits.
     */
    @GetMapping
    public List<Produit> getAllProduits() {
        return produitService.getAllProduits();
    }

    /**
     * Récupère les détails d'un produit spécifique par son ID.
     * @param id Identifiant du produit.
     * @return Produit correspondant ou vide s'il n'existe pas.
     */
    @GetMapping("/{id}")
    public Optional<Produit> getProduitById(@PathVariable Long id) {
        return produitService.getProduitById(id);
    }

    /**
     * Ajoute un nouveau produit au catalogue.
     * @param produit Le produit à enregistrer.
     * @return Le produit enregistré.
     */
    @PostMapping
    public Produit createProduit(@RequestBody Produit produit) {
        return produitService.createProduit(produit);
    }

    /**
     * Met à jour les informations d'un produit.
     * @param id Identifiant du produit à mettre à jour.
     * @param produitDetails Les nouvelles informations.
     * @return Le produit modifié.
     */
    @PutMapping("/{id}")
    public Produit updateProduit(@PathVariable Long id, @RequestBody Produit produitDetails) {
        return produitService.updateProduit(id, produitDetails);
    }

    /**
     * Supprime un produit du catalogue.
     * @param id Identifiant du produit à supprimer.
     */
    @DeleteMapping("/{id}")
    public void deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
    }
}
