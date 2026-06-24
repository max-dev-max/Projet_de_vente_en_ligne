package com.esgis2026.assigame.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.esgis2026.assigame.dto.admin.AdminVendorResponse;
import com.esgis2026.assigame.dto.auth.UserResponse;
import com.esgis2026.assigame.entity.TypeUtilisateur;
import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.ProduitRepository;
import com.esgis2026.assigame.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminVendeurService {

    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;

    @Transactional(readOnly = true)
    public List<AdminVendorResponse> getAllVendeurs() {
        return utilisateurRepository.findAllVendeursWithType().stream()
                .map(this::toAdminVendorResponse)
                .toList();
    }

    /**
     * Liste les demandes d'inscription vendeur en attente de validation.
     */
    public List<UserResponse> getDemandesEnAttente() {
        return utilisateurRepository.findByStatut_compte("EN_ATTENTE").stream()
                .map(this::toUserResponse)
                .toList();
    }

    /**
     * Approuve une demande : le vendeur passe au statut ACTIF et peut se connecter.
     */
    @Transactional
    public UserResponse approuverDemande(Long id) {
        Utilisateur vendeur = getVendeurEnAttente(id);
        vendeur.setStatut_compte("ACTIF");
        return toUserResponse(utilisateurRepository.save(vendeur));
    }

    /**
     * Refuse une demande : le statut passe à REFUSE.
     */
    @Transactional
    public UserResponse refuserDemande(Long id) {
        Utilisateur vendeur = getVendeurEnAttente(id);
        vendeur.setStatut_compte("REFUSE");
        return toUserResponse(utilisateurRepository.save(vendeur));
    }

    private Utilisateur getVendeurEnAttente(Long id) {
        Utilisateur vendeur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande vendeur introuvable"));

        if (!"EN_ATTENTE".equals(vendeur.getStatut_compte())) {
            throw new RuntimeException("Cette demande n'est pas en attente de validation");
        }
        if ("ADMIN".equals(vendeur.getId_typeutilisateur().getNom_typeutilisateur())) {
            throw new RuntimeException("Impossible de traiter une demande administrateur");
        }
        return vendeur;
    }

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

    private AdminVendorResponse toAdminVendorResponse(Utilisateur user) {
        TypeUtilisateur type = user.getId_typeutilisateur();
        return AdminVendorResponse.builder()
                .id(user.getId_utilisateur())
                .nom(user.getNom_utilisateur())
                .prenom(user.getPrenom_utilisateur())
                .email(user.getEmail_utilisateur())
                .telephone(user.getTelephone_utilisateur())
                .sexe(user.getSexe_utilisateur())
                .role(type.getNom_typeutilisateur())
                .roleLibelle(type.getLibelle_typeutilisateur())
                .roleDescription(type.getDescription_typeutilisateur())
                .statut(user.getStatut_compte())
                .dateCreation(user.getDate_creation())
                .nombreProduits(produitRepository.countByVendeurId(user.getId_utilisateur()))
                .build();
    }
}
