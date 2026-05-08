package com.biblio.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExportRequest {
    private Long projetId;
    private List<Long> articleIds;
    private String format;
}