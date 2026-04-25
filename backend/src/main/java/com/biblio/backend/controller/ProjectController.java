package com.biblio.backend.controller;

import com.biblio.backend.dto.ProjectCreateRequest;
import com.biblio.backend.dto.ProjectDTO;
import com.biblio.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectService projectService;

    // Récupérer tous les projets d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDTO>> getUserProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getUserProjects(userId));
    }

    // Créer un projet
    @PostMapping("/user/{userId}")
    public ResponseEntity<ProjectDTO> createProject(
            @PathVariable Long userId,
            @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.ok(projectService.createProject(userId, request));
    }

    // Modifier un projet
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long projectId,
            @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    // Supprimer un projet
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

}
