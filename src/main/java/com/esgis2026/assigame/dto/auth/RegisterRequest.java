package com.esgis2026.assigame.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    @Size(max = 50)
    private String nom;

    @NotBlank
    @Size(max = 50)
    private String prenom;

    @NotBlank
    @Email
    @Size(max = 50)
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String motDePasse;

    @NotBlank
    @Size(max = 50)
    private String sexe;

    @NotBlank
    @Size(max = 50)
    private String telephone;

    @NotBlank
    @Pattern(regexp = "Particulier|Professionnel|Partenaire Vip", message = "Type vendeur invalide")
    private String typeVendeur;
}
