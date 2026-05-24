package com.biblio.backend.controller;

import com.biblio.backend.dto.ChangePasswordRequest;
import com.biblio.backend.dto.UpdateProfilRequest;
import com.biblio.backend.dto.UtilisateurDTO;
import com.biblio.backend.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(
            UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // Récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDTO> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                utilisateurService.findById(id));
    }

    // Mettre à jour le Profil
    @PutMapping("/{id}/profil")
    public ResponseEntity<UtilisateurDTO> updateProfil(
            @PathVariable Long id,
            @RequestBody UpdateProfilRequest request) {
        return ResponseEntity.ok(
                utilisateurService.updateProfil(id, request));
    }

    // Changer le Mot de Passe
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {
        try {
            utilisateurService.changePassword(id, request);
            return ResponseEntity.ok(
                    Map.of("message",
                            "Mot de passe modifié avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}