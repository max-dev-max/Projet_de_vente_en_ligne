package com.esgis2026.assigame.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.Produit;

/**
 * Accès aux données de la table produit.
 * Hérite des méthodes CRUD de JpaRepository (findAll, save, deleteById, etc.).
 */
@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    @Query("SELECT p FROM Produit p WHERE p.nom_produit = ?1")
    Optional<Produit> findByNom_produit(String nom_produit);

    @Query("SELECT p FROM Produit p WHERE p.statut = ?1 ORDER BY p.date_ajout DESC")
    List<Produit> findByStatut(String statut);

    @Query("SELECT p FROM Produit p WHERE p.statut = 'ACTIF' ORDER BY p.date_ajout DESC")
    List<Produit> findAllActifs();

    @Query("SELECT COUNT(p) FROM Produit p WHERE p.id_utilisateur.id_utilisateur = ?1 AND p.statut = ?2")
    long countByVendeurIdAndStatut(Long id_utilisateur, String statut);

    @Query("SELECT p FROM Produit p JOIN FETCH p.id_utilisateur u JOIN FETCH u.id_typeutilisateur WHERE p.id_produit = ?1")
    Optional<Produit> findByIdWithVendeur(Long id_produit);
}
