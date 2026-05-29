package com.biblio.backend.service;

import com.biblio.backend.dto.ProjectArticleDTO;
import com.biblio.backend.dto.SaveArticleRequest;
import com.biblio.backend.dto.SaveBatchRequest;
import com.biblio.backend.model.Article;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ArticleRepository;
import com.biblio.backend.repository.ProjectArticleRepository;
import com.biblio.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.*;
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

    // ── Sauvegarde unitaire ──────────────────────────────────────────────────
    public ProjectArticleDTO saveArticle(SaveArticleRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        Article article = findOrCreateArticle(request);

        if (projectArticleRepository.existsByProjectAndArticle(project, article)) {
            throw new RuntimeException("Article déjà présent dans ce projet");
        }

        ProjectArticle pa = new ProjectArticle();
        pa.setProject(project);
        pa.setArticle(article);
        pa.setStatut(ProjectArticle.Statut.A_LIRE);

        return convertToDTO(projectArticleRepository.save(pa));
    }

    // ── Sauvegarde en lot ─────────────────────────────────────────────────────
    public Map<String, Object> saveBatch(SaveBatchRequest batchRequest) {

        Project project = projectRepository.findById(batchRequest.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Persiste totalRecherche dans le projet (par projet, pas global)
        if (batchRequest.getTotalRecherche() != null && batchRequest.getTotalRecherche() > 0) {
            project.setTotalRecherche(batchRequest.getTotalRecherche());
            projectRepository.save(project);
        }

        int total    = batchRequest.getArticles().size();
        int saved    = 0;
        int existing = 0;
        int failed   = 0;
        List<String> errors = new ArrayList<>();

        for (SaveArticleRequest req : batchRequest.getArticles()) {
            try {
                req.setProjectId(batchRequest.getProjectId());
                Article article = findOrCreateArticle(req);

                if (projectArticleRepository.existsByProjectAndArticle(project, article)) {
                    existing++;
                } else {
                    ProjectArticle pa = new ProjectArticle();
                    pa.setProject(project);
                    pa.setArticle(article);
                    pa.setStatut(ProjectArticle.Statut.A_LIRE);
                    projectArticleRepository.save(pa);
                    saved++;
                }
            } catch (Exception e) {
                failed++;
                errors.add(e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total",    total);
        result.put("saved",    saved);
        result.put("existing", existing);
        result.put("failed",   failed);
        result.put("errors",   errors);
        return result;
    }

    // ── Helper : trouve ou crée un article ───────────────────────────────────
    // FIX "Common part can be extracted from if" : la création du ProjectArticle
    // est factorisée dans saveArticle() et saveBatch() séparément (logiques différentes).
    // Ici on factorise uniquement la recherche/création de l'Article lui-même.
    private Article findOrCreateArticle(SaveArticleRequest request) {
        String doi   = request.getDoi()   != null ? request.getDoi().trim()   : null;
        String titre = request.getTitre() != null ? request.getTitre().trim() : null;

        // 1. Chercher par DOI, puis par titre
        Article article = null;
        if (doi != null && !doi.isEmpty()) {
            article = articleRepository.findByDoi(doi).orElse(null);
        }
        if (article == null && titre != null && !titre.isEmpty()) {
            article = articleRepository.findByTitre(titre).orElse(null);
        }

        if (article == null) {
            // 2. Créer un nouvel article
            // FIX "Common part" : le titre par défaut est extrait avant le if/else
            if (titre == null || titre.isEmpty()) {
                titre = (doi != null && !doi.isEmpty()) ? "Article " + doi : "Article sans titre";
            }
            article = new Article();
            article.setTitre(titre);
            article.setDoi(doi != null && !doi.isEmpty() ? doi : null);
            // Les champs suivants sont communs — extraits du if/else
            article.setAuteurs(request.getAuteurs());
            article.setAnnee(request.getAnnee());
            article.setJournal(request.getJournal());
            article.setDocumentType(request.getDocumentType());
            article.setSourceNom(request.getSource());
            article.setResume(request.getResume());
            article.setUrl(request.getUrl());
            article.setNbCitations(request.getNbCitations());
        } else {
            // 3. Mettre à jour les métadonnées fraîches (champs non-null uniquement)
            if (request.getDocumentType() != null) article.setDocumentType(request.getDocumentType());
            if (request.getJournal()      != null) article.setJournal(request.getJournal());
            if (request.getAuteurs()      != null) article.setAuteurs(request.getAuteurs());
            if (request.getResume()       != null) article.setResume(request.getResume());
            if (request.getNbCitations()  != null) article.setNbCitations(request.getNbCitations());
            if (request.getUrl()          != null) article.setUrl(request.getUrl());
        }

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

    public Map<String, Object> deduplicate(Long projectId) {
        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);

        Map<String, List<ProjectArticle>> groups = new LinkedHashMap<>();
        for (ProjectArticle pa : list) {
            String doi = pa.getArticle().getDoi();
            String key = (doi != null && !doi.trim().isEmpty())
                    ? "doi:"   + doi.trim().toLowerCase()
                    : "titre:" + (pa.getArticle().getTitre() != null
                    ? pa.getArticle().getTitre().trim().toLowerCase() : "");
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(pa);
        }

        int doublonsMarques = 0;
        for (List<ProjectArticle> group : groups.values()) {
            if (group.size() > 1) {
                for (int i = 1; i < group.size(); i++) {
                    group.get(i).setStatut(ProjectArticle.Statut.DOUBLON);
                    projectArticleRepository.save(group.get(i));
                    doublonsMarques++;
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("doublonsMarques", doublonsMarques);
        result.put("totalTraites",    list.size());
        return result;
    }

    private ProjectArticleDTO convertToDTO(ProjectArticle pa) {
        ProjectArticleDTO dto = new ProjectArticleDTO();
        dto.setId(pa.getId());
        dto.setArticleId(pa.getArticle().getId());
        dto.setTitre(pa.getArticle().getTitre());
        dto.setAuteurs(pa.getArticle().getAuteurs());
        dto.setAnnee(pa.getArticle().getAnnee());
        dto.setDocumentType(pa.getArticle().getDocumentType());
        dto.setJournal(pa.getArticle().getJournal());
        dto.setSource(pa.getArticle().getSourceNom());
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