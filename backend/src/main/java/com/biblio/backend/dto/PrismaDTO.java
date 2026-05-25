package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrismaDTO {
    private int totalIdentifies;
    private int totalDoublons;
    private int apresDeduplication;
    private int totalExclus;
    private int totalRetenus;
    private int totalALire;
}