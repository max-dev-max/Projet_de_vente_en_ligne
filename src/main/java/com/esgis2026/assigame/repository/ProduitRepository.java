package com.esgis2026.assigame.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.Produit;

/**
 * Accès aux données de la table produit.
 * Hérite des méthodes CRUD de JpaRepository (findAll, save, deleteById, etc.).
 */
@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

}
