package com.esgis2026.assigame.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.repository.ProduitRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProduitService {

    private final ProduitRepository produitRepository;
    private final VendeurQuotaService vendeurQuotaService;

    public List<Produit> getDemandesEnAttente() {
        return produitRepository.findByStatut(ProduitService.STATUT_EN_ATTENTE);
    }

    @Transactional
    public Produit approuverProduit(Long id) {
        Produit produit = produitRepository.findByIdWithVendeur(id)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec l'ID " + id));
        if (!ProduitService.STATUT_EN_ATTENTE.equals(produit.getStatut())) {
            throw new RuntimeException("Ce produit n'est pas en attente de validation");
        }
        vendeurQuotaService.verifierQuotaPublication(produit.getId_utilisateur());
        produit.setStatut(ProduitService.STATUT_ACTIF);
        return produitRepository.save(produit);
    }

    @Transactional
    public Produit refuserProduit(Long id) {
        Produit produit = getProduitEnAttente(id);
        produit.setStatut(ProduitService.STATUT_REFUSE);
        return produitRepository.save(produit);
    }

    public Produit getProduitPourModeration(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec l'ID " + id));
    }

    private Produit getProduitEnAttente(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec l'ID " + id));

        if (!ProduitService.STATUT_EN_ATTENTE.equals(produit.getStatut())) {
            throw new RuntimeException("Ce produit n'est pas en attente de validation");
        }
        return produit;
    }
}
