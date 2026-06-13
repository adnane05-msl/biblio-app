package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {

    @Autowired
    private CrossrefService crossrefService;

    @Autowired
    private OpenAlexService openAlexService;

    @Autowired
    private AdminSourceRepository adminSourceRepository;

    // ════════════════════════════════════════════════════════════════════
    //  Vérification du statut admin d'une source
    // ════════════════════════════════════════════════════════════════════
    //  La page admin "Sources" permet d'activer / désactiver une source.
    //    - Active      : EN_LIGNE ou LATENCE_ELEVEE
    //    - Désactivée  : HORS_LIGNE ou MAINTENANCE
    //  Si la source n'est pas référencée dans la table, elle est considérée
    //  active par défaut (fallback de sécurité).
    private boolean isSourceActive(String nom) {
        return adminSourceRepository.findFirstByNomIgnoreCaseContaining(nom)
                .map(s -> s.getStatut() == AdminSource.StatutSource.EN_LIGNE
                        || s.getStatut() == AdminSource.StatutSource.LATENCE_ELEVEE)
                .orElse(true);
    }

    // ════════════════════════════════════════════════════════════════════
    //  Recherche multi-sources
    // ════════════════════════════════════════════════════════════════════
    public List<ArticleDTO> search(String query,
                                   boolean includeCrossref,
                                   boolean includeOpenAlex) {

        List<ArticleDTO> allResults = new ArrayList<>();

        // ── Crossref ──────────────────────────────────────────────────────
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

        // ── OpenAlex ──────────────────────────────────────────────────────
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

        // ── On garde TOUS les articles, avec ou sans DOI ──────────────────
        // Les articles sans DOI (livres, chapitres, etc.) sont des références
        // valides : ils doivent pouvoir être affichés ET sauvegardés.
        // ── Trier par année décroissante ──────────────────────────────────
        allResults.sort((a, b) -> {
            if (a.getYear() == null && b.getYear() == null) return 0;
            if (a.getYear() == null) return 1;
            if (b.getYear() == null) return -1;
            return b.getYear().compareTo(a.getYear());
        });

        return allResults;
    }
}