package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SearchService {

    @Autowired
    private CrossrefService crossrefService;

    @Autowired
    private OpenAlexService openAlexService;

    @Autowired
    private ArxivService arxivService;

    public List<ArticleDTO> search(String query, boolean includeCrossref, boolean includeOpenAlex, boolean includeArxiv) {
        List<ArticleDTO> allResults = new ArrayList<>();

        // Appel parallèle aux différentes sources
        if (includeCrossref) {
            try {
                allResults.addAll(crossrefService.search(query));
                System.out.println("Crossref: " + crossrefService.search(query).size() + " articles");
            } catch (Exception e) {
                System.err.println("Erreur Crossref: " + e.getMessage());
            }
        }

        if (includeOpenAlex) {
            try {
                allResults.addAll(openAlexService.search(query));
                System.out.println("OpenAlex: " + openAlexService.search(query).size() + " articles");
            } catch (Exception e) {
                System.err.println("Erreur OpenAlex: " + e.getMessage());
            }
        }

        if (includeArxiv) {
            try {
                allResults.addAll(arxivService.search(query));
                System.out.println("arXiv: " + arxivService.search(query).size() + " articles");
            } catch (Exception e) {
                System.err.println("Erreur arXiv: " + e.getMessage());
            }
        }

        // Déduplication par DOI (ou titre si pas de DOI)
        Map<String, ArticleDTO> uniqueMap = new LinkedHashMap<>();
        for (ArticleDTO article : allResults) {
            String key = article.getDoi() != null ? article.getDoi() : article.getTitle();
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, article);
            }
        }

        // Trier par année (plus récent d'abord)
        List<ArticleDTO> sortedResults = new ArrayList<>(uniqueMap.values());
        sortedResults.sort((a, b) -> {
            if (a.getYear() == null && b.getYear() == null) return 0;
            if (a.getYear() == null) return 1;
            if (b.getYear() == null) return -1;
            return b.getYear().compareTo(a.getYear());
        });

        // Limiter à 100 résultats maximum
        if (sortedResults.size() > 100) {
            sortedResults = sortedResults.subList(0, 100);
        }

        return sortedResults;
    }
}