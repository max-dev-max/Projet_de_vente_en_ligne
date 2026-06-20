package com.esgis2026.assigame.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "typeutilisateur")
@Getter
@Setter
public class TypeUtilisateur {
    @Override
    public String toString() {
        return "typeutilisateur [id_typeutilisateur=" + id_typeutilisateur + ", nom_typeutilisateur="
                + nom_typeutilisateur + ", libelle_typeutilisateur=" + libelle_typeutilisateur
                + ", description_typeutilisateur=" + description_typeutilisateur + "]";
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id_typeutilisateur == null) ? 0 : id_typeutilisateur.hashCode());
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
        TypeUtilisateur other = (TypeUtilisateur) obj;
        if (id_typeutilisateur == null) {
            if (other.id_typeutilisateur != null)
                return false;
        } else if (!id_typeutilisateur.equals(other.id_typeutilisateur))
            return false;
        return true;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_typeutilisateur;

    @Column(unique = true, nullable = false, length = 50)
    private String nom_typeutilisateur;

    private String libelle_typeutilisateur;

    @Column(nullable = false, length = 255)
    private String description_typeutilisateur;

}
