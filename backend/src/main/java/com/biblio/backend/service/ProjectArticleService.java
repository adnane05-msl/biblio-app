package com.biblio.backend.service;

import com.biblio.backend.dto.BatchSaveRequest;
import com.biblio.backend.dto.BatchSaveResult;
import com.biblio.backend.dto.ProjectArticleDTO;
import com.biblio.backend.dto.SaveArticleRequest;
import com.biblio.backend.model.Article;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ArticleRepository;
import com.biblio.backend.repository.ProjectArticleRepository;
import com.biblio.backend.repository.ProjectRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // ================================================================
    // SAVE UNITAIRE
    // ================================================================

    @Transactional
    public ProjectArticleDTO saveArticle(SaveArticleRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        Article article = findOrCreateArticle(request);

        Optional<ProjectArticle> existing =
                projectArticleRepository.findByProjectAndArticle(project, article);
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        ProjectArticle pa = new ProjectArticle();
        pa.setProject(project);
        pa.setArticle(article);
        pa.setStatut(ProjectArticle.Statut.A_LIRE);
        pa.setDateAjout(LocalDateTime.now());

        try {
            return convertToDTO(projectArticleRepository.save(pa));
        } catch (DataIntegrityViolationException e) {
            return projectArticleRepository
                    .findByProjectAndArticle(project, article)
                    .map(this::convertToDTO)
                    .orElseThrow(() -> new RuntimeException("Erreur inattendue lors de la sauvegarde"));
        }
    }

    // ================================================================
    // SAVE EN LOT — CORRECTION PRINCIPALE DU BUG
    // Toute la liste est traitée dans UNE SEULE transaction, en séquentiel.
    // Cela élimine les race conditions entre requêtes parallèles du frontend.
    // ================================================================

    @Transactional
    public BatchSaveResult saveArticlesBatch(BatchSaveRequest request) {
        int saved = 0;
        int existing = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        for (SaveArticleRequest articleRequest : request.getArticles()) {
            articleRequest.setProjectId(request.getProjectId());
            try {
                Article article = findOrCreateArticle(articleRequest);

                Optional<ProjectArticle> existingLink =
                        projectArticleRepository.findByProjectAndArticle(project, article);

                if (existingLink.isPresent()) {
                    existing++;
                    continue;
                }

                ProjectArticle pa = new ProjectArticle();
                pa.setProject(project);
                pa.setArticle(article);
                pa.setStatut(ProjectArticle.Statut.A_LIRE);
                pa.setDateAjout(LocalDateTime.now());

                try {
                    projectArticleRepository.save(pa);
                    saved++;
                } catch (DataIntegrityViolationException e) {
                    existing++;
                }

            } catch (Exception e) {
                failed++;
                String titre = articleRequest.getTitre();
                errors.add("Echec pour \""
                        + (titre != null && titre.length() > 60 ? titre.substring(0, 60) + "..." : titre)
                        + "\" : " + e.getMessage());
                System.err.println("Batch save error: " + e.getMessage());
            }
        }

        return new BatchSaveResult(
                request.getArticles().size(),
                saved,
                existing,
                failed,
                errors
        );
    }

    // ================================================================
    // FIND OR CREATE ARTICLE
    // ================================================================

    private Article findOrCreateArticle(SaveArticleRequest request) {
        String doi   = request.getDoi()   != null ? request.getDoi().trim()   : null;
        String titre = request.getTitre() != null ? request.getTitre().trim() : null;
        Integer annee = request.getAnnee();

        // 1. Chercher par DOI — identifiant universel fiable
        if (doi != null && !doi.isEmpty()) {
            Optional<Article> byDoi = articleRepository.findByDoi(doi);
            if (byDoi.isPresent()) {
                return enrichAndSave(byDoi.get(), request, doi);
            }
        }

        // 2. Chercher par titre + année (les deux doivent correspondre)
        if (titre != null && !titre.isEmpty() && annee != null) {
            Optional<Article> byTitre = articleRepository.findByTitre(titre);
            if (byTitre.isPresent() && annee.equals(byTitre.get().getAnnee())) {
                return enrichAndSave(byTitre.get(), request, doi);
            }
        }

        // 3. Créer un nouvel article
        return createArticle(request, doi, titre);
    }

    private Article enrichAndSave(Article found, SaveArticleRequest request, String doi) {
        boolean updated = false;
        if ((found.getDoi() == null || found.getDoi().isEmpty()) && doi != null && !doi.isEmpty()) {
            found.setDoi(doi); updated = true;
        }
        if ((found.getResume() == null || found.getResume().isBlank())
                && request.getResume() != null && !request.getResume().isBlank()) {
            found.setResume(truncate(request.getResume(), 5000)); updated = true;
        }
        if (found.getNbCitations() == null && request.getNbCitations() != null) {
            found.setNbCitations(request.getNbCitations()); updated = true;
        }
        if ((found.getUrl() == null || found.getUrl().isBlank())
                && request.getUrl() != null && !request.getUrl().isBlank()) {
            found.setUrl(truncate(request.getUrl(), 2000)); updated = true;
        }
        if ((found.getJournal() == null || found.getJournal().isBlank())
                && request.getJournal() != null && !request.getJournal().isBlank()) {
            found.setJournal(truncate(request.getJournal(), 500)); updated = true;
        }
        return updated ? articleRepository.save(found) : found;
    }

    private Article createArticle(SaveArticleRequest request, String doi, String titre) {
        Article article = new Article();
        article.setTitre(titre != null && !titre.isEmpty() ? truncate(titre, 2000) : "Titre non disponible");
        article.setAuteurs(truncate(request.getAuteurs(), 2000));
        article.setAnnee(request.getAnnee());
        article.setDoi(doi != null && !doi.isEmpty() ? truncate(doi, 500) : null);
        article.setResume(truncate(request.getResume(), 5000));
        article.setUrl(truncate(request.getUrl(), 2000));
        article.setNbCitations(request.getNbCitations());
        article.setJournal(truncate(request.getJournal(), 500));
        article.setDocumentType(truncate(request.getDocumentType(), 100));
        article.setSourceNom(truncate(request.getSource(), 100));
        return articleRepository.save(article);
    }

    // ================================================================
    // CRUD CLASSIQUE
    // ================================================================

    public List<ProjectArticleDTO> getArticlesByProject(Long projectId) {
        return projectArticleRepository.findByProject_Id(projectId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProjectArticleDTO updateStatut(Long projectArticleId, String statut) {
        ProjectArticle pa = projectArticleRepository.findById(projectArticleId)
                .orElseThrow(() -> new RuntimeException("Lien article-projet non trouvé"));
        pa.setStatut(ProjectArticle.Statut.valueOf(statut));
        return convertToDTO(projectArticleRepository.save(pa));
    }

    public ProjectArticleDTO updateNote(Long projectArticleId, String note) {
        ProjectArticle pa = projectArticleRepository.findById(projectArticleId)
                .orElseThrow(() -> new RuntimeException("Lien article-projet non trouvé"));
        pa.setNote(note);
        return convertToDTO(projectArticleRepository.save(pa));
    }

    public void removeArticle(Long projectArticleId) {
        projectArticleRepository.deleteById(projectArticleId);
    }

    @Transactional
    public Map<String, Object> deduplicateProject(Long projectId) {
        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);
        Map<String, List<ProjectArticle>> grouped = new LinkedHashMap<>();

        for (ProjectArticle pa : list) {
            String doi = pa.getArticle().getDoi();
            String key;
            if (doi != null && !doi.trim().isEmpty()) {
                key = "doi:" + doi.toLowerCase().trim();
            } else if (pa.getArticle().getTitre() != null) {
                key = "titre:" + pa.getArticle().getTitre()
                        .toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", " ").trim();
            } else {
                key = "id:" + pa.getId();
            }
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(pa);
        }

        int marked = 0;
        for (List<ProjectArticle> duplicates : grouped.values()) {
            if (duplicates.size() > 1) {
                duplicates.sort(Comparator
                        .comparing((ProjectArticle p) -> p.getStatut() == ProjectArticle.Statut.RETENU ? 0 : 1)
                        .thenComparing(p -> p.getDateAjout() != null ? p.getDateAjout() : LocalDateTime.MIN));
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
        result.put("message", marked == 0 ? "Aucun doublon détecté." : marked + " doublon(s) détecté(s) et marqué(s).");
        return result;
    }

    // ================================================================
    // HELPERS
    // ================================================================

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() > maxLength ? value.substring(0, maxLength - 3) + "..." : value;
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
        dto.setJournal(pa.getArticle().getJournal());
        dto.setSource(pa.getArticle().getSourceNom());
        dto.setStatut(pa.getStatut().name());
        dto.setNote(pa.getNote());
        dto.setDateAjout(pa.getDateAjout());
        return dto;
    }
}