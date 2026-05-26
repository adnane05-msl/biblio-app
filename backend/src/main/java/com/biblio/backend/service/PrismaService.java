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

    public PrismaDTO getPrisma(Long projectId, int totalRecherche) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProject_Id(projectId);

        int total = list.size();
        int doublons = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.DOUBLON).count();
        int exclus = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.EXCLU).count();
        int retenus = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.RETENU).count();
        int aLire = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.A_LIRE).count();

        int totalSauvegardes = total;

        // Si aucune recherche enregistrée, utiliser totalSauvegardes comme minimum
        int recherche = totalRecherche > 0 ? totalRecherche : totalSauvegardes;

        return new PrismaDTO(
                recherche,
                totalSauvegardes,
                doublons,
                exclus,
                retenus,
                aLire,
                total - doublons
        );
    }
}