package com.esgis2026.assigame.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Étend les colonnes description et image de la table produit en TEXT.
 * Hibernate ddl-auto=update ne modifie pas toujours un VARCHAR existant.
 */
@Component
@Order(0)
public class ProduitSchemaMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProduitSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public ProduitSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE produit ALTER COLUMN description TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE produit ALTER COLUMN image TYPE TEXT");
            log.info("Colonnes produit.description et produit.image migrées vers TEXT");
        } catch (Exception e) {
            log.warn("Migration colonnes produit ignorée : {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE produit DROP CONSTRAINT IF EXISTS produit_nom_produit_key");
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS uk_produit_nom_vendeur ON produit (nom_produit, id_utilisateur)");
            log.info("Contrainte d'unicité produit : nom unique par vendeur");
        } catch (Exception e) {
            log.warn("Migration contrainte nom produit ignorée : {}", e.getMessage());
        }
    }
}
