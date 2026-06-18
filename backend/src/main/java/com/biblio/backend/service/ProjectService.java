package com.biblio.backend.service;

import com.biblio.backend.dto.ProjectDTO;
import com.biblio.backend.dto.ProjectRequest;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.Utilisateur;
import com.biblio.backend.repository.ProjectRepository;
import com.biblio.backend.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UtilisateurRepository utilisateurRepository;

    public ProjectService(ProjectRepository projectRepository,
                          UtilisateurRepository utilisateurRepository) {
        this.projectRepository     = projectRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ── Créer un projet ────────────────────────────────────────────────────
    public ProjectDTO createProject(Long utilisateurId, ProjectRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Project project = new Project();
        project.setNomProjet(request.getNomProjet());
        project.setDescription(request.getDescription());
        project.setUtilisateur(utilisateur);

        Project saved = projectRepository.save(project);
        return convertToDTO(saved);
    }

    // ── Récupérer tous les projets d'un utilisateur ────────────────────────
    public List<ProjectDTO> getProjectsByUtilisateur(Long utilisateurId) {
        List<Project> projets = projectRepository.findByUtilisateurId(utilisateurId);
        return projets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ── Récupérer un projet par ID ─────────────────────────────────────────
    public ProjectDTO getProjectById(Long projetId) {
        Project projet = projectRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return convertToDTO(projet);
    }

    // ── Modifier un projet ─────────────────────────────────────────────────
    public ProjectDTO updateProject(Long projetId, ProjectRequest request) {
        Project projet = projectRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        projet.setNomProjet(request.getNomProjet());
        projet.setDescription(request.getDescription());
        projet.setDateModification(LocalDateTime.now());

        Project updated = projectRepository.save(projet);
        return convertToDTO(updated);
    }

    // ── Supprimer un projet ────────────────────────────────────────────────
    @Transactional
    public void deleteProject(Long projetId) {
        Project projet = projectRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        projectRepository.delete(projet);
    }

    // ── Conversion Entity → DTO ────────────────────────────────────────────
    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setNomProjet(project.getNomProjet());
        dto.setDescription(project.getDescription());
        dto.setDateCreation(project.getDateCreation());
        dto.setDateModification(project.getDateModification());
        dto.setNombreArticles(project.getProjectArticles() != null
                ? project.getProjectArticles().size() : 0);
        return dto;
    }
}