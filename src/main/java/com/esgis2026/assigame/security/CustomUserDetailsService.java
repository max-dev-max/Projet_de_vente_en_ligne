package com.esgis2026.assigame.security;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.esgis2026.assigame.entity.Utilisateur;
import com.esgis2026.assigame.repository.UtilisateurRepository;

import lombok.RequiredArgsConstructor;

/**
 * Charge un utilisateur depuis la base par son email pour Spring Security.
 * Appelé à la connexion (login) et lors de la validation du JWT.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    /**
     * @param username l'email de l'utilisateur (convention Spring Security)
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return utilisateurRepository.findByEmail_utilisateur(username)
                .map(this::toUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email : " + username));
    }

    private UserDetails toUserDetails(Utilisateur utilisateur) {
        String statut = utilisateur.getStatut_compte();
        if ("EN_ATTENTE".equals(statut)) {
            throw new DisabledException("Votre compte est en attente de validation par l'administrateur");
        }
        if ("REFUSE".equals(statut)) {
            throw new DisabledException("Votre demande a été refusée par l'administrateur");
        }
        return new CustomUserDetails(utilisateur);
    }
}
