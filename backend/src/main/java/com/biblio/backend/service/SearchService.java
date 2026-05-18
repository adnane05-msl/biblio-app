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

    public List<ArticleDTO> search(String query,
                                   boolean includeCrossref,
                                   boolean includeOpenAlex,
                                   boolean includeArxiv) {

        List<ArticleDTO> allResults = new ArrayList<>();

        if (includeCrossref) {
            try {
                allResults.addAll(crossrefService.search(query));
            } catch (Exception e) {
                System.err.println("Erreur Crossref: " + e.getMessage());
            }
        }

        if (includeOpenAlex) {
            try {
                allResults.addAll(openAlexService.search(query));
            } catch (Exception e) {
                System.err.println("Erreur OpenAlex: " + e.getMessage());
            }
        }

        if (includeArxiv) {
            try {
                allResults.addAll(arxivService.search(query));
            } catch (Exception e) {
                System.err.println("Erreur arXiv: " + e.getMessage());
            }
        }

        // ← Trier par année décroissante seulement
        allResults.sort((a, b) -> {
            if (a.getYear() == null && b.getYear() == null) return 0;
            if (a.getYear() == null) return 1;
            if (b.getYear() == null) return -1;
            return b.getYear().compareTo(a.getYear());
        });

        return allResults;
    }
}