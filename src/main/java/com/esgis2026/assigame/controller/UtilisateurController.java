package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.*;
import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.service.UtilisateurService;

import java.util.List;
import java.util.Optional;

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
    @GetMapping
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs();
    }

    /**
     * Recherche un utilisateur spécifique grâce à son ID.
     * @param id Identifiant de l'utilisateur.
     * @return L'utilisateur s'il existe.
     */
    @GetMapping("/{id}")
    public Optional<Utilisateur> getUtilisateurById(@PathVariable Long id) {
        return utilisateurService.getUtilisateurById(id);
    }

    /**
     * Inscrit un nouvel utilisateur dans le système.
     * @param utilisateur Les données de l'utilisateur à créer.
     * @return L'utilisateur tout juste créé.
     */
    @PostMapping
    public Utilisateur createUtilisateur(@RequestBody Utilisateur utilisateur) {
        return utilisateurService.createUtilisateur(utilisateur);
    }

    /**
     * Met à jour le profil d'un utilisateur (nom, email, mot de passe).
     * @param id L'ID de l'utilisateur concerné.
     * @param utilisateurDetails Les nouvelles valeurs.
     * @return L'utilisateur avec ses nouvelles données.
     */
    @PutMapping("/{id}")
    public Utilisateur updateUtilisateur(@PathVariable Long id, @RequestBody Utilisateur utilisateurDetails) {
        return utilisateurService.updateUtilisateur(id, utilisateurDetails);
    }

    /**
     * Supprime un utilisateur de la plateforme.
     * @param id Identifiant de l'utilisateur à supprimer.
     */
    @DeleteMapping("/{id}")
    public void deleteUtilisateur(@PathVariable Long id) {
        utilisateurService.deleteUtilisateur(id);
    }
}
