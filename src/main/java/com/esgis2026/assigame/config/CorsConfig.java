package com.esgis2026.assigame.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration CORS : autorise le front (React, Vite, etc.) à appeler l'API depuis un autre port.
 */
@Configuration
public class CorsConfig {

    /**
     * Définit les règles CORS appliquées à toutes les routes de l'API.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // Origines autorisées (front en développement local)
                        .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        // Permet l'envoi de cookies / headers d'authentification
                        .allowCredentials(true);
            }
        };
    }
}
