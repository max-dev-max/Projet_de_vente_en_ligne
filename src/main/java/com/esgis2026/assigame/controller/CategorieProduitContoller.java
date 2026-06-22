package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.esgis2026.assigame.service.CategorieProduitService;
import com.esgis2026.assigame.entity.CategorieProduit;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * CRUD des catégories de produits.
 * Lecture publique (GET), création/modification/suppression réservées à l'admin.
 */
@RestController
@RequestMapping("/api/categorieproduit")
public class CategorieProduitContoller {

    private final CategorieProduitService categorieProduitService;

    public CategorieProduitContoller(CategorieProduitService categorieProduitService) {
        this.categorieProduitService = categorieProduitService;
    }

    /**
     * Point d'accès GET pour lister toutes les catégories.
     * 
     * @return Liste des catégories au format JSON.
     */
    @GetMapping("/list")
    public List<CategorieProduit> getAllCategorieProduit() {
        return categorieProduitService.getAllCategorieProduit();
    }

    /**
     * Point d'accès POST pour créer une nouvelle catégorie.
     * 
     * @param categorieProduit Les données JSON envoyées dans la requête.
     * @return La catégorie créée.
     */
    @PostMapping("/create")
    public CategorieProduit createCategorieProduit(@RequestBody CategorieProduit categorieProduit) {
        return categorieProduitService.createCategorieProduit(categorieProduit);
    }

    /**
     * Point d'accès DELETE pour supprimer une.
     * 
     * @param nomCategorie Nom de la catégorie passé dans l'URL.
     */
    @DeleteMapping("/delete/{nomCategorie}")
    public void deleteCategorieProduit(@PathVariable String nomCategorie) {
        categorieProduitService.deleteCategorieProduit(nomCategorie);
    }

    /**
     * Point d'accès PUT pour modifier une catégorie existante.
     * 
     * @param nomCategorie            Nom actuel de la catégorie à modifier.
     * @param categorieProduitDetails Les nouvelles données de la catégorie.
     * @return La catégorie mise à jour.
     */
    @PutMapping("/update/{nomCategorie}")
    public CategorieProduit updateCategorieProduit(@PathVariable String nomCategorie,
            @RequestBody CategorieProduit categorieProduitDetails) {
        return categorieProduitService.updateCategorieProduit(nomCategorie, categorieProduitDetails);
    }

}
