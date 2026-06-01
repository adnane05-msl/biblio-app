package com.biblio.admin.dto;

import com.biblio.admin.model.AdminUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserDto {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Le nom est obligatoire")
        private String nom;
        @Email @NotBlank
        private String email;
        @NotBlank
        private String motDePasse;
        @Builder.Default
        private String role = "ROLE_USER";
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private String nom;
        private String email;
        private String role;
        private AdminUser.Statut statut;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String nom;
        private String email;
        private String role;
        private AdminUser.Statut statut;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;

        public static Response from(AdminUser u) {
            return Response.builder()
                    .id(u.getId())
                    .nom(u.getNom())
                    .email(u.getEmail())
                    .role(u.getRole())
                    .statut(u.getStatut())
                    .createdAt(u.getCreatedAt())
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