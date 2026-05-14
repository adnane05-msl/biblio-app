package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectArticleDTO {
    private Long id;
    private Long articleId;
    private String titre;
    private String auteurs;
    private Integer annee;
    private String doi;
    private String resume;
    private String url;
    private Integer nbCitations;
    private String source;
    private String journal;
    private String statut;
    private String note;
    private LocalDateTime dateAjout;
}
