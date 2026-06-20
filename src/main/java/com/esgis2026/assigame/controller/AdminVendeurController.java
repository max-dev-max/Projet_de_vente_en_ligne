package com.esgis2026.assigame.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esgis2026.assigame.dto.auth.UserResponse;
import com.esgis2026.assigame.service.AdminVendeurService;

import lombok.RequiredArgsConstructor;

/**
 * Gestion admin des demandes d'inscription vendeur.
 * Base URL : /api/admin/demandes-vendeur — réservé au rôle ADMIN (token JWT requis).
 */
@RestController
@RequestMapping("/api/admin/demandes-vendeur")
@RequiredArgsConstructor
public class AdminVendeurController {

    private final AdminVendeurService adminVendeurService;

    /**
     * Liste toutes les demandes vendeur en attente de validation (statut EN_ATTENTE).
     * @return Liste des profils vendeurs à traiter.
     */
    @GetMapping("/list")
    public ResponseEntity<List<UserResponse>> getDemandesEnAttente() {
        return ResponseEntity.ok(adminVendeurService.getDemandesEnAttente());
    }

    /**
     * Approuve une demande vendeur : le statut passe à ACTIF, le vendeur peut se connecter.
     * @param id Identifiant de l'utilisateur (id_utilisateur) concerné par la demande.
     * @return Profil vendeur mis à jour.
     */
    @PostMapping("/approve/{id}")
    public ResponseEntity<UserResponse> approuverDemande(@PathVariable Long id) {
        return ResponseEntity.ok(adminVendeurService.approuverDemande(id));
    }

    /**
     * Refuse une demande vendeur : le statut passe à REFUSE.
     * @param id Identifiant de l'utilisateur (id_utilisateur) concerné par la demande.
     * @return Profil vendeur mis à jour.
     */
    @PostMapping("/refuse/{id}")
    public ResponseEntity<UserResponse> refuserDemande(@PathVariable Long id) {
        return ResponseEntity.ok(adminVendeurService.refuserDemande(id));
    }
}
