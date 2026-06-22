package com.esgis2026.assigame.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stockage des fichiers images sur le disque (dossier externe).
 * Les fichiers sont écrits dans {@code app.upload.dir} et exposés publiquement
 * via l'URL {@code /uploads/produits/<nom>}.
 */
@Service
public class FileStorageService {

    private static final Set<String> TYPES_AUTORISES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/gif", "image/svg+xml", "image/webp");

    private static final long TAILLE_MAX = 5L * 1024 * 1024; // 5 Mo

    /** Préfixe URL public sous lequel les fichiers sont servis (voir WebConfig). */
    private static final String URL_PREFIX = "/uploads/produits/";

    private final Path dossierStockage;

    public FileStorageService(@Value("${app.upload.dir:uploads/produits}") String uploadDir) {
        this.dossierStockage = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.dossierStockage);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier de stockage des images : " + uploadDir, e);
        }
    }

    /**
     * Enregistre une liste de fichiers et retourne leurs chemins publics.
     */
    public List<String> stockerPlusieurs(MultipartFile[] fichiers) {
        if (fichiers == null || fichiers.length == 0) {
            throw new RuntimeException("Aucun fichier reçu.");
        }
        return java.util.Arrays.stream(fichiers)
                .map(this::stocker)
                .collect(Collectors.toList());
    }

    /**
     * Enregistre un fichier unique (valide type + taille) et retourne son chemin public.
     */
    public String stocker(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new RuntimeException("Fichier vide.");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new RuntimeException("Le fichier dépasse la taille maximale de 5 Mo.");
        }
        String contentType = fichier.getContentType();
        if (contentType == null || !TYPES_AUTORISES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Format d'image non supporté : " + contentType);
        }

        String original = StringUtils.cleanPath(fichier.getOriginalFilename() == null ? "" : fichier.getOriginalFilename());
        String extension = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            extension = original.substring(dot).toLowerCase();
        }
        String nomFichier = UUID.randomUUID().toString().replace("-", "") + extension;

        try {
            Path cible = this.dossierStockage.resolve(nomFichier).normalize();
            // Sécurité : empêche toute écriture hors du dossier de stockage
            if (!cible.getParent().equals(this.dossierStockage)) {
                throw new RuntimeException("Chemin de fichier invalide.");
            }
            Files.copy(fichier.getInputStream(), cible, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Échec de l'enregistrement du fichier : " + nomFichier, e);
        }

        return URL_PREFIX + nomFichier;
    }
}
