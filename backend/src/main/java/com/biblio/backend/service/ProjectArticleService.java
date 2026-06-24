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
    private final BatchSaveService batchSaveService;

    // Seuil de similarité titre pour considérer deux titres "très proches"
    private static final double TITRE_SIMILARITY_THRESHOLD = 0.85;

    public ProjectArticleService(
            ProjectArticleRepository projectArticleRepository,
            ProjectRepository projectRepository,
            ArticleRepository articleRepository,
            BatchSaveService batchSaveService) {
        this.projectArticleRepository = projectArticleRepository;
        this.projectRepository = projectRepository;
        this.articleRepository = articleRepository;
        this.batchSaveService = batchSaveService;
    }

    // Sauvegarde unitaire
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

    // Sauvegarde en lot
    public Map<String, Object> saveBatch(SaveBatchRequest batchRequest) {
        Project project = projectRepository.findById(batchRequest.getProjectId())
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Cumul du total de recherche (fusion des recherches du projet)
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
                batchSaveService.saveOne(batchRequest.getProjectId(), req); // transaction isolée
                saved++;
            } catch (Exception e) {
                failed++;
                errors.add(e.getMessage());
                System.err.println("Article ignoré (non sauvegardable) : " + e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total",  total);
        result.put("saved",  saved);
        result.put("failed", failed);
        result.put("errors", errors);
        return result;
    }

    // Déduplication intelligente (optimisée)
    public Map<String, Object> deduplicate(Long projectId) {
        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);
        int n = list.size();

        // ── Pré-calcul des caractéristiques ──
        List<String> doiN = new ArrayList<>(n);
        List<Set<String>> titreBg = new ArrayList<>(n);
        List<Set<String>> auteurBg = new ArrayList<>(n);
        List<Integer> annee = new ArrayList<>(n);
        boolean[] generique = new boolean[n];

        for (int i = 0; i < n; i++) {
            Article a = list.get(i).getArticle();

            String doi = a.getDoi();
            doiN.add(doi != null && !doi.trim().isEmpty() ? normalize(doi) : null);

            String t = a.getTitre() != null ? a.getTitre() : "";
            generique[i] = t.startsWith("Article sans titre #");
            titreBg.add(bigrams(normalize(t)));

            String aut = a.getAuteurs();
            auteurBg.add(aut != null && !aut.isEmpty()
                    ? bigrams(normalize(aut.split("[,;]")[0].trim()))
                    : null);

            annee.add(a.getAnnee());
        }

        //  Union-Find pour regrouper les doublons
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (find(parent, i) == find(parent, j)) continue;

                boolean dup = false;

                if (doiN.get(i) != null && doiN.get(i).equals(doiN.get(j))) {
                    dup = true;
                }
                else if (!generique[i] && !generique[j]) {
                    double sim = jaccardFromSets(titreBg.get(i), titreBg.get(j));
                    if (sim >= TITRE_SIMILARITY_THRESHOLD) {
                        boolean memeAnnee = annee.get(i) != null
                                && annee.get(i).equals(annee.get(j));
                        boolean memesAuteurs = auteurBg.get(i) != null
                                && auteurBg.get(j) != null
                                && jaccardFromSets(auteurBg.get(i), auteurBg.get(j)) >= 0.80;
                        if (sim >= 0.95 || memeAnnee || memesAuteurs) {
                            dup = true;
                        }
                    }
                }

                if (dup) union(parent, i, j);
            }
        }

        // Regrouper par racine
        Map<Integer, List<Integer>> groups = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            int root = find(parent, i);
            groups.computeIfAbsent(root, k -> new ArrayList<>()).add(i);
        }

        //  Conserver le 1er (plus ancien), marquer les autres DOUBLON
        int doublonsMarques = 0;
        for (List<Integer> group : groups.values()) {
            if (group.size() > 1) {
                group.sort(Comparator.comparing(idx ->
                        list.get(idx).getDateAjout() != null
                                ? list.get(idx).getDateAjout()
                                : java.time.LocalDateTime.MIN));

                for (int k = 1; k < group.size(); k++) {
                    ProjectArticle pa = list.get(group.get(k));
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

    //  Jaccard à partir de bigrammes déjà calculés
    private double jaccardFromSets(Set<String> bg1, Set<String> bg2) {
        if (bg1.isEmpty() && bg2.isEmpty()) return 1.0;
        if (bg1.isEmpty() || bg2.isEmpty()) return 0.0;

        Set<String> smaller = bg1.size() < bg2.size() ? bg1 : bg2;
        Set<String> larger  = (smaller == bg1) ? bg2 : bg1;

        int inter = 0;
        for (String s : smaller) if (larger.contains(s)) inter++;

        int union = bg1.size() + bg2.size() - inter;
        return union == 0 ? 0.0 : (double) inter / union;
    }

    private Set<String> bigrams(String s) {
        Set<String> result = new HashSet<>();
        for (int i = 0; i < s.length() - 1; i++) {
            result.add(s.substring(i, i + 2));
        }
        return result;
    }

    // Normalise : minuscules, sans accents, sans ponctuation, espaces réduits
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

    //  Union-Find
    private int find(int[] parent, int i) {
        if (parent[i] != i) parent[i] = find(parent, parent[i]);
        return parent[i];
    }

    private void union(int[] parent, int i, int j) {
        parent[find(parent, i)] = find(parent, j);
    }

    // Helper sauvegarde unitaire (réutilise un article même DOI + même année)
    private Article findOrCreateArticleNoBlock(SaveArticleRequest request) {
        String doi   = request.getDoi()   != null ? request.getDoi().trim()   : null;
        String titre = request.getTitre() != null ? request.getTitre().trim() : null;

        if (doi != null && !doi.isEmpty()) {
            Article existing = articleRepository.findAllByDoi(doi).stream()
                    .filter(a -> a.getAnnee() != null
                            && a.getAnnee().equals(request.getAnnee()))
                    .findFirst()
                    .orElse(null);
            if (existing != null) {
                return existing;
            }
        }

        if (titre == null || titre.isEmpty()) {
            String suffix = UUID.randomUUID().toString().substring(0, 8);
            titre = (doi != null && !doi.isEmpty())
                    ? "Article " + doi
                    : "Article sans titre #" + suffix;
        }

        Article article = new Article();
        article.setTitre(cut(titre, 2000));
        article.setDoi(doi != null && !doi.isEmpty() ? cut(doi, 500) : null);
        article.setAuteurs(cut(request.getAuteurs(), 2000));
        article.setAnnee(request.getAnnee());
        article.setJournal(cut(request.getJournal(), 500));
        article.setDocumentType(cut(request.getDocumentType(), 100));
        article.setSourceNom(cut(request.getSource(), 100));
        article.setResume(cut(request.getResume(), 5000));
        article.setUrl(cut(request.getUrl(), 2000));
        article.setNbCitations(request.getNbCitations());

        return articleRepository.save(article);
    }

    // Tronque une chaîne à la longueur max de la colonne
    private String cut(String s, int max) {
        if (s == null) return null;
        s = s.trim();
        return s.length() > max ? s.substring(0, max) : s;
    }

    // Autres méthodes
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