package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité Source du module ADMIN - supervision des sources académiques.
 * Table SQL : "admin_sources" (renommée pour éviter tout conflit avec "source").
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity(name = "AdminSource")      // ← nom JPA unique
@Table(name = "admin_sources")     // ← table SQL dédiée admin
public class AdminSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 500)
    private String urlBase;

    @Column(length = 50)
    private String typeApi;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutSource statut = StatutSource.EN_LIGNE;

    @Column(name = "latence_ms")
    private Integer latenceMs;

    @Column(name = "requetes_jour")
    private Integer requetesJour;

    @Column(name = "limite_requetes")
    private Integer limiteRequetes;

    @Column(name = "disponibilite_pct")
    private Double disponibilitePct;

    @Column(name = "derniere_synchro")
    private LocalDateTime derniereSynchro;

    @Column(name = "cle_api", length = 500)
    private String cleApi;

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