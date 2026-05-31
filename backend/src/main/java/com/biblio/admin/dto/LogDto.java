package com.biblio.admin.dto;

import com.biblio.admin.model.LogSysteme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour les journaux système.
 */
public class LogDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private LogSysteme.TypeLog type;
        private String message;
        private String composant;
        private String ipSource;
        private String userEmail;
        private LocalDateTime createdAt;

        public static Response from(LogSysteme log) {
            return Response.builder()
                    .id(log.getId())
                    .type(log.getType())
                    .message(log.getMessage())
                    .composant(log.getComposant())
                    .ipSource(log.getIpSource())
                    .userEmail(log.getUser() != null ? log.getUser().getEmail() : null)
                    .createdAt(log.getCreatedAt())
                    .build();
        }
    }
}