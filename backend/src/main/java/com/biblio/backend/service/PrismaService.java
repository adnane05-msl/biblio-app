package com.biblio.backend.service;

import com.biblio.backend.dto.PrismaDTO;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ProjectArticleRepository;
import com.biblio.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrismaService {

    private final ProjectArticleRepository projectArticleRepository;
    private final ProjectRepository projectRepository;

    public PrismaService(ProjectArticleRepository projectArticleRepository,
                         ProjectRepository projectRepository) {
        this.projectArticleRepository = projectArticleRepository;
        this.projectRepository = projectRepository;
    }

    public PrismaDTO getPrisma(Long projectId) {

        // ── Récupère le projet pour lire totalRecherche stocké en BDD ──────
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);

        int totalSauvegardes    = list.size();
        int doublons            = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.DOUBLON).count();
        int exclus              = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.EXCLU).count();
        int retenus             = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.RETENU).count();
        int aLire               = (int) list.stream()
                .filter(pa -> pa.getStatut() == ProjectArticle.Statut.A_LIRE).count();
        int apresDeduplication  = totalSauvegardes - doublons;

        // totalRecherche vient maintenant directement de la BDD (persisté par projet)
        int totalRecherche = project.getTotalRecherche() != null
                ? project.getTotalRecherche()
                : totalSauvegardes;   // fallback si jamais null

        return new PrismaDTO(
                totalRecherche,
                totalSauvegardes,
                doublons,
                exclus,
                retenus,
                aLire,
                apresDeduplication
        );
    }
}