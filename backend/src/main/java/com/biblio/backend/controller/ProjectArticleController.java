package com.biblio.backend.controller;

import com.biblio.backend.dto.BatchSaveRequest;
import com.biblio.backend.dto.BatchSaveResult;
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

    public ProjectArticleController(ProjectArticleService projectArticleService) {
        this.projectArticleService = projectArticleService;
    }

    // Save unitaire (gardé pour compatibilité)
    @PostMapping("/save")
    public ResponseEntity<ProjectArticleDTO> saveArticle(@RequestBody SaveArticleRequest request) {
        try {
            ProjectArticleDTO dto = projectArticleService.saveArticle(request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("Erreur saveArticle: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // NOUVEAU : Save en lot — utiliser cet endpoint depuis le frontend
    // pour sauvegarder tous les articles sélectionnés en une seule requête.
    @PostMapping("/save-batch")
    public ResponseEntity<BatchSaveResult> saveArticlesBatch(@RequestBody BatchSaveRequest request) {
        try {
            BatchSaveResult result = projectArticleService.saveArticlesBatch(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Erreur saveArticlesBatch: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectArticleDTO>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectArticleService.getArticlesByProject(projectId));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<ProjectArticleDTO> updateStatut(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectArticleService.updateStatut(id, body.get("statut")));
    }

    @PutMapping("/{id}/note")
    public ResponseEntity<ProjectArticleDTO> updateNote(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectArticleService.updateNote(id, body.get("note")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeArticle(@PathVariable Long id) {
        projectArticleService.removeArticle(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/project/{projectId}/deduplicate")
    public ResponseEntity<Map<String, Object>> deduplicate(@PathVariable Long projectId) {
        try {
            return ResponseEntity.ok(projectArticleService.deduplicateProject(projectId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}