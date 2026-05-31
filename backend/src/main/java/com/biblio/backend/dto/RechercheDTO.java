// dto/RechercheDTO.java
package com.biblio.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RechercheDTO {
    private Long id;
    private String requete;
    private LocalDateTime dateRecherche;
    private Integer nbResultats;
    private String resultatsJson;
}