package com.esgis2026.assigame.service;

import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.UtilisateurRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Retourne la liste de tous les utilisateurs inscrits.
     * @return Liste d'utilisateurs.
     */
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    /**
     * Récupère un utilisateur selon son ID.
     * @param id L'identifiant de l'utilisateur.
     * @return Un Optional contenant l'utilisateur s'il existe.
     */
    public Optional<Utilisateur> getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id);
    }

    /**
     * Ajoute un nouvel utilisateur dans la base de données.
     * @param utilisateur L'objet utilisateur à enregistrer.
     * @return L'utilisateur sauvegardé.
     */
    public Utilisateur createUtilisateur(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Met à jour le profil d'un utilisateur existant.
     * @param id L'identifiant de l'utilisateur à modifier.
     * @param utilisateurDetails Les nouvelles données de l'utilisateur.
     * @return L'utilisateur mis à jour.
     */
    public Utilisateur updateUtilisateur(Long id, Utilisateur utilisateurDetails) {
        return utilisateurRepository.findById(id)
                .map(utilisateur -> {
                    utilisateur.setNom_utilisateur(utilisateurDetails.getNom_utilisateur());
                    utilisateur.setEmail_utilisateur(utilisateurDetails.getEmail_utilisateur());
                    utilisateur.setMot_de_passe_utilisateur(utilisateurDetails.getMot_de_passe_utilisateur());
                    return utilisateurRepository.save(utilisateur);
                })
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID " + id));
    }

    /**
     * Supprime définitivement un utilisateur de la base.
     * @param id L'identifiant de l'utilisateur à effacer.
     */
    public void deleteUtilisateur(Long id) {
        utilisateurRepository.deleteById(id);
    }

    /**
     * Recherche un utilisateur spécifiquement par son adresse email.
     * @param email_utilisateur L'email à chercher.
     * @return Un Optional contenant l'utilisateur correspondant s'il est trouvé.
     */
    public Optional<Utilisateur> getUtilisateurByEmail(String email_utilisateur) {
        return utilisateurRepository.findByEmail_utilisateur(email_utilisateur);
    }
}
