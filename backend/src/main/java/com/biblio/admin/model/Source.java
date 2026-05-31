package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité représentant une source académique externe connectée.
 * Ex : Semantic Scholar, OpenAlex, CrossRef
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sources")
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 500)
    private String urlBase;

    @Column(length = 50)
    private String typeApi; // REST, GraphQL, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutSource statut = StatutSource.EN_LIGNE;

    @Column(name = "latence_ms")
    private Integer latenceMs;

    @Column(name = "requetes_jour")
    private Integer requetesJour;

    @Column(name = "limite_requetes")
    private Integer limiteRequetes; // null = illimité

    @Column(name = "disponibilite_pct")
    private Double disponibilitePct;

    @Column(name = "derniere_synchro")
    private LocalDateTime derniereSynchro;

    @Column(name = "cle_api", length = 500)
    private String cleApi; // optionnel, stocké chiffré

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum StatutSource {
        EN_LIGNE,
        HORS_LIGNE,
        LATENCE_ELEVEE,
        MAINTENANCE
    }
}