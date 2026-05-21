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

import java.util.*;
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
        return projectArticleRepository.findByProject_Id(projectId)
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

    public Map<String, Object> deduplicateProject(Long projectId) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProject_Id(projectId);

        Map<String, List<ProjectArticle>> grouped =
                new LinkedHashMap<>();

        for (ProjectArticle pa : list) {
            String key = pa.getArticle().getDoi() != null
                    && !pa.getArticle().getDoi().isEmpty()
                    ? pa.getArticle().getDoi().toLowerCase().trim()
                    : pa.getArticle().getTitre() != null
                    ? pa.getArticle().getTitre().toLowerCase().trim()
                    : String.valueOf(pa.getId());

            grouped.computeIfAbsent(key,
                    k -> new ArrayList<>()).add(pa);
        }

        int marked = 0;
        for (List<ProjectArticle> duplicates : grouped.values()) {
            if (duplicates.size() > 1) {
                // Garder le premier — marquer les autres comme DOUBLON
                for (int i = 1; i < duplicates.size(); i++) {
                    ProjectArticle pa = duplicates.get(i);
                    if (pa.getStatut() != ProjectArticle.Statut.DOUBLON) {
                        pa.setStatut(ProjectArticle.Statut.DOUBLON);
                        projectArticleRepository.save(pa);
                        marked++;
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("marked", marked);
        result.put("message", marked == 0
                ? "Aucun doublon détecté dans ce projet."
                : marked + " doublon(s) détecté(s) et marqué(s).");
        return result;
    }
}