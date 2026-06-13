package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity(name = "AdminUser")
@Table(name = "utilisateur")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String profil;

    private String motDePasse;

    @Builder.Default
    private Boolean emailVerified = true;

    private LocalDate dateInscription;

    @Column(name = "statut", length = 20)
    @Builder.Default
    private String statut = "ACTIF";

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}