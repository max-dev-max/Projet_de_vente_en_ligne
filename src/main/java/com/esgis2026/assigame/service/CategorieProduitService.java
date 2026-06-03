package com.esgis2026.assigame.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.CategorieProduit;
import com.esgis2026.assigame.repository.CategorieProduitRepository;

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
     * Crée une nouvelle catégorie de produit et la sauvegarde dans la base de
     * données.
     * 
     * @param categorieProduit L'objet catégorie à sauvegarder.
     * @return La catégorie sauvegardée avec son ID généré.
     */
    public CategorieProduit createCategorieProduit(CategorieProduit categorieProduit) {
        return categorieProduitRepository.save(categorieProduit);
    }

    /**
     * Supprime une catégorie de produit de la base de données à partir de son
     * identifiant.
     * 
     * @param idCategorieProduit L'identifiant de la catégorie à supprimer.
     */
    public void deleteCategorieProduit(Long idCategorieProduit) {
        categorieProduitRepository.deleteById(idCategorieProduit);
    }

    /**
     * Met à jour les informations d'une catégorie existante.
     * 
     * @param idCategorieProduit L'identifiant de la catégorie à modifier.
     * @param details            Les nouvelles données à appliquer.
     * @return La catégorie mise à jour.
     */
    public CategorieProduit updateCategorieProduit(Long idCategorieProduit, CategorieProduit details) {
        CategorieProduit categorieProduit = categorieProduitRepository.findById(idCategorieProduit)
                .orElseThrow(() -> new RuntimeException("CategorieProduit not found with id " + idCategorieProduit));
        categorieProduit.setNom_categorieproduit(details.getNom_categorieproduit());
        categorieProduit.setDescription(details.getDescription());
        return categorieProduitRepository.save(categorieProduit);
    }

}