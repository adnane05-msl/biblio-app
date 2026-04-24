package com.biblio.backend.service;

import com.biblio.backend.dto.ProjectDTO;
import com.biblio.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.biblio.backend.dto.ProjectCreateRequest;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.Utilisateur;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UtilisateurService utilisateurService;

    // Créer un projet
    public ProjectDTO createProject(Long userId, ProjectCreateRequest request) {
        Utilisateur user = utilisateurService.findById(userId);

        Project project = new Project();
        project.setNomProjet(request.getNomProjet());
        project.setDescription(request.getDescription());
        project.setUtilisateur(user);

        Project savedProject = projectRepository.save(project);

        return convertToDTO(savedProject);
    }

    // Récupérer tous les projets d'un utilisateur
    public List<ProjectDTO> getUserProjects(Long userId) {
        List<Project> projects = projectRepository.findByUtilisateurId(userId);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Récupérer un projet par ID
    public Project getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    // Modifier un projet
    public ProjectDTO updateProject(Long projectId, ProjectCreateRequest request) {
        Project project = getProjectById(projectId);
        project.setNomProjet(request.getNomProjet());
        project.setDescription(request.getDescription());

        Project updatedProject = projectRepository.save(project);
        return convertToDTO(updatedProject);
    }

    // Supprimer un projet
    public void deleteProject(Long projectId) {
        projectRepository.deleteById(projectId);
    }

    // Convertir Entity → DTO
    private ProjectDTO convertToDTO(Project project) {
        return new ProjectDTO(
                project.getId(),
                project.getNomProjet(),
                project.getDescription(),
                project.getDateCreation(),
                project.getDateModification()
        );
    }
}
