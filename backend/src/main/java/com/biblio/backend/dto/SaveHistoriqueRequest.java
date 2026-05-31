// dto/SaveHistoriqueRequest.java
package com.biblio.backend.dto;

import lombok.Data;

@Data
public class SaveHistoriqueRequest {
    private Long userId;
    private String query;
    private Integer nbResultats;
    private String resultatsJson;
}