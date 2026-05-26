package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrismaDTO {
    private int totalRecherche;           // Résultats de la recherche API

    private int totalSauvegardes;         // Articles sauvegardés dans le projet

    private int totalDoublons;             // Doublons détectés
    private int totalExclus;               // Articles exclus
    private int totalRetenus;              // Articles retenus
    private int totalALire;                // Encore à lire

    private int apresDeduplication;        // Après suppression doublons
}