package com.esgis2026.assigame.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Intercepte les erreurs de type "Unique Constraint" (quand une donnée existe déjà).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("erreur", "Conflit de données : Une information identique (comme ce nom ou cet email) existe déjà dans la base de données.");
        
        // Optionnel : On peut envoyer le détail technique exact pour le développeur
        // errorResponse.put("details", ex.getMostSpecificCause().getMessage());
        
        // Renvoie un code HTTP 409 (Conflict) plutôt qu'un 500 (Internal Server Error)
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
    
    /**
     * Intercepte nos erreurs personnalisées (ex: IllegalArgumentException)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("erreur", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
