package com.esgis2026.assigame.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Données envoyées par le front pour la connexion (POST /api/auth/login).
 */
@Data
public class LoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String motDePasse;
}
