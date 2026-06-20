package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.*;
import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.service.UtilisateurService;

import java.util.List;
import java.util.Optional;

/**
 * CRUD des utilisateurs de la plateforme.
 * Nécessite une authentification (token JWT).
 */
@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    /**
     * Récupère la liste globale des utilisateurs du système.
     * @return Liste de tous les utilisateurs.
     */
    @GetMapping("/list")
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs();
    }

    /**
     * Recherche un utilisateur par son adresse email.
     * @param email_utilisateur Email de l'utilisateur (ex. admin@assigame.com).
     * @return L'utilisateur s'il existe.
     */
    @GetMapping("/search/{email_utilisateur}")
    public Optional<Utilisateur> getUtilisateurByEmail(@PathVariable String email_utilisateur) {
        return utilisateurService.getUtilisateurByEmail(email_utilisateur);
    }

    /**
     * Inscrit un nouvel utilisateur dans le système.
     * @param utilisateur Les données de l'utilisateur à créer.
     * @return L'utilisateur tout juste créé.
     */
    @PostMapping("/create")
    public Utilisateur createUtilisateur(@RequestBody Utilisateur utilisateur) {
        return utilisateurService.createUtilisateur(utilisateur);
    }

    /**
     * Met à jour le profil d'un utilisateur (nom, email, mot de passe).
     * @param email_utilisateur Email de l'utilisateur à modifier.
     * @param utilisateurDetails Les nouvelles valeurs.
     * @return L'utilisateur avec ses nouvelles données.
     */
    @PutMapping("/update/{email_utilisateur}")
    public Utilisateur updateUtilisateur(@PathVariable String email_utilisateur,
            @RequestBody Utilisateur utilisateurDetails) {
        return utilisateurService.updateUtilisateur(email_utilisateur, utilisateurDetails);
    }

    /**
     * Supprime un utilisateur de la plateforme.
     * @param email_utilisateur Email de l'utilisateur à supprimer.
     */
    @DeleteMapping("/delete/{email_utilisateur}")
    public void deleteUtilisateur(@PathVariable String email_utilisateur) {
        utilisateurService.deleteUtilisateur(email_utilisateur);
    }
}
