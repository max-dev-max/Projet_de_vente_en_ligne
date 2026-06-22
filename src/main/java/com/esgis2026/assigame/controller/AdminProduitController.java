package com.esgis2026.assigame.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.service.AdminProduitService;

import lombok.RequiredArgsConstructor;

/**
 * Modération admin des produits soumis par les vendeurs.
 * Base URL : /api/admin/demandes-produits — réservé au rôle ADMIN.
 */
@RestController
@RequestMapping("/api/admin/demandes-produits")
@RequiredArgsConstructor
public class AdminProduitController {

    private final AdminProduitService adminProduitService;

    @GetMapping("/list")
    public ResponseEntity<List<Produit>> getDemandesEnAttente() {
        return ResponseEntity.ok(adminProduitService.getDemandesEnAttente());
    }

    @GetMapping("/search/{id}")
    public ResponseEntity<Produit> getProduitPourModeration(@PathVariable Long id) {
        return ResponseEntity.ok(adminProduitService.getProduitPourModeration(id));
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<Produit> approuverProduit(@PathVariable Long id) {
        return ResponseEntity.ok(adminProduitService.approuverProduit(id));
    }

    @PostMapping("/refuse/{id}")
    public ResponseEntity<Produit> refuserProduit(@PathVariable Long id) {
        return ResponseEntity.ok(adminProduitService.refuserProduit(id));
    }
}
