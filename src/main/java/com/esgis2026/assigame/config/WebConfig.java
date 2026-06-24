package com.esgis2026.assigame.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Expose les fichiers uploadés (images produits) stockés dans le dossier externe
 * {@code app.upload.dir} via l'URL publique {@code /uploads/produits/**}.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String uploadDir;

    public WebConfig(@Value("${app.upload.dir:uploads/produits}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/catalogue.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String emplacement = Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/produits/**")
                .addResourceLocations(emplacement);
    }
}
