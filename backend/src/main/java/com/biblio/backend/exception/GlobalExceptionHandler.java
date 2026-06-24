package com.biblio.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        String message = (e.getMessage() != null && !e.getMessage().isBlank())
                ? e.getMessage()
                : "Une erreur est survenue";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message",
                        "Données invalides : champ obligatoire manquant, doublon ou valeur trop longue"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Données invalides");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
    }
}