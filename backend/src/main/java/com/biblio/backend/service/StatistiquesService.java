package com.biblio.backend.service;

import com.biblio.backend.dto.StatistiquesDTO;
import com.biblio.backend.model.Article;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ProjectArticleRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatistiquesService {

    private final ProjectArticleRepository projectArticleRepository;

    public StatistiquesService(
            ProjectArticleRepository projectArticleRepository) {
        this.projectArticleRepository = projectArticleRepository;
    }

    public StatistiquesDTO getStatistiques(Long projectId) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProject_Id(projectId);

        StatistiquesDTO dto = new StatistiquesDTO();

        // Stats globales
        dto.setTotalArticles(list.size());
        dto.setTotalRetenus((int) list.stream()
                .filter(pa -> pa.getStatut() ==
                        ProjectArticle.Statut.RETENU).count());
        dto.setTotalExclus((int) list.stream()
                .filter(pa -> pa.getStatut() ==
                        ProjectArticle.Statut.EXCLU).count());
        dto.setTotalALire((int) list.stream()
                .filter(pa -> pa.getStatut() ==
                        ProjectArticle.Statut.A_LIRE).count());
        dto.setTotalDoublons((int) list.stream()
                .filter(pa -> pa.getStatut() ==
                        ProjectArticle.Statut.DOUBLON).count());

        // Publications par année
        Map<Integer, Long> byYear = list.stream()
                .map(pa -> pa.getArticle().getAnnee())
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        y -> y, Collectors.counting()));
        dto.setArticlesByYear(new TreeMap<>(byYear));

        // Répartition par statut
        Map<String, Long> byStatut = list.stream()
                .collect(Collectors.groupingBy(
                        pa -> pa.getStatut().name(),
                        Collectors.counting()));
        dto.setArticlesByStatut(byStatut);

        // Top auteurs
        Map<String, Long> auteurCount = new HashMap<>();
        for (ProjectArticle pa : list) {
            String auteurs = pa.getArticle().getAuteurs();
            if (auteurs == null || auteurs.isEmpty()) continue;
            for (String auteur : auteurs.split(",")) {
                String name = auteur.trim();
                if (!name.isEmpty()) {
                    auteurCount.merge(name, 1L, Long::sum);
                }
            }
        }

        List<Map<String, Object>> topAuteurs = auteurCount.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>
                        comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("name", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        dto.setTopAuteurs(topAuteurs);

        //Top articles par citations
        List<StatistiquesDTO.TopArticleDTO> topArticles = list.stream()
                .map(ProjectArticle::getArticle)
                .filter(a -> a.getNbCitations() != null
                        && a.getNbCitations() > 0)
                .sorted(Comparator.comparing(
                        Article::getNbCitations).reversed())
                .limit(5)
                .map(a -> new StatistiquesDTO.TopArticleDTO(
                        a.getTitre(),
                        a.getAuteurs(),
                        a.getAnnee(),
                        a.getNbCitations(),
                        a.getUrl()))
                .collect(Collectors.toList());
        dto.setTopArticlesByCitations(topArticles);

        return dto;
    }
}