package com.biblio.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO retourné au frontend pour afficher un membre d'un projet.
 */
public class MembreDTO {

    private Long id;               // id de la ligne ProjetMembre
    private Long utilisateurId;
    private String nom;
    private String prenom;
    private String email;
    private String profil;
    private String role;           // PROPRIETAIRE | EDITEUR | LECTEUR
    private LocalDateTime dateAjout;

    // ── Constructeurs ─────────────────────────────────────────────────────────

    public MembreDTO() {}

    public MembreDTO(Long id, Long utilisateurId, String nom, String prenom,
                     String email, String profil, String role, LocalDateTime dateAjout) {
        this.id = id;
        this.utilisateurId = utilisateurId;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.profil = profil;
        this.role = role;
        this.dateAjout = dateAjout;
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfil() { return profil; }
    public void setProfil(String profil) { this.profil = profil; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getDateAjout() { return dateAjout; }
    public void setDateAjout(LocalDateTime dateAjout) { this.dateAjout = dateAjout; }
}