package com.biblio.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BatchSaveRequest {
    private Long projectId;
    private List<SaveArticleRequest> articles;
}