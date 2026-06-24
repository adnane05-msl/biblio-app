package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

@Service
public class SearchService {

    @Autowired
    private CrossrefService crossrefService;

    @Autowired
    private OpenAlexService openAlexService;

    @Autowired
    private AdminSourceRepository adminSourceRepository;

    @Autowired
    private ExecutorService searchExecutor;

    //  Vérification du statut admin d'une source
    private boolean isSourceActive(String nom) {
        return adminSourceRepository.findFirstByNomIgnoreCaseContaining(nom)
                .map(s -> s.getStatut() == AdminSource.StatutSource.EN_LIGNE
                        || s.getStatut() == AdminSource.StatutSource.LATENCE_ELEVEE)
                .orElse(true);
    }

    //  Recherche multi-sources — Crossref et OpenAlex EN PARALLÈLE
    public List<ArticleDTO> search(String query,
                                   boolean includeCrossref,
                                   boolean includeOpenAlex) {

        List<ArticleDTO> allResults = new ArrayList<>();

        // ── Lancement des deux recherches en parallèle ──
        CompletableFuture<List<ArticleDTO>> crossrefFuture =
                (includeCrossref && isSourceActive("crossref"))
                        ? CompletableFuture.supplyAsync(() -> safeSearch(crossrefService, query, "Crossref"), searchExecutor)
                        : CompletableFuture.completedFuture(new ArrayList<>());

        CompletableFuture<List<ArticleDTO>> openAlexFuture =
                (includeOpenAlex && isSourceActive("openalex"))
                        ? CompletableFuture.supplyAsync(() -> safeSearch(openAlexService, query, "OpenAlex"), searchExecutor)
                        : CompletableFuture.completedFuture(new ArrayList<>());

        if (includeCrossref && !isSourceActive("crossref")) {
            System.out.println("Crossref désactivée par l'admin — source ignorée");
        }
        if (includeOpenAlex && !isSourceActive("openalex")) {
            System.out.println("OpenAlex désactivée par l'admin — source ignorée");
        }

        // ── Attente des deux résultats ──
        allResults.addAll(crossrefFuture.join());
        allResults.addAll(openAlexFuture.join());

        // ── Nettoyage des DOI invalides (transforme un faux DOI en null) ──
        // On ne SUPPRIME plus l'article : on remet juste son DOI à null.
        allResults.forEach(a -> {
            if (a.getDoi() != null) {
                String doi = a.getDoi().trim();
                if (doi.isEmpty()
                        || doi.equalsIgnoreCase("null")
                        || doi.equalsIgnoreCase("undefined")
                        || doi.equals("https://doi.org/")
                        || doi.equals("http://doi.org/")) {
                    a.setDoi(null);
                }
            }
        });
        
        // ── Trier par année décroissante ──────────────────────────────────
        allResults.sort((a, b) -> {
            if (a.getYear() == null && b.getYear() == null) return 0;
            if (a.getYear() == null) return 1;
            if (b.getYear() == null) return -1;
            return b.getYear().compareTo(a.getYear());
        });

        return allResults;
    }

    // Petit helper générique pour appeler les deux services de la même façon
    private List<ArticleDTO> safeSearch(Object service, String query, String nomSource) {
        try {
            if (service instanceof CrossrefService cs) return cs.search(query);
            if (service instanceof OpenAlexService os) return os.search(query);
            return new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Erreur " + nomSource + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }
}