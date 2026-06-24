package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.service.FileStorageService;
import com.esgis2026.assigame.service.ProduitService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * CRUD du catalogue produits.
 * Lecture publique (GET), création/modification/suppression réservées aux vendeurs et admin.
 */
@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService produitService;
    private final FileStorageService fileStorageService;

    public ProduitController(ProduitService produitService, FileStorageService fileStorageService) {
        this.produitService = produitService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload des photos d'un produit (4 à 6). Réservé aux vendeurs et admin.
     * @param files Les fichiers images.
     * @return Les chemins publics des fichiers enregistrés.
     */
    @PostMapping("/upload")
    public Map<String, List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> urls = fileStorageService.stockerPlusieurs(files);
        return Map.of("urls", urls);
    }

    /**
     * Récupère tous les produits disponibles.
     * @return Liste de produits.
     */
    @GetMapping("/list")
    public List<Produit> getAllProduits() {
        return produitService.getProduitsPublics();
    }

    /**
     * Liste les produits du vendeur connecté (tous statuts).
     * @return Produits appartenant à l'utilisateur authentifié.
     */
    @GetMapping("/mes-produits")
    public List<Produit> getMesProduits() {
        return produitService.getMesProduits();
    }

    /**
     * Récupère les détails d'un produit visible sur la plateforme (statut ACTIF).
     * @param id Identifiant du produit.
     * @return Produit correspondant ou vide s'il n'existe pas ou n'est pas publié.
     */
    @GetMapping("/search/{id}")
    public Optional<Produit> getProduitById(@PathVariable Long id) {
        return produitService.getProduitPublicById(id);
    }

    /**
     * Produits actifs de la même catégorie que le produit consulté (hors produit courant).
     */
    @GetMapping("/search/{id}/similaires")
    public List<Produit> getProduitsSimilaires(@PathVariable Long id) {
        return produitService.getProduitsSimilaires(id);
    }

    /**
     * Ajoute un nouveau produit au catalogue.
     * @param produit Le produit à enregistrer.
     * @return Le produit enregistré.
     */
    @PostMapping("/create")
    public Produit createProduit(@RequestBody Produit produit) {
        return produitService.createProduit(produit);
    }

    /**
     * Met à jour les informations d'un produit.
     * @param id Identifiant du produit à mettre à jour.
     * @param produitDetails Les nouvelles informations.
     * @return Le produit modifié.
     */
    @PutMapping("/update/{id}")
    public Produit updateProduit(@PathVariable Long id, @RequestBody Produit produitDetails) {
        return produitService.updateProduit(id, produitDetails);
    }

    /**
     * Supprime un produit du catalogue.
     * @param id Identifiant du produit à supprimer.
     */
    @DeleteMapping("/delete/{id}")
    public void deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
    }
}
