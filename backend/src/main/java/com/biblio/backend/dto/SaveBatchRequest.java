package com.biblio.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class SaveBatchRequest {
    private Long projectId;
    private Integer totalRecherche;
    private List<SaveArticleRequest> articles;
}