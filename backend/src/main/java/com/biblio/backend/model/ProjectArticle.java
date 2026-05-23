package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "article_projet",
        // CORRECTION : contrainte unique en base pour bloquer les doublons même en cas de
        // race condition (deux requêtes simultanées pour le même article+projet)
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_project_article",
                        columnNames = {"id_projet", "id_article"}
                )
        }
)
public class ProjectArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_projet", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "id_article", nullable = false)
    private Article article;

    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.A_LIRE;

    @Column(length = 1000)
    private String note;

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout;

    @PrePersist
    public void prePersist() {
        if (this.dateAjout == null) {
            this.dateAjout = LocalDateTime.now();
        }
    }

    public enum Statut {
        A_LIRE,
        RETENU,
        EXCLU,
        DOUBLON
    }
}