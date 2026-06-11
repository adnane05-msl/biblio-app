package com.biblio.backend.controller;

import com.biblio.backend.dto.InvitationRequest;
import com.biblio.backend.dto.MembreDTO;
import com.biblio.backend.service.CollaborationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints REST pour la collaboration multi-utilisateur.
 *
 * Routes :
 *   GET    /api/collaboration/{projetId}/membres          → liste des membres
 *   POST   /api/collaboration/{projetId}/inviter          → inviter par email
 *   PUT    /api/collaboration/membres/{membreId}/role     → modifier le rôle
 *   DELETE /api/collaboration/membres/{membreId}          → retirer un membre
 *   GET    /api/collaboration/{projetId}/mon-role/{userId}→ rôle d'un user dans ce projet
 *   GET    /api/collaboration/partages/{userId}           → IDs des projets partagés
 */
@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {

    private final CollaborationService collaborationService;

    public CollaborationController(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    // ── GET liste des membres d'un projet ──────────────────────────────────────
    @GetMapping("/{projetId}/membres")
    public ResponseEntity<List<MembreDTO>> getMembres(@PathVariable Long projetId) {
        return ResponseEntity.ok(collaborationService.getMembres(projetId));
    }

    // ── POST inviter un utilisateur ────────────────────────────────────────────
    @PostMapping("/{projetId}/inviter")
    public ResponseEntity<?> inviterMembre(
            @PathVariable Long projetId,
            @Valid @RequestBody InvitationRequest request) {
        try {
            request.setProjetId(projetId);
            MembreDTO membre = collaborationService.inviterMembre(projetId, request);
            return ResponseEntity.ok(membre);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── PUT modifier le rôle d'un membre ──────────────────────────────────────
    @PutMapping("/membres/{membreId}/role")
    public ResponseEntity<?> modifierRole(
            @PathVariable Long membreId,
            @RequestBody Map<String, String> body) {
        try {
            String role = body.get("role");
            if (role == null || role.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Le champ 'role' est requis."));
            }
            MembreDTO updated = collaborationService.modifierRole(membreId, role);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── DELETE retirer un membre ───────────────────────────────────────────────
    @DeleteMapping("/membres/{membreId}")
    public ResponseEntity<?> retirerMembre(@PathVariable Long membreId) {
        try {
            collaborationService.retirerMembre(membreId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── GET rôle d'un utilisateur dans un projet ───────────────────────────────
    @GetMapping("/{projetId}/mon-role/{userId}")
    public ResponseEntity<Map<String, String>> getMonRole(
            @PathVariable Long projetId,
            @PathVariable Long userId) {
        String role = collaborationService.getRoleUtilisateur(projetId, userId);
        if (role == null) {
            return ResponseEntity.ok(Map.of("role", "AUCUN"));
        }
        return ResponseEntity.ok(Map.of("role", role));
    }

    // ── GET liste des IDs projets partagés avec un utilisateur ─────────────────
    @GetMapping("/partages/{userId}")
    public ResponseEntity<List<Long>> getProjetsPartages(@PathVariable Long userId) {
        return ResponseEntity.ok(collaborationService.getProjetsPartages(userId));
    }
}