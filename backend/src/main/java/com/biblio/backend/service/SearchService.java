package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private CrossrefService crossrefService;

    @Autowired
    private OpenAlexService openAlexService;

    @Autowired
    private AdminSourceRepository adminSourceRepository;

    private boolean isSourceActive(String nom) {
        return adminSourceRepository.findFirstByNomIgnoreCaseContaining(nom)
                .map(s -> s.getStatut() == AdminSource.StatutSource.EN_LIGNE
                        || s.getStatut() == AdminSource.StatutSource.LATENCE_ELEVEE)
                .orElse(true);
    }

    //  Recherche multi-sources

    public List<ArticleDTO> search(String query,
                                   boolean includeCrossref,
                                   boolean includeOpenAlex) {

        List<ArticleDTO> allResults = new ArrayList<>();

        // Crossref
        if (includeCrossref) {
            if (isSourceActive("crossref")) {
                try {
                    allResults.addAll(crossrefService.search(query));
                } catch (Exception e) {
                    System.err.println("Erreur Crossref: " + e.getMessage());
                }
            } else {
                System.out.println("Crossref désactivée par l'admin — source ignorée");
            }
        }

        // OpenAlex
        if (includeOpenAlex) {
            if (isSourceActive("openalex")) {
                try {
                    allResults.addAll(openAlexService.search(query));
                } catch (Exception e) {
                    System.err.println("Erreur OpenAlex: " + e.getMessage());
                }
            } else {
                System.out.println("OpenAlex désactivée par l'admin — source ignorée");
            }
        }

        // Nettoyer les DOI invalides avant de filtrer
        allResults.forEach(a -> {
            if (a.getDoi() != null) {
                String doi = a.getDoi().trim();
                // Crossref retourne parfois "null" comme string ou un DOI vide
                if (doi.isEmpty()
                        || doi.equalsIgnoreCase("null")
                        || doi.equalsIgnoreCase("undefined")
                        || doi.equals("https://doi.org/")
                        || doi.equals("http://doi.org/")) {
                    a.setDoi(null);
                }
            }
        });

        // ── Garder uniquement les articles avec DOI valide ────────────────
        // Les articles sans DOI ne peuvent pas être sauvegardés de façon fiable
        List<ArticleDTO> withDoi = allResults.stream()
                .filter(a -> a.getDoi() != null && !a.getDoi().trim().isEmpty())
                .collect(Collectors.toList());

        // ── Trier par année décroissante ──────────────────────────────────
        withDoi.sort((a, b) -> {
            if (a.getYear() == null && b.getYear() == null) return 0;
            if (a.getYear() == null) return 1;
            if (b.getYear() == null) return -1;
            return b.getYear().compareTo(a.getYear());
        });

        return withDoi;
    }
}