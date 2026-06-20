package com.esgis2026.assigame.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esgis2026.assigame.dto.auth.AuthResponse;
import com.esgis2026.assigame.dto.auth.LoginRequest;
import com.esgis2026.assigame.dto.auth.RegisterRequest;
import com.esgis2026.assigame.dto.auth.RegisterResponse;
import com.esgis2026.assigame.dto.auth.UserResponse;
import com.esgis2026.assigame.entity.TypeUtilisateur;
import com.esgis2026.assigame.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Endpoints d'authentification : inscription vendeur, connexion, déconnexion et profil.
 * Base URL : /api/auth — la plupart des routes sont publiques (sans token).
 */
@RestController
@RequestMapping("/api/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Soumet une demande d'inscription vendeur (statut EN_ATTENTE).
     * @param request Nom, email, mot de passe, type vendeur, etc.
     * @return Message de confirmation + profil créé (sans token JWT).
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Liste les types de vendeur disponibles à l'inscription (Particulier, Professionnel, Partenaire Vip).
     * @return Liste des types avec libellé et description.
     */
    @GetMapping("/types-vendeur")
    public ResponseEntity<List<TypeUtilisateur>> getTypesVendeur() {
        return ResponseEntity.ok(authService.getTypesVendeur());
    }

    /**
     * Authentifie un utilisateur (admin ou vendeur ACTIF) et renvoie un token JWT.
     * @param request Email et mot de passe.
     * @return Token JWT + profil utilisateur (à envoyer dans Authorization: Bearer ...).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Déconnexion côté API (JWT stateless).
     * Le front doit supprimer le token stocké localement ; aucune action serveur requise.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    /**
     * Retourne le profil de l'utilisateur connecté (nécessite un token JWT valide).
     * @return Nom, email, rôle, statut du compte, etc.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
