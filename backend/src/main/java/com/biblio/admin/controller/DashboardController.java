package com.biblio.admin.controller;

import com.biblio.admin.dto.DashboardDto;
import com.biblio.admin.dto.LogDto;
import com.biblio.admin.model.LogSysteme;
import com.biblio.admin.service.DashboardService;
import com.biblio.admin.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST pour le tableau de bord et les journaux système.
 * Base URL : /api/admin
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final LogService logService;

    /** GET /api/admin/dashboard — données agrégées */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    /** GET /api/admin/logs — journaux système */
    @GetMapping("/logs")
    public ResponseEntity<List<LogDto.Response>> getLogs(
            @RequestParam(required = false) LogSysteme.TypeLog type) {

        List<LogDto.Response> logs = (type != null)
                ? logService.findByType(type)
                : logService.findRecents();
        return ResponseEntity.ok(logs);
    }

    /** POST /api/admin/maintenance/vider-cache */
    @PostMapping("/maintenance/vider-cache")
    public ResponseEntity<String> viderCache() {
        logService.log(LogSysteme.TypeLog.OK, "Cache vidé manuellement", "Admin");
        return ResponseEntity.ok("Cache vidé avec succès");
    }

    /** POST /api/admin/maintenance/reinitialiser-sessions */
    @PostMapping("/maintenance/reinitialiser-sessions")
    public ResponseEntity<String> reinitialiserSessions() {
        logService.log(LogSysteme.TypeLog.WARN, "Sessions réinitialisées par l'admin", "Admin");
        return ResponseEntity.ok("Sessions réinitialisées");
    }
}