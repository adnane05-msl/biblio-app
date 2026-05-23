package com.biblio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchSaveResult {
    private int total;
    private int saved;
//    private int existing;
    private int failed;
    private List<String> errors;
}