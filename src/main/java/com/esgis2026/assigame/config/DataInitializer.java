package com.esgis2026.assigame.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.esgis2026.assigame.entity.TypeUtilisateur;
import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.TypeUtilisateurRepository;
import com.esgis2026.assigame.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

/**
 * Initialise les données de base au démarrage de l'application (rôles et compte admin).
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TypeUtilisateurRepository typeUtilisateurRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Exécuté automatiquement au lancement de Spring Boot.
     */
    @Override
    public void run(String... args) {
        // Crée les types d'utilisateur s'ils n'existent pas encore en base
        seedType("ADMIN", "Administrateur", "Rôle administrateur");
        seedType("Particulier", "Particulier", "Idéal pour vendre occasionnellement vos articles personnels.");
        seedType("Professionnel", "Professionnel", "Boostez votre visibilité et gérez votreboutique comme un pro.");
        seedType("Partenaire Vip", "Partenaire Vip", "L'offre ultime pour les marques et partenaires exclusifs.");

        // Crée le compte administrateur par défaut
        seedAdmin();
    }

    /**
     * Insère un type d'utilisateur uniquement s'il n'existe pas déjà (évite les doublons).
     */
    private void seedType(String nom, String libelle, String description) {
        typeUtilisateurRepository.findByNomType(nom)
                .orElseGet(() -> {
                    TypeUtilisateur type = new TypeUtilisateur();
                    type.setNom_typeutilisateur(nom);
                    type.setLibelle_typeutilisateur(libelle);
                    type.setDescription_typeutilisateur(description);
                    return typeUtilisateurRepository.save(type);
                });
    }

    /**
     * Crée un compte admin par défaut pour les tests (email : admin@assigame.com / mot de passe : Admin1234).
     */
    private void seedAdmin() {
        String email = "admin@assigame.com";
        // Ne recrée pas l'admin s'il existe déjà
        if (utilisateurRepository.findByEmail_utilisateur(email).isPresent()) {
            return;
        }

        TypeUtilisateur typeAdmin = typeUtilisateurRepository.findByNomType("ADMIN")
                .orElseThrow(() -> new RuntimeException("Type utilisateur ADMIN introuvable"));

        Utilisateur admin = new Utilisateur();
        admin.setNom_utilisateur("Admin");
        admin.setPrenom_utilisateur("Assigame");
        admin.setEmail_utilisateur(email);
        admin.setTelephone_utilisateur("0000000000");
        admin.setSexe_utilisateur("M");
        admin.setMot_de_passe_utilisateur(passwordEncoder.encode("Admin1234"));
        admin.setStatut_compte("ACTIF");
        admin.setId_typeutilisateur(typeAdmin);

        utilisateurRepository.save(admin);
    }
}
