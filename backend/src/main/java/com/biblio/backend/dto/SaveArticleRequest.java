package com.biblio.backend.dto;

import lombok.Data;

@Data
public class SaveArticleRequest {
    private Long projectId;
    private String titre;
    private String auteurs;
    private Integer annee;
    private String doi;
    private String resume;
    private String url;
    private Integer nbCitations;
    private String source;
    private String journal;
    private String documentType;
}