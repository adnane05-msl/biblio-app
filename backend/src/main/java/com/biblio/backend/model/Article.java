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

    @Column(nullable = false)
    private String titre;

    @Column(length = 100)
    private String auteurs;

    private Integer annee;

    private String doi;

    @Column(length = 5000)
    private String resume;

    private String url;

    @Column(name = "nb_citations")
    private Integer nbCitations;

    @Column(name = "mot_cles")
    private String motCles;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL)
    private List<ProjectArticle> projectArticles = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "id_source")
    private Source source;

    @OneToMany(mappedBy = "article")
    private List<Historique> historiques = new ArrayList<>();
}
