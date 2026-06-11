package com.biblio.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Corps de la requête POST /api/collaboration/{projetId}/inviter
 */
public class InvitationRequest {

    @NotNull(message = "L'ID du projet est obligatoire")
    private Long projetId;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le rôle est obligatoire")
    private String role;   // "EDITEUR" ou "LECTEUR"

    public Long getProjetId() { return projetId; }
    public void setProjetId(Long projetId) { this.projetId = projetId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}