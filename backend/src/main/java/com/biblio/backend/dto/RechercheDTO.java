// dto/RechercheDTO.java
package com.biblio.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RechercheDTO {
    private Long id;
    private String requete;
    private LocalDateTime dateRecherche;
    private Integer nbResultats;
}