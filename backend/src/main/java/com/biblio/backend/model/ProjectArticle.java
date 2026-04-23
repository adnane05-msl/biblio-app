package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "article_projet")
public class ProjectArticle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_projet", nullable = false)
    private Project projet;

    @ManyToOne
    @JoinColumn(name = "id_article", nullable = false)
    private Article article;

    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.A_LIRE;

    @Column(length = 1000)
    private String note;

    @Column(name = "raison_exclusion")
    private String raisonExclusion;

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout = LocalDateTime.now();

    public enum Statut {
        A_LIRE,
        RETENU,
        EXCLU,
        DOUBLON
    }
}
