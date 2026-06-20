package com.esgis2026.assigame.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.esgis2026.assigame.entity.Utilisateur;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Service de gestion des tokens JWT : création, lecture et validation.
 */
@Component
public class JwtService {

    // Clé secrète utilisée pour signer et vérifier les tokens (définie dans application.properties)
    @Value("${jwt.secret}")
    private String secret;

    // Durée de validité du token en millisecondes
    @Value("${jwt.expiration}")
    private long expirationInMs;

    /**
     * Génère un token JWT contenant l'id, l'email et le rôle de l'utilisateur.
     */
    public String generateToken(Utilisateur user) {
        return Jwts.builder()
                .subject(String.valueOf(user.getId_utilisateur()))
                .claim("email", user.getEmail_utilisateur())
                .claim("role", user.getId_typeutilisateur().getNom_typeutilisateur())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationInMs))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    /**
     * Extrait l'email stocké dans le token (utilisé comme identifiant de connexion).
     */
    public String extractUsername(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    /**
     * Extrait le rôle (VENDEUR, ADMIN, etc.) stocké dans le token.
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Lit une information précise du token via une fonction (email, rôle, expiration...).
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Vérifie que le token correspond à l'utilisateur connecté et qu'il n'est pas expiré.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Décode et vérifie la signature du token avec la clé secrète.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Retourne true si la date d'expiration du token est dépassée.
     */
    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }
}
