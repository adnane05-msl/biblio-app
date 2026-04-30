package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDTO {
    private String title;
    private String authors;
    private String year;
    private String journal;
    private String publisher;
    private String doi;
    private String abstractText;
    private String documentType;
    private Integer citations;
    private String source;
    private String url;
}