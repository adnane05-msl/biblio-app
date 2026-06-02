package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
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
    // AUCUN @Column → Hibernate utilise la même convention que Utilisateur.java
    // Pas de motDePasse : inutile dans l'admin + cause le conflit
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String profil;

    // ── Colonnes nouvelles uniquement ──────────────────────────
    @Column(name = "statut", length = 20)
    @Builder.Default
    private String statut = "ACTIF";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}