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

    // Seuil de similarité titre pour considérer deux titres "très proches"
    private static final double TITRE_SIMILARITY_THRESHOLD = 0.85;

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

        Article article = findOrCreateArticleNoBlock(request);

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

        if (batchRequest.getTotalRecherche() != null && batchRequest.getTotalRecherche() > 0) {

            String nouvelleRequete = batchRequest.getQuery() != null
                    ? batchRequest.getQuery().trim().toLowerCase()
                    : null;
            String derniereRequete = project.getDerniereRequeteComptee();

            boolean memeRequete = nouvelleRequete != null
                    && nouvelleRequete.equals(derniereRequete);

            if (!memeRequete) {
                int totalExistant = project.getTotalRecherche() != null
                        ? project.getTotalRecherche()
                        : 0;
                project.setTotalRecherche(totalExistant + batchRequest.getTotalRecherche());
                project.setDerniereRequeteComptee(nouvelleRequete);
                projectRepository.save(project);
            }
        }

        int total  = batchRequest.getArticles().size();
        int saved  = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (SaveArticleRequest req : batchRequest.getArticles()) {
            try {
                req.setProjectId(batchRequest.getProjectId());
                Article article = findOrCreateArticleNoBlock(req);

                ProjectArticle pa = new ProjectArticle();
                pa.setProject(project);
                pa.setArticle(article);
                pa.setStatut(ProjectArticle.Statut.A_LIRE);
                projectArticleRepository.save(pa);
                saved++;
            } catch (Exception e) {
                failed++;
                errors.add(e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total",  total);
        result.put("saved",  saved);
        result.put("failed", failed);
        result.put("errors", errors);
        return result;
    }

    // ── Déduplication intelligente ────────────────────────────────────────────
    //
    // Critères (ordre de priorité) :
    //   1. DOI identique (non vide)                          → doublon certain
    //   2. Titre très proche (similarité ≥ 85%)
    //      ET (mêmes auteurs OU même année)                  → doublon probable
    //   3. Titre très proche seul (similarité ≥ 85%)        → doublon possible
    //
    // Dans chaque groupe, le 1er article (plus ancien dateAjout) est conservé,
    // les suivants sont marqués DOUBLON.
    //
    public Map<String, Object> deduplicate(Long projectId) {
        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);

        // Union-Find pour regrouper les doublons
        int n = list.size();
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (find(parent, i) == find(parent, j)) continue; // déjà dans le même groupe

                Article a = list.get(i).getArticle();
                Article b = list.get(j).getArticle();

                if (areDoublons(a, b)) {
                    union(parent, i, j);
                }
            }
        }

        // Regrouper par racine
        Map<Integer, List<Integer>> groups = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            int root = find(parent, i);
            groups.computeIfAbsent(root, k -> new ArrayList<>()).add(i);
        }

        int doublonsMarques = 0;
        for (List<Integer> group : groups.values()) {
            if (group.size() > 1) {
                // Trier par dateAjout ASC : le plus ancien est conservé
                group.sort(Comparator.comparing(idx ->
                        list.get(idx).getDateAjout() != null
                                ? list.get(idx).getDateAjout()
                                : java.time.LocalDateTime.MIN));

                // Conserver le 1er, marquer les autres DOUBLON
                for (int k = 1; k < group.size(); k++) {
                    ProjectArticle pa = list.get(group.get(k));
                    // Ne pas écraser un statut RETENU ou EXCLU manuellement défini
                    if (pa.getStatut() == ProjectArticle.Statut.A_LIRE
                            || pa.getStatut() == ProjectArticle.Statut.DOUBLON) {
                        pa.setStatut(ProjectArticle.Statut.DOUBLON);
                        projectArticleRepository.save(pa);
                        doublonsMarques++;
                    }
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("doublonsMarques", doublonsMarques);
        result.put("totalTraites",    n);
        return result;
    }

    // ── Logique de comparaison ────────────────────────────────────────────────

    private boolean areDoublons(Article a, Article b) {
        // Critère 1 : DOI identique (non vide)
        if (hasDoi(a) && hasDoi(b)) {
            if (normalize(a.getDoi()).equals(normalize(b.getDoi()))) {
                return true;
            }
        }

        // Critère 2 & 3 : similarité de titre
        String titreA = a.getTitre() != null ? a.getTitre() : "";
        String titreB = b.getTitre() != null ? b.getTitre() : "";

        // Ignorer les titres génériques ("Article sans titre #xxx")
        if (titreA.startsWith("Article sans titre #") || titreB.startsWith("Article sans titre #")) {
            return false;
        }

        double simTitre = jaccardBigrams(normalize(titreA), normalize(titreB));

        if (simTitre >= TITRE_SIMILARITY_THRESHOLD) {
            // Critère 2 : titre proche + (mêmes auteurs OU même année)
            boolean memeAnnee    = a.getAnnee() != null && a.getAnnee().equals(b.getAnnee());
            boolean memesAuteurs = sameAuthors(a.getAuteurs(), b.getAuteurs());

            // Titre très proche seul (≥ 0.95) suffit aussi
            if (simTitre >= 0.95 || memeAnnee || memesAuteurs) {
                return true;
            }
        }

        return false;
    }

    // Jaccard sur bigrammes — mesure de similarité entre deux chaînes
    private double jaccardBigrams(String s1, String s2) {
        if (s1.isEmpty() && s2.isEmpty()) return 1.0;
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;

        Set<String> bg1 = bigrams(s1);
        Set<String> bg2 = bigrams(s2);

        Set<String> intersection = new HashSet<>(bg1);
        intersection.retainAll(bg2);

        Set<String> union = new HashSet<>(bg1);
        union.addAll(bg2);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    private Set<String> bigrams(String s) {
        Set<String> result = new HashSet<>();
        for (int i = 0; i < s.length() - 1; i++) {
            result.add(s.substring(i, i + 2));
        }
        return result;
    }

    // Normalise une chaîne : minuscules, sans accents, sans ponctuation, espaces réduits
    private String normalize(String s) {
        if (s == null) return "";
        return java.text.Normalizer
                .normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean hasDoi(Article a) {
        return a.getDoi() != null && !a.getDoi().trim().isEmpty();
    }

    // Compare les auteurs : extrait le premier auteur et compare par bigrammes
    private boolean sameAuthors(String auteursA, String auteursB) {
        if (auteursA == null || auteursB == null) return false;
        String firstA = auteursA.split("[,;]")[0].trim();
        String firstB = auteursB.split("[,;]")[0].trim();
        return jaccardBigrams(normalize(firstA), normalize(firstB)) >= 0.80;
    }

    // ── Union-Find ────────────────────────────────────────────────────────────
    private int find(int[] parent, int i) {
        if (parent[i] != i) parent[i] = find(parent, parent[i]);
        return parent[i];
    }

    private void union(int[] parent, int i, int j) {
        parent[find(parent, i)] = find(parent, j);
    }

    // ── Helpers sauvegarde ────────────────────────────────────────────────────
    private Article findOrCreateArticleNoBlock(SaveArticleRequest request) {
        String doi   = request.getDoi()   != null ? request.getDoi().trim()   : null;
        String titre = request.getTitre() != null ? request.getTitre().trim() : null;

        if (doi != null && !doi.isEmpty()) {
            Article existing = articleRepository.findByDoi(doi).orElse(null);
            if (existing != null) {
                updateMetadata(existing, request);
                return articleRepository.save(existing);
            }
        }

        if (titre == null || titre.isEmpty()) {
            String suffix = UUID.randomUUID().toString().substring(0, 8);
            titre = (doi != null && !doi.isEmpty())
                    ? "Article " + doi
                    : "Article sans titre #" + suffix;
        }

        Article article = new Article();
        article.setTitre(titre);
        article.setDoi(doi != null && !doi.isEmpty() ? doi : null);
        article.setAuteurs(request.getAuteurs());
        article.setAnnee(request.getAnnee());
        article.setJournal(request.getJournal());
        article.setDocumentType(request.getDocumentType());
        article.setSourceNom(request.getSource());
        article.setResume(request.getResume());
        article.setUrl(request.getUrl());
        article.setNbCitations(request.getNbCitations());

        return articleRepository.save(article);
    }

    private void updateMetadata(Article article, SaveArticleRequest request) {
        if (request.getDocumentType() != null) article.setDocumentType(request.getDocumentType());
        if (request.getJournal()      != null) article.setJournal(request.getJournal());
        if (request.getAuteurs()      != null) article.setAuteurs(request.getAuteurs());
        if (request.getResume()       != null) article.setResume(request.getResume());
        if (request.getNbCitations()  != null) article.setNbCitations(request.getNbCitations());
        if (request.getUrl()          != null) article.setUrl(request.getUrl());
    }

    // ── Autres méthodes inchangées ────────────────────────────────────────────
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