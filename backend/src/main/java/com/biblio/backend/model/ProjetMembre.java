package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Table de liaison entre un Projet et un Utilisateur collaborateur.
 * Un projet peut avoir plusieurs membres avec des rôles différents.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "projet_membre",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_projet", "id_utilisateur"})
)
public class ProjetMembre {

    public enum Role {
        PROPRIETAIRE,   // créateur du projet — ne peut pas être retiré
        EDITEUR,        // peut ajouter/modifier/annoter des articles
        LECTEUR         // consultation uniquement
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_projet", nullable = false)
    private Project projet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.EDITEUR;

    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.dateAjout == null) {
            this.dateAjout = LocalDateTime.now();
        }
    }
}