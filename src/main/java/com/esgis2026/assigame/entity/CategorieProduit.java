package com.esgis2026.assigame.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entité représentant une catégorie de produits dans l'application.
 * Mappe la table "categorieproduit" dans la base de données.
 */
@Entity
@Getter
@Setter
@Table(name = "categorieproduit")
public class CategorieProduit {

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((idcategorie_produit == null) ? 0 : idcategorie_produit.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        CategorieProduit other = (CategorieProduit) obj;
        if (idcategorie_produit == null) {
            if (other.idcategorie_produit != null)
                return false;
        } else if (!idcategorie_produit.equals(other.idcategorie_produit))
            return false;
        return true;
    }

    // Clé primaire générée automatiquement
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idcategorie_produit;

    @Column(unique = true, nullable = false, length = 70)
    private String nom_categorieproduit;

    @Column(unique = true, nullable = true, length = 100)
    private String description;

    @Override
    public String toString() {
        return "categorieproduit [idcategorie_produit=" + idcategorie_produit + ", nom_categorieproduit="
                + nom_categorieproduit + ", description=" + description + "]";
    }

}
