package com.esgis2026.assigame.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.esgis2026.assigame.dto.auth.AuthResponse;
import com.esgis2026.assigame.dto.auth.LoginRequest;
import com.esgis2026.assigame.dto.auth.RegisterRequest;
import com.esgis2026.assigame.dto.auth.RegisterResponse;
import com.esgis2026.assigame.dto.auth.UserResponse;
import com.esgis2026.assigame.entity.TypeUtilisateur;
import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.TypeUtilisateurRepository;
import com.esgis2026.assigame.repository.UtilisateurRepository;
import com.esgis2026.assigame.security.CustomUserDetails;
import com.esgis2026.assigame.security.JwtService;

import java.util.List;

import lombok.RequiredArgsConstructor;

/**
 * Service d'authentification : inscription, connexion et récupération de l'utilisateur connecté.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final TypeUtilisateurRepository typeUtilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * Retourne les 3 types de vendeur disponibles à l'inscription.
     */
    public List<TypeUtilisateur> getTypesVendeur() {
        return typeUtilisateurRepository.findAllTypesVendeur();
    }

    /**
     * Enregistre une demande d'inscription vendeur en attente de validation admin.
     */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        TypeUtilisateur typeVendeur = typeUtilisateurRepository.findByNomType(request.getTypeVendeur())
                .orElseThrow(() -> new RuntimeException("Type vendeur introuvable : " + request.getTypeVendeur()));

        var existing = utilisateurRepository.findByEmail_utilisateur(request.getEmail());
        if (existing.isPresent()) {
            Utilisateur user = existing.get();
            if ("EN_ATTENTE".equals(user.getStatut_compte())) {
                throw new RuntimeException("Une demande est déjà en attente pour cet email");
            }
            if ("REFUSE".equals(user.getStatut_compte())) {
                return resoumettreDemande(user, request, typeVendeur);
            }
            throw new RuntimeException("Cet email est déjà inscrit");
        }

        Utilisateur user = new Utilisateur();
        user.setNom_utilisateur(request.getNom());
        user.setPrenom_utilisateur(request.getPrenom());
        user.setEmail_utilisateur(request.getEmail());
        user.setTelephone_utilisateur(request.getTelephone());
        user.setSexe_utilisateur(request.getSexe());
        user.setMot_de_passe_utilisateur(passwordEncoder.encode(request.getMotDePasse()));
        user.setStatut_compte("EN_ATTENTE");
        user.setId_typeutilisateur(typeVendeur);

        Utilisateur saved = utilisateurRepository.save(user);
        return RegisterResponse.builder()
                .message("Demande envoyée. En attente de validation par l'administrateur.")
                .utilisateur(toUserResponse(saved))
                .build();
    }

    private RegisterResponse resoumettreDemande(Utilisateur user, RegisterRequest request, TypeUtilisateur typeVendeur) {
        user.setNom_utilisateur(request.getNom());
        user.setPrenom_utilisateur(request.getPrenom());
        user.setTelephone_utilisateur(request.getTelephone());
        user.setSexe_utilisateur(request.getSexe());
        user.setMot_de_passe_utilisateur(passwordEncoder.encode(request.getMotDePasse()));
        user.setStatut_compte("EN_ATTENTE");
        user.setId_typeutilisateur(typeVendeur);

        Utilisateur saved = utilisateurRepository.save(user);
        return RegisterResponse.builder()
                .message("Demande renvoyée. En attente de validation par l'administrateur.")
                .utilisateur(toUserResponse(saved))
                .build();
    }

    /**
     * Authentifie un utilisateur par email/mot de passe et retourne un token JWT.
     */
    public AuthResponse login(LoginRequest request) {
        // Vérifie les identifiants via Spring Security (compare le hash du mot de passe)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Utilisateur user = userDetails.getUtilisateur();
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .utilisateur(toUserResponse(user))
                .build();
    }

    /**
     * Retourne l'utilisateur actuellement connecté (à partir du token JWT validé).
     */
    public UserResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        return toUserResponse(principal.getUtilisateur());
    }

    /**
     * Convertit une entité Utilisateur en DTO (sans exposer le mot de passe).
     */
    private UserResponse toUserResponse(Utilisateur user) {
        return UserResponse.builder()
                .nom(user.getNom_utilisateur())
                .prenom(user.getPrenom_utilisateur())
                .email(user.getEmail_utilisateur())
                .telephone(user.getTelephone_utilisateur())
                .sexe(user.getSexe_utilisateur())
                .role(user.getId_typeutilisateur().getNom_typeutilisateur())
                .statut(user.getStatut_compte())
                .build();
    }
}
