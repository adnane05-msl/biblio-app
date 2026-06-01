package com.biblio.admin.dto;

import com.biblio.admin.model.AdminSource;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SourceDto {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Le nom est obligatoire")
        private String nom;
        @NotBlank(message = "L'URL de base est obligatoire")
        private String urlBase;
        private String typeApi;
        private Integer limiteRequetes;
        private String cleApi;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateRequest {
        private String nom;
        private String urlBase;
        private String typeApi;
        private AdminSource.StatutSource statut;
        private Integer limiteRequetes;
        private String cleApi;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String nom;
        private String urlBase;
        private String typeApi;
        private AdminSource.StatutSource statut;
        private Integer latenceMs;
        private Integer requetesJour;
        private Integer limiteRequetes;
        private Double disponibilitePct;
        private LocalDateTime derniereSynchro;

        public static Response from(AdminSource s) {
            return Response.builder()
                    .id(s.getId())
                    .nom(s.getNom())
                    .urlBase(s.getUrlBase())
                    .typeApi(s.getTypeApi())
                    .statut(s.getStatut())
                    .latenceMs(s.getLatenceMs())
                    .requetesJour(s.getRequetesJour())
                    .limiteRequetes(s.getLimiteRequetes())
                    .disponibilitePct(s.getDisponibilitePct())
                    .derniereSynchro(s.getDerniereSynchro())
                    .build();
        }
    }
}