package com.esgis2026.assigame.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.UtilisateurRepository;

import java.util.List;
import java.util.Optional;

/**
 * Logique métier CRUD des utilisateurs (hors flux d'authentification principal).
 */
@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Retourne la liste de tous les utilisateurs inscrits.
     * @return Liste d'utilisateurs.
     */
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    /**
     * Recherche un utilisateur par son adresse email.
     * @param email_utilisateur L'email à chercher.
     * @return Un Optional contenant l'utilisateur s'il est trouvé.
     */
    public Optional<Utilisateur> getUtilisateurByEmail(String email_utilisateur) {
        return utilisateurRepository.findByEmail_utilisateur(email_utilisateur);
    }

    /**
     * Ajoute un nouvel utilisateur dans la base de données.
     * @param utilisateur L'objet utilisateur à enregistrer.
     * @return L'utilisateur sauvegardé.
     */
    public Utilisateur createUtilisateur(Utilisateur utilisateur) {
        utilisateur.setMot_de_passe_utilisateur(passwordEncoder.encode(utilisateur.getMot_de_passe_utilisateur()));
        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Met à jour le profil d'un utilisateur existant.
     * @param email_utilisateur L'email de l'utilisateur à modifier.
     * @param utilisateurDetails Les nouvelles données de l'utilisateur.
     * @return L'utilisateur mis à jour.
     */
    public Utilisateur updateUtilisateur(String email_utilisateur, Utilisateur utilisateurDetails) {
        return utilisateurRepository.findByEmail_utilisateur(email_utilisateur)
                .map(utilisateur -> {
                    utilisateur.setNom_utilisateur(utilisateurDetails.getNom_utilisateur());
                    utilisateur.setPrenom_utilisateur(utilisateurDetails.getPrenom_utilisateur());
                    utilisateur.setEmail_utilisateur(utilisateurDetails.getEmail_utilisateur());
                    utilisateur.setSexe_utilisateur(utilisateurDetails.getSexe_utilisateur());
                    utilisateur.setTelephone_utilisateur(utilisateurDetails.getTelephone_utilisateur());
                    utilisateur.setStatut_compte(utilisateurDetails.getStatut_compte());

                    if (utilisateurDetails.getMot_de_passe_utilisateur() != null
                            && !utilisateurDetails.getMot_de_passe_utilisateur().isBlank()) {
                        utilisateur.setMot_de_passe_utilisateur(
                                passwordEncoder.encode(utilisateurDetails.getMot_de_passe_utilisateur()));
                    }
                    return utilisateurRepository.save(utilisateur);
                })
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email " + email_utilisateur));
    }

    /**
     * Supprime définitivement un utilisateur de la base.
     * @param email_utilisateur L'email de l'utilisateur à effacer.
     */
    public void deleteUtilisateur(String email_utilisateur) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail_utilisateur(email_utilisateur)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email " + email_utilisateur));
        utilisateurRepository.delete(utilisateur);
    }
}
