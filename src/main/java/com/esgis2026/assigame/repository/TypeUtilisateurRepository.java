package com.esgis2026.assigame.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.TypeUtilisateur;

@Repository
public interface TypeUtilisateurRepository extends JpaRepository<TypeUtilisateur, Long> {

    @Query("SELECT t FROM TypeUtilisateur t WHERE t.nom_typeutilisateur = :nom")
    Optional<TypeUtilisateur> findByNomType(@Param("nom") String nom);

    @Query("SELECT t FROM TypeUtilisateur t WHERE t.nom_typeutilisateur <> 'ADMIN' ORDER BY t.id_typeutilisateur")
    List<TypeUtilisateur> findAllTypesVendeur();
}
