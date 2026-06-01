package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue admin sur les utilisateurs.
 * Mappe sur la même table "utilisateurs" que com.biblio.backend.model.Utilisateur
 * mais avec un nom JPA distinct pour éviter le conflit Hibernate.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity(name = "AdminUser")        // ← nom JPA unique
@Table(name = "utilisateurs")      // ← même table que Utilisateur backend
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    @Column(nullable = false)
    @Builder.Default
    private String role = "ROLE_USER";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Statut statut = Statut.ACTIF;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    public enum Statut {
        ACTIF, INACTIF, SUSPENDU
    }
}