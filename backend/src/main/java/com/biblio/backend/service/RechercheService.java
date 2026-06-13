// service/RechercheService.java
package com.biblio.backend.service;

import com.biblio.backend.dto.RechercheDTO;
import com.biblio.backend.model.Recherche;
import com.biblio.backend.model.Utilisateur;
import com.biblio.backend.repository.RechercheRepository;
import com.biblio.backend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RechercheService {

    @Autowired
    private RechercheRepository rechercheRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // ── Sauvegarder requête + résultats JSON dans table `recherche` ────────
    public void saveRecherche(Long userId, String requete, int nbResultats, String resultatsJson) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + userId));

        // Anti-doublon : même requête dans les 30 dernières secondes
        List<Recherche> recent = rechercheRepository
                .findByUtilisateurIdOrderByDateRechercheDesc(userId);

        if (!recent.isEmpty()) {
            Recherche last = recent.get(0);
            boolean memeRequete = last.getRequete().equalsIgnoreCase(requete.trim());
            boolean tresRecente = last.getDateRecherche()
                    .isAfter(LocalDateTime.now().minusSeconds(30));
            if (memeRequete && tresRecente) {
                // Mettre à jour les résultats même si doublon (résultats peuvent avoir changé)
                last.setNbResultats(nbResultats);
                last.setResultatsJson(resultatsJson);
                rechercheRepository.save(last);
                System.out.println("Résultats mis à jour pour: " + requete);
                return;
            }
        }

        Recherche r = new Recherche();
        r.setRequete(requete.trim());
        r.setNbResultats(nbResultats);
        r.setDateRecherche(LocalDateTime.now());
        r.setResultatsJson(resultatsJson);
        r.setUtilisateur(utilisateur);
        rechercheRepository.save(r);

        System.out.println("Sauvegardé dans `recherche`: "
                + requete + " (" + nbResultats + " résultats) userId=" + userId);
    }

    // ── Récupérer l'historique avec les résultats JSON ─────────────────────
    public List<RechercheDTO> getHistorique(Long userId) {
        return rechercheRepository
                .findByUtilisateurIdOrderByDateRechercheDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private RechercheDTO toDTO(Recherche r) {
        RechercheDTO dto = new RechercheDTO();
        dto.setId(r.getId());
        dto.setRequete(r.getRequete());
        dto.setDateRecherche(r.getDateRecherche());
        dto.setNbResultats(r.getNbResultats());
        dto.setResultatsJson(r.getResultatsJson());  // ← inclus pour le cache frontend
        return dto;
    }
}