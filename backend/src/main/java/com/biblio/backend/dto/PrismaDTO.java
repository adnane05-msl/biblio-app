package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrismaDTO {
    private int totalRecherche;

    private int totalSauvegardes;

    private int totalDoublons;
    private int totalExclus;
    private int totalRetenus;
    private int totalALire;

    private int apresDeduplication;
}