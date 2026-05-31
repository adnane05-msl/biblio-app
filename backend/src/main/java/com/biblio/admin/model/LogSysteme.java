package com.biblio.admin.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Journal système : trace toutes les actions importantes de l'application.
 */
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
    private TypeLog type; // INFO, WARN, ERROR, OK

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 200)
    private String composant; // Ex: "CrossRef", "Auth", "DB"

    @Column(length = 100)
    private String ipSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // peut être null (action système)

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TypeLog {
        INFO,
        WARN,
        ERROR,
        OK
    }
}