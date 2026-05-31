package com.biblio.admin.dto;

import com.biblio.admin.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTOs pour la gestion des utilisateurs côté admin.
 */
public class UserDto {

    // ──────────────────────────────────────────
    // Requête : création d'un utilisateur
    // ──────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotBlank(message = "Le nom est obligatoire")
        private String nom;

        @Email(message = "Email invalide")
        @NotBlank(message = "L'email est obligatoire")
        private String email;

        @NotBlank(message = "Le mot de passe est obligatoire")
        private String motDePasse;

        @NotNull(message = "Le rôle est obligatoire")
        private User.Role role;
    }

    // ──────────────────────────────────────────
    // Requête : mise à jour d'un utilisateur
    // ──────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String nom;
        private String email;
        private User.Role role;
        private User.Statut statut;
    }

    // ──────────────────────────────────────────
    // Réponse : données utilisateur exposées
    // ──────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String nom;
        private String email;
        private User.Role role;
        private User.Statut statut;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
        private int nombreProjets;

        public static Response from(User user) {
            return Response.builder()
                    .id(user.getId())
                    .nom(user.getNom())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .statut(user.getStatut())
                    .createdAt(user.getCreatedAt())
                    .lastLogin(user.getLastLogin())
                    .nombreProjets(user.getProjets() != null ? user.getProjets().size() : 0)
                    .build();
        }
    }

    // ──────────────────────────────────────────
    // Réponse : métriques globales dashboard
    // ──────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Stats {
        private long total;
        private long actifs;
        private long inactifs;
        private long admins;
    }
}