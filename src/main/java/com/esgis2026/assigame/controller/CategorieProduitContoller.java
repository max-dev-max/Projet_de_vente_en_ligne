package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.esgis2026.assigame.service.CategorieProduitService;
import com.esgis2026.assigame.entity.CategorieProduit;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/categorieproduit")
public class CategorieProduitContoller {

    private final CategorieProduitService categorieProduitService;

    public CategorieProduitContoller(CategorieProduitService categorieProduitService) {
        this.categorieProduitService = categorieProduitService;
    }

    @GetMapping("/list")
    public List<CategorieProduit> getAllCategorieProduit() {
        return categorieProduitService.getAllCategorieProduit();
    }

    @PostMapping("/create")
    public CategorieProduit createCategorieProduit(@RequestBody CategorieProduit categorieProduit) {
        return categorieProduitService.createCategorieProduit(categorieProduit);
    }

}
