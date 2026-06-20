package com.esgis2026.assigame.dto.auth;

import lombok.Builder;
import lombok.Value;

/**
 * Réponse après connexion réussie : token JWT + profil utilisateur.
 */
@Value
@Builder
public class AuthResponse {
    /** Token JWT à envoyer dans le header Authorization: Bearer ... */
    String token;
    UserResponse utilisateur;
}
