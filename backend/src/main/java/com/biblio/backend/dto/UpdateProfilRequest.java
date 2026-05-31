package com.biblio.backend.dto;

import lombok.Data;

@Data
public class UpdateProfilRequest {
    private String nom;
    private String prenom;
    private String profil;
}