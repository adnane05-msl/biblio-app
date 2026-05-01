package com.biblio.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "utilisateur")
@Data
@NoArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 25)
    private String nom;

    @Column(nullable = false, length = 25)
    private String prenom;

    @Column(nullable = false, unique = true, length = 50)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Column(length = 10)
    private String role = "USER";

    @Column(length = 50)
    private String specialite;

    @Column
    private LocalDate dateInscription = LocalDate.now();

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    private List<Recherche> recherches = new ArrayList<>();

}