package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrismaDTO {
    // Étape 1: Recherche
    private int totalRecherche;           // Résultats de la recherche API

    // Étape 2: Sauvegarde
    private int totalSauvegardes;         // Articles sauvegardés dans le projet

    // Étape 3: Analyse
    private int totalDoublons;             // Doublons détectés
    private int totalExclus;               // Articles exclus
    private int totalRetenus;              // Articles retenus
    private int totalALire;                // Encore à lire

    // Détails
    private int apresDeduplication;        // Après suppression doublons
}