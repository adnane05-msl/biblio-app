package com.biblio.admin.controller;

import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import com.biblio.backend.repository.RechercheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.cache.CacheManager;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/maintenance")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class MaintenanceController {

    private final AdminSourceRepository sourceRepository;
    private final RechercheRepository   rechercheRepository;
    private final CacheManager cacheManager;


    // ── Section 2 : Tester une source ─────────────────────────
    @PostMapping("/tester-source/{id}")
    public ResponseEntity<Map<String, Object>> testerSource(@PathVariable Long id) {
        AdminSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable"));

        RestTemplate restTemplate = new RestTemplate();
        long debut = System.currentTimeMillis();

        try {
            restTemplate.headForHeaders(source.getUrlBase());
            long latence = System.currentTimeMillis() - debut;

            source.setLatenceMs((int) latence);
            source.setDerniereSynchro(LocalDateTime.now());
            source.setStatut(latence > 2000
                    ? AdminSource.StatutSource.LATENCE_ELEVEE
                    : AdminSource.StatutSource.EN_LIGNE);
            sourceRepository.save(source);

            return ResponseEntity.ok(Map.of(
                    "statut",  "OK",
                    "latence", latence,
                    "message", "Source accessible en " + latence + " ms"
            ));

        } catch (Exception e) {
            source.setStatut(AdminSource.StatutSource.HORS_LIGNE);
            source.setDerniereSynchro(LocalDateTime.now());
            sourceRepository.save(source);

            return ResponseEntity.ok(Map.of(
                    "statut",  "ERREUR",
                    "latence", -1,
                    "message", "Source inaccessible : " + e.getMessage()
            ));
        }
    }

    // ── Section 4 : Vider l'historique des recherches ─────────
    @DeleteMapping("/vider-historique")
    public ResponseEntity<Map<String, Object>> viderHistorique() {
        long count = rechercheRepository.count();
        rechercheRepository.deleteAll();
        return ResponseEntity.ok(Map.of(
                "message",  count + " recherche(s) supprimée(s)",
                "supprime", count
        ));
    }

    @PostMapping("/vider-cache")
    public ResponseEntity<Map<String, Object>> viderCache() {
        int count = 0;
        for (String cacheName : cacheManager.getCacheNames()) {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                count++;
            }
        }
        return ResponseEntity.ok(Map.of(
                "message", count + " cache(s) vidé(s) avec succès",
                "vide",    count
        ));
    }

}