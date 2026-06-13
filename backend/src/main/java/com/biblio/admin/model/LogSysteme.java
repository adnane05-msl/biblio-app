package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "logs_systeme")
public class LogSysteme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TypeLog type;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 200)
    private String composant;

    @Column(length = 100)
    private String ipSource;


    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TypeLog {
        INFO,
        WARN,
        OK
    }
}