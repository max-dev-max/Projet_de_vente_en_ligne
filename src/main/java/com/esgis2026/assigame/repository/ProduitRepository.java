package com.esgis2026.assigame.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT p FROM Produit p WHERE p.nom_produit = ?1 AND p.id_utilisateur.id_utilisateur = ?2")
    Optional<Produit> findByNomAndVendeur(String nom_produit, Long id_utilisateur);

    @Query("SELECT p FROM Produit p WHERE p.statut = ?1 ORDER BY p.date_ajout DESC")
    List<Produit> findByStatut(String statut);

    @Query("""
            SELECT p FROM Produit p
            JOIN FETCH p.idcategorie_produit
            JOIN FETCH p.id_utilisateur u
            JOIN FETCH u.id_typeutilisateur
            WHERE p.statut = 'EN_ATTENTE'
            ORDER BY p.date_ajout DESC
            """)
    List<Produit> findDemandesEnAttenteWithDetails();

    @Query("""
            SELECT p FROM Produit p
            JOIN FETCH p.idcategorie_produit
            JOIN FETCH p.id_utilisateur u
            JOIN FETCH u.id_typeutilisateur
            ORDER BY p.date_ajout DESC
            """)
    List<Produit> findAllWithDetails();

    @Query("SELECT p FROM Produit p JOIN FETCH p.idcategorie_produit WHERE p.statut = 'ACTIF' ORDER BY p.date_ajout DESC")
    List<Produit> findAllActifs();

    @Query("SELECT COUNT(p) FROM Produit p WHERE p.id_utilisateur.id_utilisateur = ?1 AND p.statut = ?2")
    long countByVendeurIdAndStatut(Long id_utilisateur, String statut);

    @Query("SELECT COUNT(p) FROM Produit p WHERE p.id_utilisateur.id_utilisateur = ?1")
    long countByVendeurId(Long id_utilisateur);

    @Query("SELECT p FROM Produit p JOIN FETCH p.id_utilisateur u JOIN FETCH u.id_typeutilisateur WHERE p.id_produit = ?1")
    Optional<Produit> findByIdWithVendeur(Long id_produit);

    @Query("""
            SELECT p FROM Produit p
            JOIN FETCH p.idcategorie_produit
            JOIN FETCH p.id_utilisateur
            WHERE p.id_produit = :id
            """)
    Optional<Produit> findPublicByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Produit p JOIN FETCH p.idcategorie_produit WHERE p.id_utilisateur.id_utilisateur = ?1 ORDER BY p.date_ajout DESC")
    List<Produit> findByVendeurId(Long id_utilisateur);

    @Query("""
            SELECT p FROM Produit p
            JOIN FETCH p.idcategorie_produit
            WHERE p.statut = 'ACTIF'
              AND p.idcategorie_produit.idcategorie_produit = :categorieId
              AND p.id_produit <> :excludeId
            ORDER BY p.date_ajout DESC
            """)
    List<Produit> findSimilairesActifsByCategorie(@Param("categorieId") Long categorieId,
            @Param("excludeId") Long excludeId);
}
