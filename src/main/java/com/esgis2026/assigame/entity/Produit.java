package com.esgis2026.assigame.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Produit mis en vente par un vendeur, rattaché à une catégorie.
 * Table : produit
 */
@Entity
@Table(name = "produit")
@Getter
@Setter
public class Produit {
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id_produit == null) ? 0 : id_produit.hashCode());
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
        Produit other = (Produit) obj;
        if (id_produit == null) {
            if (other.id_produit != null)
                return false;
        } else if (!id_produit.equals(other.id_produit))
            return false;
        return true;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_produit;

    @Column(unique = false, nullable = false, length = 50)
    private String nom_produit;

    @Override
    public String toString() {
        return "produit [id_produit=" + id_produit + ", nom_produit=" + nom_produit + ", description=" + description
                + ", prix=" + prix + ", image=" + image + ", date_ajout=" + date_ajout + ", statut=" + statut
                + ", idcategorie_produit=" + idcategorie_produit + ", id_utilisateur=" + id_utilisateur + "]";
    }

    @Column(unique = false, nullable = true, length = 100)
    private String description;

    @Column(unique = false, nullable = true, length = 10)
    private double prix;

    /** URL ou chemin de l'image du produit */
    @Column()
    private String image;

    /** Rempli automatiquement à la création via @PrePersist */
    @Column(unique = false, nullable = false, updatable = false)
    private LocalDateTime date_ajout;

    /** Définit la date d'ajout juste avant l'enregistrement en base */
    @PrePersist
    public void definirDateAjout() {
        this.date_ajout = LocalDateTime.now();
    }

    @Column(unique = false, nullable = false, length = 10)
    private String statut;

    /** Catégorie à laquelle appartient le produit */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idcategorie_produit", nullable = false)
    private CategorieProduit idcategorie_produit;

    /** Vendeur propriétaire du produit */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur id_utilisateur;
}
