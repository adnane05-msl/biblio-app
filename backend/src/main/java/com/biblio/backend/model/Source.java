package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité Source utilisée par le module de recherche bibliographique.
 * Distinct de com.biblio.admin.model.Source (supervision admin).
 * Le nom JPA "SourceSearch" évite le conflit Hibernate.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "SourceSearch")   // ← nom JPA unique, évite DuplicateMappingException
@Table(name = "source")          // ← table SQL inchangée
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nomSource;

    @Column(name = "url_api")
    private String urlApi;

    private Boolean active = true;

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout = LocalDateTime.now();

    @OneToMany(mappedBy = "source")
    private List<Article> articles = new ArrayList<>();
}