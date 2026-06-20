package com.esgis2026.assigame.service;

import org.springframework.stereotype.Service;

import com.esgis2026.assigame.entity.TypeUtilisateur;
import com.esgis2026.assigame.repository.TypeUtilisateurRepository;

import java.util.List;
import java.util.Optional;

/**
 * Logique métier CRUD des types d'utilisateur (admin et types vendeur).
 */
@Service
public class TypeUtilisateurService {

    private final TypeUtilisateurRepository typeUtilisateurRepository;

    public TypeUtilisateurService(TypeUtilisateurRepository typeUtilisateurRepository) {
        this.typeUtilisateurRepository = typeUtilisateurRepository;
    }

    /**
     * Récupère la liste complète des types d'utilisateurs.
     * @return Une liste des types.
     */
    public List<TypeUtilisateur> getAllTypeUtilisateurs() {
        return typeUtilisateurRepository.findAll();
    }

    /**
     * Trouve un type d'utilisateur par son identifiant.
     * @param id L'identifiant du type d'utilisateur.
     * @return Le type d'utilisateur enveloppé dans un Optional.
     */
    public Optional<TypeUtilisateur> getTypeUtilisateurById(Long id) {
        return typeUtilisateurRepository.findById(id);
    }

    /**
     * Sauvegarde un nouveau type d'utilisateur en base de données.
     * @param typeUtilisateur Le type d'utilisateur à créer.
     * @return Le type d'utilisateur enregistré.
     */
    public TypeUtilisateur createTypeUtilisateur(TypeUtilisateur typeUtilisateur) {
        return typeUtilisateurRepository.save(typeUtilisateur);
    }

    /**
     * Met à jour les informations d'un type d'utilisateur spécifique.
     * @param id L'identifiant du type à mettre à jour.
     * @param typeUtilisateurDetails Les nouvelles informations à appliquer.
     * @return Le type d'utilisateur après mise à jour.
     */
    public TypeUtilisateur updateTypeUtilisateur(Long id, TypeUtilisateur typeUtilisateurDetails) {
        return typeUtilisateurRepository.findById(id)
                .map(typeUtilisateur -> {
                    typeUtilisateur.setLibelle_typeutilisateur(typeUtilisateurDetails.getLibelle_typeutilisateur());
                    return typeUtilisateurRepository.save(typeUtilisateur);
                })
                .orElseThrow(() -> new RuntimeException("Type d'utilisateur non trouvé avec l'ID " + id));
    }

    /**
     * Supprime un type d'utilisateur à partir de son ID.
     * @param id L'ID du type à supprimer.
     */
    public void deleteTypeUtilisateur(Long id) {
        typeUtilisateurRepository.deleteById(id);
    }
}
