package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Correction : length augmenté de façon à éviter toute troncature silencieuse
    @Column(nullable = false, length = 2000)
    private String titre;

    // Correction : était 100 → troncature causait des faux-positifs dans findByTitre/findByDoi
    @Column(length = 2000)
    private String auteurs;

    private Integer annee;

    // Correction : length explicite pour les DOI longs
    @Column(length = 500)
    private String doi;

    @Column(length = 5000)
    private String resume;

    @Column(length = 2000)
    private String url;

    @Column(name = "nb_citations")
    private Integer nbCitations;

    @Column(name = "mot_cles", length = 1000)
    private String motCles;

    // Correction : journal et source ajoutés au modèle pour éviter la perte d'info
    @Column(length = 500)
    private String journal;

    @Column(length = 100)
    private String documentType;

    @Column(length = 100)
    private String sourceNom;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL)
    private List<ProjectArticle> projectArticles = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "id_source")
    private Source source;

    @OneToMany(mappedBy = "article")
    private List<Historique> historiques = new ArrayList<>();
}