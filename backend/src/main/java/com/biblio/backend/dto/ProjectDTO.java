package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDTO {
    private Long id;
    private String nomProjet;
    private String description;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private int nombreArticles;
}
