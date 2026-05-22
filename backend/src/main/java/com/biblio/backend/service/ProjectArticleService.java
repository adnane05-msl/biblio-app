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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public ProjectArticleDTO saveArticle(SaveArticleRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        Article article = findOrCreateArticle(request);

        // Si déjà dans ce projet → retourner le DTO existant sans erreur
        Optional<ProjectArticle> existing =
                projectArticleRepository.findByProjectAndArticle(project, article);
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        ProjectArticle projectArticle = new ProjectArticle();
        projectArticle.setProject(project);
        projectArticle.setArticle(article);
        projectArticle.setStatut(ProjectArticle.Statut.A_LIRE);

        return convertToDTO(projectArticleRepository.save(projectArticle));
    }

    /**
     * Cherche un article existant par DOI ou titre, ou en crée un nouveau.
     * Gère les cas où DOI/titre sont null, vides, ou déjà en base.
     */
    private Article findOrCreateArticle(SaveArticleRequest request) {
        String doi = request.getDoi();
        String titre = request.getTitre();

        // 1. Chercher par DOI si valide
        if (doi != null && !doi.trim().isEmpty()) {
            Optional<Article> byDoi = articleRepository.findByDoi(doi.trim());
            if (byDoi.isPresent()) {
                return byDoi.get();
            }
        }

        // 2. Chercher par titre si DOI absent ou non trouvé
        if (titre != null && !titre.trim().isEmpty()) {
            Optional<Article> byTitre = articleRepository.findByTitre(titre.trim());
            if (byTitre.isPresent()) {
                Article existing = byTitre.get();
                // Enrichir le DOI si manquant
                if ((existing.getDoi() == null || existing.getDoi().isEmpty())
                        && doi != null && !doi.trim().isEmpty()) {
                    existing.setDoi(doi.trim());
                    return articleRepository.save(existing);
                }
                return existing;
            }
        }

        // 3. Créer un nouvel article
        Article article = new Article();
        article.setTitre(titre != null && !titre.trim().isEmpty() ? titre.trim() : "Titre non disponible");
        article.setAuteurs(request.getAuteurs());
        article.setAnnee(request.getAnnee());
        article.setDoi(doi != null && !doi.trim().isEmpty() ? doi.trim() : null);
        article.setResume(request.getResume());
        article.setUrl(request.getUrl());
        article.setNbCitations(request.getNbCitations());
        return articleRepository.save(article);
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

    public Map<String, Object> deduplicateProject(Long projectId) {
        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);
        Map<String, List<ProjectArticle>> grouped = new LinkedHashMap<>();

        for (ProjectArticle pa : list) {
            String key = pa.getArticle().getDoi() != null && !pa.getArticle().getDoi().isEmpty()
                    ? pa.getArticle().getDoi().toLowerCase().trim()
                    : pa.getArticle().getTitre() != null
                    ? pa.getArticle().getTitre().toLowerCase().trim()
                    : String.valueOf(pa.getId());
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(pa);
        }

        int marked = 0;
        for (List<ProjectArticle> duplicates : grouped.values()) {
            if (duplicates.size() > 1) {
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