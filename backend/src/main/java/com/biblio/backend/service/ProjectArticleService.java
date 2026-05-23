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

    public ProjectArticleDTO saveArticle(SaveArticleRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Chercher si l'article existe déjà en base (par DOI d'abord, puis titre)
        Article article = null;
        String doi = request.getDoi() != null ? request.getDoi().trim() : null;
        if (doi != null && !doi.isEmpty()) {
            article = articleRepository.findByDoi(doi).orElse(null);
        }
        String titre = request.getTitre() != null ? request.getTitre().trim() : null;
        if (article == null && titre != null && !titre.isEmpty()) {
            article = articleRepository.findByTitre(titre).orElse(null);
        }

        // Créer l'article s'il n'existe pas encore
        if (article == null) {
            article = new Article();
            // Titre de secours si null ou vide
            if (titre == null || titre.isEmpty()) {
                titre = doi != null && !doi.isEmpty()
                        ? "Article " + doi
                        : "Article sans titre";
            }
            article.setTitre(titre);
            article.setAuteurs(request.getAuteurs());
            article.setAnnee(request.getAnnee());
            article.setDoi(doi != null && !doi.isEmpty() ? doi : null);
            article.setResume(request.getResume());
            article.setUrl(request.getUrl());
            article.setNbCitations(request.getNbCitations());
            article = articleRepository.save(article);
        }

        // Toujours créer le lien article <-> projet (aucune vérification doublon)
        ProjectArticle projectArticle = new ProjectArticle();
        projectArticle.setProject(project);
        projectArticle.setArticle(article);
        projectArticle.setStatut(ProjectArticle.Statut.A_LIRE);

        ProjectArticle saved = projectArticleRepository.save(projectArticle);
        return convertToDTO(saved);
    }

    public List<ProjectArticleDTO> getArticlesByProject(Long projectId) {
        return projectArticleRepository.findByProject_Id(projectId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProjectArticleDTO updateStatut(Long projectArticleId, String statut) {
        ProjectArticle pa = projectArticleRepository
                .findById(projectArticleId)
                .orElseThrow(() -> new RuntimeException("Lien article-projet non trouvé"));
        pa.setStatut(ProjectArticle.Statut.valueOf(statut));
        return convertToDTO(projectArticleRepository.save(pa));
    }

    public ProjectArticleDTO updateNote(Long projectArticleId, String note) {
        ProjectArticle pa = projectArticleRepository
                .findById(projectArticleId)
                .orElseThrow(() -> new RuntimeException("Lien article-projet non trouvé"));
        pa.setNote(note);
        return convertToDTO(projectArticleRepository.save(pa));
    }

    public void removeArticle(Long projectArticleId) {
        projectArticleRepository.deleteById(projectArticleId);
    }

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