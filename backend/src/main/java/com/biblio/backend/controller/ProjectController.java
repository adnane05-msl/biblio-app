package com.biblio.backend.controller;

import com.biblio.backend.dto.ProjectRequest;
import com.biblio.backend.dto.ProjectDTO;
import com.biblio.backend.model.Project;
import com.biblio.backend.repository.ProjectRepository;
import com.biblio.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
public class ProjectController {
    @Autowired
    private final ProjectService projectService;
    @Autowired
    private final ProjectRepository projectRepository;

    public ProjectController(ProjectService projectService, ProjectRepository projectRepository) {
        this.projectService = projectService;
        this.projectRepository = projectRepository;
    };


    @GetMapping("/test-service")
    public String testService() {
        try {
            List<Project> projets = projectRepository.findAll();
            return "Nombre de projets: " + projets.size();
        } catch (Exception e) {
            return "Erreur: " + e.getMessage();
        }
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    // Récupérer tous les projets d'un utilisateur
    @GetMapping("/utilisateur/{userId}")
    public ResponseEntity<List<ProjectDTO>> getUserProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getProjectsByUtilisateur(userId));
    }

    // Créer un projet
    @PostMapping("/utilisateur/{userId}")
    public ResponseEntity<ProjectDTO> createProject(
            @PathVariable Long userId,
            @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(userId, request));
    }

    // Modifier un projet
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long projectId,
            @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request));
    }

    // Supprimer un projet
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }

}
