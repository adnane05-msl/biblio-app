// entity/Historique.java
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
@Table(name = "historique")
public class Historique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mots_cles", length = 500)
    private String motsCles;

    @Column(name = "date_selection")
    private LocalDateTime dateSelection = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_article", nullable = false)
    private Article article;
}