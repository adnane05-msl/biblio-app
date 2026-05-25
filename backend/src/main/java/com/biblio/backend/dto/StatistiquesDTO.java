package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesDTO {

    private int totalArticles;
    private int totalRetenus;
    private int totalExclus;
    private int totalALire;
    private int totalDoublons;

    private Map<Integer, Long> articlesByYear;
    private Map<String, Long> articlesByStatut;

    // ← Type corrigé
    private List<Map<String, Object>> topAuteurs;

    private List<TopArticleDTO> topArticlesByCitations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopArticleDTO {
        private String titre;
        private String auteurs;
        private Integer annee;
        private Integer citations;
        private String url;
    }
}