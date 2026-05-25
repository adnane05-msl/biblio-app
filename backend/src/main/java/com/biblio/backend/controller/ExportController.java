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

    @GetMapping("/bibtex/{projectId}")
    public ResponseEntity<byte[]> exportBibtex(
            @PathVariable Long projectId,
            @RequestParam(name = "statut", required = false, defaultValue = "TOUS") String statut) {

        System.out.println("=== EXPORT BIBTEX — projectId=" + projectId + " statut=" + statut + " ===");
        String content = exportService.exportBibtex(projectId, statut);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        String filename = buildFilename("references", statut, "bib");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/x-bibtex"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    @GetMapping("/csv/{projectId}")
    public ResponseEntity<byte[]> exportCsv(
            @PathVariable Long projectId,
            @RequestParam(name = "statut", required = false, defaultValue = "TOUS") String statut) {

        System.out.println("=== EXPORT CSV — projectId=" + projectId + " statut=" + statut + " ===");
        String content = exportService.exportCsv(projectId, statut);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        String filename = buildFilename("articles", statut, "csv");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    @GetMapping("/ris/{projectId}")
    public ResponseEntity<byte[]> exportRis(
            @PathVariable Long projectId,
            @RequestParam(name = "statut", required = false, defaultValue = "TOUS") String statut) {

        System.out.println("=== EXPORT RIS — projectId=" + projectId + " statut=" + statut + " ===");
        String content = exportService.exportRis(projectId, statut);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        String filename = buildFilename("references", statut, "ris");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/x-research-info-systems"))
                .contentLength(bytes.length)
                .body(bytes);
    }

    private String buildFilename(String base, String statut, String extension) {
        if (statut == null || statut.isBlank() || statut.equalsIgnoreCase("TOUS")) {
            return base + "." + extension;
        }
        return base + "_" + statut.toLowerCase() + "." + extension;
    }
}