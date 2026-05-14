package com.biblio.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfilRequest {
    private String nom;
    private String prenom;
    private String profil;
    private LocalDate dateInscription;
}