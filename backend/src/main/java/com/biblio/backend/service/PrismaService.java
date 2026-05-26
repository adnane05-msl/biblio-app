package com.biblio.backend.service;

import com.biblio.backend.dto.PrismaDTO;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ProjectArticleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrismaService {

    private final ProjectArticleRepository projectArticleRepository;

    public PrismaService(ProjectArticleRepository projectArticleRepository) {
        this.projectArticleRepository = projectArticleRepository;
    }

    public PrismaDTO getPrisma(Long projectId) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProject_Id(projectId);

        // Statistiques des articles sauvegardés
        int total = list.size();
        int doublons = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.DOUBLON).count();
        int exclus = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.EXCLU).count();
        int retenus = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.RETENU).count();
        int aLire = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.A_LIRE).count();

        // Simulation des résultats de recherche (à adapter avec données réelles)
        // Dans un cas réel, ces données viendraient de SearchHistory
        int totalRecherche = 200;  // À remplacer par données réelles
        int totalSauvegardes = total;

        return new PrismaDTO(
                totalRecherche,      // totalRecherche
                totalSauvegardes,    // totalSauvegardes
                doublons,            // totalDoublons
                exclus,              // totalExclus
                retenus,             // totalRetenus
                aLire,               // totalALire
                total - doublons     // apresDeduplication
        );
    }
}