package com.biblio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO pour les métriques globales du tableau de bord admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDto {

    private long totalUtilisateurs;
    private long utilisateursActifs;
    private long sourcesEnLigne;
    private long totalSources;
    private long totalArticles;
    private long erreursAujourdhui;
    private double uptimePct;
    private String versionBackend;
    private String versionFrontend;

    private List<SourceDto.Response> sourcesSummary;
    private List<LogDto.Response> logsRecents;
    private List<UserDto.Response> derniersInscrits;
}