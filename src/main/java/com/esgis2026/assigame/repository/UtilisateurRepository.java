package com.esgis2026.assigame.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.Utilisateur;

import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Recherche un utilisateur par son adresse email.
     * 
     * @param email_utilisateur L'adresse email à rechercher.
     * @return Un Optional contenant l'utilisateur s'il est trouvé, sinon vide.
     */
    @Query("SELECT u FROM Utilisateur u WHERE u.email_utilisateur = ?1")
    Optional<Utilisateur> findByEmail_utilisateur(String email_utilisateur);

}
