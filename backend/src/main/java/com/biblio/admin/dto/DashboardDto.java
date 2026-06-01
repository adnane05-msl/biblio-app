package com.biblio.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardDto {
    private long totalUtilisateurs;
    private long utilisateursActifs;
    private long sourcesEnLigne;
    private long totalSources;
    private long erreursAujourdhui;
    private double uptimePct;
    private String versionBackend;
    private String versionFrontend;
    private List<SourceDto.Response> sourcesSummary;
    private List<UserDto.Response> derniersInscrits;
}