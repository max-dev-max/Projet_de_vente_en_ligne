package com.esgis2026.assigame.dto.auth;

import lombok.Builder;
import lombok.Value;

/**
 * Profil utilisateur renvoyé au front (sans mot de passe ni identifiant interne).
 */
@Value
@Builder
public class UserResponse {
    String nom;
    String prenom;
    String email;
    String telephone;
    String sexe;
    /** Nom du type : ADMIN, Particulier, Professionnel, Partenaire Vip */
    String role;
    /** ACTIF, EN_ATTENTE, REFUSE ou SUSPENDU */
    String statut;
}
