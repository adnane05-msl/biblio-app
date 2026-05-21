package com.biblio.backend.controller;

import com.biblio.backend.dto.ProjectArticleDTO;
import com.biblio.backend.dto.SaveArticleRequest;
import com.biblio.backend.service.ProjectArticleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projet-articles")
public class ProjectArticleController {

    private final ProjectArticleService projectArticleService;

    public ProjectArticleController(
            ProjectArticleService projectArticleService) {
        this.projectArticleService = projectArticleService;
    }

    // Sauvegarder un article dans un projet
    @PostMapping("/save")
    public ResponseEntity<?> saveArticle(
            @RequestBody SaveArticleRequest request) {
        try {
            ProjectArticleDTO dto =
                    projectArticleService.saveArticle(request);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Récupérer tous les articles d'un projet
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectArticleDTO>> getByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(
                projectArticleService.getArticlesByProject(projectId));
    }

    // Changer le statut
    @PutMapping("/{id}/statut")
    public ResponseEntity<ProjectArticleDTO> updateStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                projectArticleService.updateStatut(id, body.get("statut")));
    }

    // Modifier la note
    @PutMapping("/{id}/note")
    public ResponseEntity<ProjectArticleDTO> updateNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                projectArticleService.updateNote(id, body.get("note")));
    }

    // Supprimer un article d'un projet
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeArticle(@PathVariable Long id) {
        projectArticleService.removeArticle(id);
        return ResponseEntity.noContent().build();
    }

    // Déduplication dans un projet
    @PostMapping("/project/{projectId}/deduplicate")
    public ResponseEntity<Map<String, Object>> deduplicate(
            @PathVariable Long projectId) {
        try {
            Map<String, Object> result = projectArticleService
                    .deduplicateProject(projectId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}