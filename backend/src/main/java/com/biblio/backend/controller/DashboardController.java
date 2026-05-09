package com.biblio.backend.controller;

import com.biblio.backend.dto.DashboardDTO;
import com.biblio.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<DashboardDTO> getDashboard(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(
                dashboardService.getDashboard(projectId));
    }
}
