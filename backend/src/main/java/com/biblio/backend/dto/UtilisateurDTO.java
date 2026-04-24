package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UtilisateurDTO {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String role;
}
