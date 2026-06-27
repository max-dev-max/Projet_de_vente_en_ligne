package com.esgis2026.assigame.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.CategorieProduit;

/**
 * Accès aux données de la table categorieproduit.
 * Hérite des méthodes CRUD de JpaRepository (findAll, save, deleteById, etc.).
 */
@Repository
public interface CategorieProduitRepository extends JpaRepository<CategorieProduit, Long> {

    @Query("SELECT c FROM CategorieProduit c WHERE c.nom_categorieproduit = ?1")
    Optional<CategorieProduit> findByNom_categorieproduit(String nom_categorieproduit);
}
