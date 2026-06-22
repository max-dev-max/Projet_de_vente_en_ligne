package com.esgis2026.assigame.service;

import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.ProduitRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VendeurQuotaService {

    public static final String MESSAGE_QUOTA_ATTEINT = "Vous avez atteint le nombre de produit actif";

    private static final String TYPE_PARTICULIER = "Particulier";
    private static final String TYPE_PROFESSIONNEL = "Professionnel";
    private static final String TYPE_PARTENAIRE_VIP = "Partenaire Vip";

    private static final int LIMITE_PARTICULIER = 5;
    private static final int LIMITE_PROFESSIONNEL = 15;

    private final ProduitRepository produitRepository;

    public void verifierQuotaPublication(Utilisateur vendeur) {
        int limite = getLimiteProduitsActifs(vendeur);
        if (limite < 0) {
            return;
        }
        long produitsActifs = produitRepository.countByVendeurIdAndStatut(
                vendeur.getId_utilisateur(), ProduitService.STATUT_ACTIF);
        if (produitsActifs >= limite) {
            throw new RuntimeException(MESSAGE_QUOTA_ATTEINT);
        }
    }

    private int getLimiteProduitsActifs(Utilisateur vendeur) {
        if (vendeur.getId_typeutilisateur() == null) {
            return LIMITE_PARTICULIER;
        }
        String type = vendeur.getId_typeutilisateur().getNom_typeutilisateur();
        return switch (type) {
            case TYPE_PARTICULIER -> LIMITE_PARTICULIER;
            case TYPE_PROFESSIONNEL -> LIMITE_PROFESSIONNEL;
            case TYPE_PARTENAIRE_VIP -> -1;
            default -> -1;
        };
    }
}
