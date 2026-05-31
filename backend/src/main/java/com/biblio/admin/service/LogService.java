package com.biblio.admin.service;

import com.biblio.admin.dto.LogDto;
import com.biblio.admin.model.LogSysteme;
import com.biblio.admin.repository.LogSystemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion du journal système.
 * Utilisé par tous les autres services pour tracer les événements.
 */
@Service
@RequiredArgsConstructor
public class LogService {

    private final LogSystemeRepository logRepository;

    // ── Enregistrer un log ────────────────────────────────────────────────────
    public void log(LogSysteme.TypeLog type, String message, String composant) {
        LogSysteme log = LogSysteme.builder()
                .type(type)
                .message(message)
                .composant(composant)
                .build();
        logRepository.save(log);
    }

    // ── Récupérer les 50 derniers ─────────────────────────────────────────────
    public List<LogDto.Response> findRecents() {
        return logRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(LogDto.Response::from)
                .collect(Collectors.toList());
    }

    // ── Filtrer par type ──────────────────────────────────────────────────────
    public List<LogDto.Response> findByType(LogSysteme.TypeLog type) {
        return logRepository.findByType(type)
                .stream()
                .map(LogDto.Response::from)
                .collect(Collectors.toList());
    }

    // ── Logs des dernières 24h ────────────────────────────────────────────────
    public List<LogDto.Response> findDernieres24h() {
        LocalDateTime hier = LocalDateTime.now().minusHours(24);
        return logRepository.findDepuis(hier)
                .stream()
                .map(LogDto.Response::from)
                .collect(Collectors.toList());
    }

    // ── Compter les erreurs aujourd'hui ───────────────────────────────────────
    public long countErreursAujourdhui() {
        LocalDateTime debutJour = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        return logRepository.countByTypeAndCreatedAtAfter(LogSysteme.TypeLog.ERROR, debutJour);
    }
}