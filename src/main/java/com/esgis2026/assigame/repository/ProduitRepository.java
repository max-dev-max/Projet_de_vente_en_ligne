package com.esgis2026.assigame.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.esgis2026.assigame.entity.Produit;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

}
