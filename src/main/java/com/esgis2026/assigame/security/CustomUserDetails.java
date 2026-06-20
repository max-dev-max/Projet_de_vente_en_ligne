package com.esgis2026.assigame.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.esgis2026.assigame.entity.Utilisateur;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final Utilisateur utilisateur;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = utilisateur.getId_typeutilisateur().getNom_typeutilisateur();
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return utilisateur.getMot_de_passe_utilisateur();
    }

    @Override
    public String getUsername() {
        return utilisateur.getEmail_utilisateur();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !"SUSPENDU".equalsIgnoreCase(utilisateur.getStatut_compte());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "ACTIF".equalsIgnoreCase(utilisateur.getStatut_compte());
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }
}
