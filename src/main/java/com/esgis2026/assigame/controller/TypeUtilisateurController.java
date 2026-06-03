package com.esgis2026.assigame.controller;

import org.springframework.web.bind.annotation.RestController;

import com.esgis2026.assigame.entity.TypeUtilisateur;
import com.esgis2026.assigame.service.TypeUtilisateurService;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/typeutilisateur")
public class TypeUtilisateurController {

    private final TypeUtilisateurService typeUtilisateurService;

    public TypeUtilisateurController(TypeUtilisateurService typeUtilisateurService) {
        this.typeUtilisateurService = typeUtilisateurService;
    }

    /**
     * Renvoie la liste de tous les types d'utilisateurs.
     * @return Liste de types.
     */
    @GetMapping("/list")
    public List<TypeUtilisateur> getAllTypeUtilisateur() {
        return typeUtilisateurService.getAllTypeUtilisateurs();
    }

    /**
     * Permet de créer un nouveau type d'utilisateur (ex: ADMIN, CLIENT).
     * @param typeUtilisateur Les informations du nouveau type.
     * @return Le type créé.
     */
    @PostMapping("/create")
    public TypeUtilisateur createTypeUtilisateur(@RequestBody TypeUtilisateur typeUtilisateur) {
        return typeUtilisateurService.createTypeUtilisateur(typeUtilisateur);
    }

    /**
     * Modifie un type d'utilisateur existant.
     * @param id L'identifiant du type à modifier.
     * @param typeUtilisateur Les nouvelles informations.
     * @return Le type modifié.
     */
    @PutMapping("/update/{id}")
    public TypeUtilisateur updateTypeUtilisateur(@PathVariable Long id, @RequestBody TypeUtilisateur typeUtilisateur) {
        return typeUtilisateurService.updateTypeUtilisateur(id, typeUtilisateur);
    }

    /**
     * Supprime un type d'utilisateur.
     * @param id L'identifiant du type à supprimer.
     */
    @DeleteMapping("/delete/{id}")
    public void deleteTypeUtilisateur(@PathVariable Long id) {
        typeUtilisateurService.deleteTypeUtilisateur(id);
    }
}
