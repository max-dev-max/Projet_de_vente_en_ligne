package com.esgis2026.assigame.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.Utilisateur;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Recherche un utilisateur par son adresse email.
     * 
     * @param email_utilisateur L'adresse email à rechercher.
     * @return Un Optional contenant l'utilisateur s'il est trouvé, sinon vide.
     */
    @Query("SELECT u FROM Utilisateur u JOIN FETCH u.id_typeutilisateur WHERE u.email_utilisateur = ?1")
    Optional<Utilisateur> findByEmail_utilisateur(String email_utilisateur);

    @Query("SELECT u FROM Utilisateur u JOIN FETCH u.id_typeutilisateur WHERE u.statut_compte = ?1 ORDER BY u.id_utilisateur")
    List<Utilisateur> findByStatut_compte(String statut_compte);

    @Query("SELECT u FROM Utilisateur u JOIN FETCH u.id_typeutilisateur WHERE u.id_utilisateur = ?1")
    Optional<Utilisateur> findByIdWithType(Long id_utilisateur);

    @Query("""
            SELECT u FROM Utilisateur u
            JOIN FETCH u.id_typeutilisateur t
            WHERE t.nom_typeutilisateur <> 'ADMIN'
            ORDER BY u.date_creation DESC, u.id_utilisateur DESC
            """)
    List<Utilisateur> findAllVendeursWithType();

}
