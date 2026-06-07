// controller/SearchController.java
package com.biblio.backend.controller;

import com.biblio.backend.dto.ArticleDTO;
import com.biblio.backend.dto.RechercheDTO;
import com.biblio.backend.dto.SaveHistoriqueRequest;
import com.biblio.backend.service.SearchService;
import com.biblio.backend.service.RechercheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recherche")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:3008"})
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private RechercheService rechercheService;

    // ── Recherche pure ────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<ArticleDTO>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "true") boolean crossref,
            @RequestParam(defaultValue = "true") boolean openalex) {

        List<ArticleDTO> results = searchService.search(query, crossref, openalex);
        return ResponseEntity.ok(results);
    }


    // ── Sauvegarder dans l'historique (query + résultats JSON) ────────────
    @PostMapping("/historique")
    public ResponseEntity<Void> saveHistorique(@RequestBody SaveHistoriqueRequest request) {
        System.out.println("=== SAVE HISTORIQUE ===");
        System.out.println("userId     : " + request.getUserId());
        System.out.println("query      : " + request.getQuery());
        System.out.println("nbResultats: " + request.getNbResultats());
        System.out.println("jsonSize   : " + (request.getResultatsJson() != null
                ? request.getResultatsJson().length() + " chars" : "null"));
        try {
            rechercheService.saveRecherche(
                    request.getUserId(),
                    request.getQuery(),
                    request.getNbResultats(),
                    request.getResultatsJson()
            );
        } catch (Exception e) {
            System.err.println("Erreur: " + e.getMessage());
            e.printStackTrace();
        }
        return ResponseEntity.ok().build();
    }

    // ── Récupérer l'historique (avec résultats JSON) ──────────────────────
    @GetMapping("/historique/{userId}")
    public ResponseEntity<List<RechercheDTO>> getHistorique(@PathVariable Long userId) {
        return ResponseEntity.ok(rechercheService.getHistorique(userId));
    }

    // ── Supprimer une entrée définitivement ───────────────────────────────
    @DeleteMapping("/historique/{id}")
    public ResponseEntity<Void> deleteHistorique(@PathVariable Long id) {
        rechercheService.deleteRecherche(id);
        return ResponseEntity.noContent().build();
    }

    // ── Vider tout l'historique définitivement ────────────────────────────
    @DeleteMapping("/historique/utilisateur/{userId}")
    public ResponseEntity<Void> clearHistorique(@PathVariable Long userId) {
        rechercheService.clearHistorique(userId);
        return ResponseEntity.noContent().build();
    }
}