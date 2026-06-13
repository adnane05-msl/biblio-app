package com.biblio.admin.dto;

import com.biblio.admin.model.AdminUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDto {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {

        @NotBlank(message = "Le nom est obligatoire")
        private String nom;

        @Email(message = "Email invalide")
        @NotBlank(message = "L'email est obligatoire")
        private String email;

        // ── NOUVEAU : mot de passe obligatoire pour que l'utilisateur
        //    créé par l'admin puisse se connecter ────────────────────
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
        private String motDePasse;

        @Builder.Default
        private String role = "ROLE_USER";

        // ── NOUVEAU : statut envoyé par le formulaire (ACTIF / INACTIF)
        @Builder.Default
        private String statut = "ACTIF";
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private String nom;
        private String email;
        private String role;
        private String statut;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String nom;
        private String email;
        private String role;
        private String statut;
        private LocalDate dateInscription;
        private LocalDateTime lastLogin;

        public static Response from(AdminUser u) {
            return Response.builder()
                    .id(u.getId())
                    .nom(u.getNom())
                    .email(u.getEmail())
                    .role(u.getRole() != null ? u.getRole() : "ROLE_USER")
                    .statut(u.getStatut() != null ? u.getStatut() : "ACTIF")
                    .dateInscription(u.getDateInscription())
                    .lastLogin(u.getLastLogin())
                    .build();
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Stats {
        private long total;
        private long actifs;
        private long inactifs;
        private long admins;
    }
}