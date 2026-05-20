// entity/Source.java
package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "source")
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nomSource;  // les sources: "Crossref", "OpenAlex", "arXiv"

    @Column(name = "url_api")
    private String urlApi;     // URL de L'API

    private Boolean active = true;  // Source Activée ou non

    @Column(name = "date_ajout")
    private LocalDateTime dateAjout = LocalDateTime.now();

    @OneToMany(mappedBy = "source")
    private List<Article> articles = new ArrayList<>();
}
