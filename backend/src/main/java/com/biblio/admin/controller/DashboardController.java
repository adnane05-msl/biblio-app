package com.biblio.admin.controller;

import com.biblio.admin.dto.DashboardDto;
import com.biblio.admin.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** GET /api/admin/dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    /** POST /api/admin/maintenance/vider-cache */
    @PostMapping("/maintenance/vider-cache")
    public ResponseEntity<String> viderCache() {
        return ResponseEntity.ok("Cache vidé avec succès");
    }

    /** POST /api/admin/maintenance/reinitialiser-sessions */
    @PostMapping("/maintenance/reinitialiser-sessions")
    public ResponseEntity<String> reinitialiserSessions() {
        return ResponseEntity.ok("Sessions réinitialisées");
    }

    /** GET /api/admin/logs — retourne une liste vide pour l'instant */
    @GetMapping("/logs")
    public ResponseEntity<?> getLogs() {
        return ResponseEntity.ok(java.util.List.of());
    }
}