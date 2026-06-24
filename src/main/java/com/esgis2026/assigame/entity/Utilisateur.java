package com.esgis2026.assigame.entity;


import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
 * Utilisateur de la plateforme (admin ou vendeur).
 * Table : utilisateur
 */
@Entity
@Table(name = "utilisateur")
@Getter
@Setter
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_utilisateur;

    @Column(nullable = false, length = 50)
    private String nom_utilisateur;

    @Column(nullable = false, length = 50)
    private String prenom_utilisateur;

    /** Identifiant de connexion */
    @Column(unique = true, nullable = false, length = 50)
    private String email_utilisateur;

    @Column(nullable = false, length = 50)
    private String sexe_utilisateur;

    /** Mot de passe hashé (BCrypt) — jamais exposé au front */
    @JsonIgnore
    @Column(nullable = false)
    private String mot_de_passe_utilisateur;

    /** ACTIF | EN_ATTENTE | REFUSE | SUSPENDU */
    @Column(nullable = false)
    private String statut_compte;

    /** Date de création du compte */
    @Column(nullable = true, updatable = false)
    private LocalDateTime date_creation;

    @PrePersist
    public void definirDateCreation() {
        if (this.date_creation == null) {
            this.date_creation = LocalDateTime.now();
        }
    }

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

    @Column(nullable = false, length = 50)
    private String telephone_utilisateur;

    /** Rôle : ADMIN, Particulier, Professionnel ou Partenaire Vip */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_typeutilisateur", nullable = false)
    private TypeUtilisateur id_typeutilisateur;

}
