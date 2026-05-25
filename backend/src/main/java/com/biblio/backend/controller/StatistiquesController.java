package com.biblio.backend.controller;

import com.biblio.backend.dto.StatistiquesDTO;
import com.biblio.backend.service.StatistiquesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistiques")
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    public StatistiquesController(StatistiquesService statistiquesService) {
        this.statistiquesService = statistiquesService;
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<StatistiquesDTO> getStatistiques(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(
                statistiquesService.getStatistiques(projectId));
    }
}
