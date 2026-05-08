package com.biblio.backend.controller;

import com.biblio.backend.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    // Export BibTeX
    @GetMapping("/bibtex/{projectId}")
    public ResponseEntity<byte[]> exportBibtex(
            @PathVariable Long projectId) {

        String content = exportService.exportBibtex(projectId);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"references.bib\"")
                .contentType(MediaType.parseMediaType(
                        "application/x-bibtex"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    // Export CSV
    @GetMapping("/csv/{projectId}")
    public ResponseEntity<byte[]> exportCsv(
            @PathVariable Long projectId) {

        String content = exportService.exportCsv(projectId);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"articles.csv\"")
                .contentType(MediaType.parseMediaType(
                        "text/csv; charset=UTF-8"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    // Export RIS
    @GetMapping("/ris/{projectId}")
    public ResponseEntity<byte[]> exportRis(
            @PathVariable Long projectId) {

        String content = exportService.exportRis(projectId);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"references.ris\"")
                .contentType(MediaType.parseMediaType(
                        "application/x-research-info-systems"))
                .contentLength(bytes.length)
                .body(bytes);
    }
}
