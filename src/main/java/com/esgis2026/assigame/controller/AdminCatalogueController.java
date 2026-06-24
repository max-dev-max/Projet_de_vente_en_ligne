package com.esgis2026.assigame.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esgis2026.assigame.entity.Produit;
import com.esgis2026.assigame.service.AdminProduitService;

import lombok.RequiredArgsConstructor;

/**
 * Consultation admin de l'ensemble des produits de la plateforme.
 */
@RestController
@RequestMapping("/api/admin/produits")
@RequiredArgsConstructor
public class AdminCatalogueController {

    private final AdminProduitService adminProduitService;

    @GetMapping("/list")
    public ResponseEntity<List<Produit>> listAll() {
        return ResponseEntity.ok(adminProduitService.getAllProduits());
    }
}
