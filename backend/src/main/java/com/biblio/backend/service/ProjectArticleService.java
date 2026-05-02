package com.biblio.backend.service;

import com.biblio.backend.dto.ProjectArticleDTO;
import com.biblio.backend.dto.SaveArticleRequest;
import com.biblio.backend.model.Article;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ArticleRepository;
import com.biblio.backend.repository.ProjectArticleRepository;
import com.biblio.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectArticleService {

    private final ProjectArticleRepository projectArticleRepository;
    private final ProjectRepository projectRepository;
    private final ArticleRepository articleRepository;

    public ProjectArticleService(
            ProjectArticleRepository projectArticleRepository,
            ProjectRepository projectRepository,
            ArticleRepository articleRepository) {
        this.projectArticleRepository = projectArticleRepository;
        this.projectRepository = projectRepository;
        this.articleRepository = articleRepository;
    }

    // Sauvegarder un article dans un projet
    public ProjectArticleDTO saveArticle(SaveArticleRequest request) {

        // Trouver le projet
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Chercher si l'article existe déjà en base (par DOI ou titre)
        Article article = null;
        if (request.getDoi() != null && !request.getDoi().isEmpty()) {
            article = articleRepository.findByDoi(request.getDoi())
                    .orElse(null);
        }
        if (article == null && request.getTitre() != null) {
            article = articleRepository.findByTitre(request.getTitre())
                    .orElse(null);
        }

        // Créer l'article s'il n'existe pas
        if (article == null) {
            article = new Article();
            article.setTitre(request.getTitre());
            article.setAuteurs(request.getAuteurs());
            article.setAnnee(request.getAnnee());
            article.setDoi(request.getDoi());
            article.setResume(request.getResume());
            article.setUrl(request.getUrl());
            article.setNbCitations(request.getNbCitations());
            article = articleRepository.save(article);
        }

        // Vérifier si l'article est déjà dans ce projet
        Optional<ProjectArticle> existing =
                projectArticleRepository.findByProjectAndArticle(
                        project, article);

        if (existing.isPresent()) {
            throw new RuntimeException(
                    "Article déjà sauvegardé dans ce projet");
        }

        // Créer le lien article ↔ projet
        ProjectArticle projectArticle = new ProjectArticle();
        projectArticle.setProject(project);
        projectArticle.setArticle(article);
        projectArticle.setStatut(ProjectArticle.Statut.A_LIRE);

        ProjectArticle saved =
                projectArticleRepository.save(projectArticle);

        return convertToDTO(saved);
    }

    // Récupérer tous les articles d'un projet
    public List<ProjectArticleDTO> getArticlesByProject(Long projectId) {
        return projectArticleRepository.findByProjectId(projectId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Changer le statut d'un article
    public ProjectArticleDTO updateStatut(Long projectArticleId,
                                          String statut) {
        ProjectArticle pa = projectArticleRepository
                .findById(projectArticleId)
                .orElseThrow(() -> new RuntimeException(
                        "Lien article-projet non trouvé"));

        pa.setStatut(ProjectArticle.Statut.valueOf(statut));
        ProjectArticle updated = projectArticleRepository.save(pa);
        return convertToDTO(updated);
    }

    // Ajouter/modifier une note
    public ProjectArticleDTO updateNote(Long projectArticleId,
                                        String note) {
        ProjectArticle pa = projectArticleRepository
                .findById(projectArticleId)
                .orElseThrow(() -> new RuntimeException(
                        "Lien article-projet non trouvé"));

        pa.setNote(note);
        ProjectArticle updated = projectArticleRepository.save(pa);
        return convertToDTO(updated);
    }

    // Supprimer un article d'un projet
    public void removeArticle(Long projectArticleId) {
        projectArticleRepository.deleteById(projectArticleId);
    }

    // Conversion Entity → DTO
    private ProjectArticleDTO convertToDTO(ProjectArticle pa) {
        ProjectArticleDTO dto = new ProjectArticleDTO();
        dto.setId(pa.getId());
        dto.setArticleId(pa.getArticle().getId());
        dto.setTitre(pa.getArticle().getTitre());
        dto.setAuteurs(pa.getArticle().getAuteurs());
        dto.setAnnee(pa.getArticle().getAnnee());
        dto.setDoi(pa.getArticle().getDoi());
        dto.setResume(pa.getArticle().getResume());
        dto.setUrl(pa.getArticle().getUrl());
        dto.setNbCitations(pa.getArticle().getNbCitations());
        dto.setStatut(pa.getStatut().name());
        dto.setNote(pa.getNote());
        dto.setDateAjout(pa.getDateAjout());
        return dto;
    }
}
