package com.esgis2026.assigame.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.CategorieProduit;
import com.esgis2026.assigame.repository.CategorieProduitRepository;

/**
 * Logique métier CRUD des catégories de produits.
 */
@Service
public class CategorieProduitService {

    final CategorieProduitRepository categorieProduitRepository;

    public CategorieProduitService(CategorieProduitRepository categorieProduitRepository) {
        this.categorieProduitRepository = categorieProduitRepository;
    }

    /**
     * Récupère la liste de toutes les catégories de produits.
     * 
     * @return Une liste contenant toutes les catégories.
     */
    public List<CategorieProduit> getAllCategorieProduit() {
        return categorieProduitRepository.findAll();

    }

    /**
     * Crée une nouvelle catégorie de produit.
     */
    public CategorieProduit createCategorieProduit(CategorieProduit categorieProduit){
        return categorieProduitRepository.save(categorieProduit);
    }

    /**
     * Supprime une catégorie par son nom.
     */
    public void deleteCategorieProduit(String nomCategorie) {
        CategorieProduit existing = categorieProduitRepository.findByNom_categorieproduit(nomCategorie)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable : " + nomCategorie));
        categorieProduitRepository.delete(existing);
    }

    /**
     * Met à jour le nom et la description d'une catégorie existante.
     */
    public CategorieProduit updateCategorieProduit(String nomCategorie, CategorieProduit categorieProduit) {
        CategorieProduit existing = categorieProduitRepository.findByNom_categorieproduit(nomCategorie)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable : " + nomCategorie));

        existing.setNom_categorieproduit(categorieProduit.getNom_categorieproduit());
        existing.setDescription(categorieProduit.getDescription());

        return categorieProduitRepository.save(existing);
    }

}