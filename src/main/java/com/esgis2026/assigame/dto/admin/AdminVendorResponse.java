package com.esgis2026.assigame.dto.admin;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminVendorResponse {
    Long id;
    String nom;
    String prenom;
    String email;
    String telephone;
    String sexe;
    String role;
    String roleLibelle;
    String roleDescription;
    String statut;
    LocalDateTime dateCreation;
    long nombreProduits;
}
