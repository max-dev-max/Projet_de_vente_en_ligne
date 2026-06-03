package com.esgis2026.assigame.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entité représentant un utilisateur inscrit dans le système.
 * Mappe la table "utilisateur" dans la base de données.
 */
@Entity
@Table(name = "utilisateur")
@Getter
@Setter
public class Utilisateur {
    // Clé primaire générée automatiquement
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_utilisateur;

    @Column(unique = true, nullable = false, length = 50)
    private String nom_utilisateur;

    @Column(unique = true, nullable = false, length = 50)
    private String prenom_utilisateur;

    @Column(unique = true, nullable = false, length = 50)
    private String email_utilisateur;

    @Column(nullable = false, length = 255)
    private String mot_de_passe_utilisateur;

    @Column(unique = true, nullable = false, length = 50)
    private String sexe_utilisateur;

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id_utilisateur == null) ? 0 : id_utilisateur.hashCode());
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
        Utilisateur other = (Utilisateur) obj;
        if (id_utilisateur == null) {
            if (other.id_utilisateur != null)
                return false;
        } else if (!id_utilisateur.equals(other.id_utilisateur))
            return false;
        return true;
    }

    @Override
    public String toString() {
        return "utilisateur [id_utilisateur=" + id_utilisateur + ", nom_utilisateur=" + nom_utilisateur
                + ", prenom_utilisateur=" + prenom_utilisateur + ", email_utilisateur=" + email_utilisateur
                + ", sexe_utilisateur=" + sexe_utilisateur + ", telephone_utilisateur=" + telephone_utilisateur
                + ", id_typeutilisateur=" + id_typeutilisateur + "]";
    }

    @Column(unique = true, nullable = false, length = 50)
    private String telephone_utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_typeutilisateur", nullable = false)
    private TypeUtilisateur id_typeutilisateur;

}
