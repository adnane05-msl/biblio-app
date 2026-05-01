// dto/SourceDTO.java
package com.biblio.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SourceDTO {
    private Long id;
    private String nomSource;
    private String urlApi;
    private Boolean active;
}
