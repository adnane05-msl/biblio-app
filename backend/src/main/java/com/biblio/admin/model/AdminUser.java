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

    // ── Champs partagés avec Utilisateur.java ──────────────────
    // AUCUN @Column → Hibernate utilise la même convention camelCase → snake_case
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String profil;

    // ── Colonnes admin uniquement ──────────────────────────────
    @Column(name = "statut", length = 20)
    @Builder.Default
    private String statut = "ACTIF";

    // ✅ SANS @Column : Hibernate convertit dateInscription → date_inscription
    // automatiquement, identique à Utilisateur.java → pas de conflit
    private LocalDate dateInscription;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}