package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Projet")
public class Project {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String nomProjet;

    @Column(length = 100)
    private String description;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation =  LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification =   LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL)
    private List<ProjectArticle> projectArticles = new ArrayList<>();


}
