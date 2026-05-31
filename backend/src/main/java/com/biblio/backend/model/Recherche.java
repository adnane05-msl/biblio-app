// model/Recherche.java
package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recherche")
public class Recherche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String requete;

    @Column(name = "date_recherche")
    private LocalDateTime dateRecherche = LocalDateTime.now();

    @Column(name = "nb_resultats")
    private Integer nbResultats;

    @Column(name = "resultats_json", columnDefinition = "TEXT")
    private String resultatsJson;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;
}