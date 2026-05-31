package com.biblio.admin.controller;

import com.biblio.admin.dto.SourceDto;
import com.biblio.admin.model.Source;
import com.biblio.admin.service.SourceAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST pour la supervision des sources académiques.
 * Base URL : /api/admin/sources
 */
@RestController
@RequestMapping("/api/admin/sources")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
public class SourceAdminController {

    private final SourceAdminService sourceAdminService;

    /** GET /api/admin/sources */
    @GetMapping
    public ResponseEntity<List<SourceDto.Response>> findAll() {
        return ResponseEntity.ok(sourceAdminService.findAll());
    }

    /** GET /api/admin/sources/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<SourceDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sourceAdminService.findById(id));
    }

    /** POST /api/admin/sources */
    @PostMapping
    public ResponseEntity<SourceDto.Response> create(
            @Valid @RequestBody SourceDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sourceAdminService.create(req));
    }

    /** PUT /api/admin/sources/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<SourceDto.Response> update(
            @PathVariable Long id,
            @RequestBody SourceDto.UpdateRequest req) {
        return ResponseEntity.ok(sourceAdminService.update(id, req));
    }

    /** POST /api/admin/sources/{id}/rafraichir — test de connectivité + synchro */
    @PostMapping("/{id}/rafraichir")
    public ResponseEntity<SourceDto.Response> rafraichir(@PathVariable Long id) {
        return ResponseEntity.ok(sourceAdminService.rafraichir(id));
    }

    /** PATCH /api/admin/sources/{id}/statut */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<SourceDto.Response> changerStatut(
            @PathVariable Long id,
            @RequestParam Source.StatutSource statut) {
        return ResponseEntity.ok(sourceAdminService.changerStatut(id, statut));
    }

    /** DELETE /api/admin/sources/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        sourceAdminService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}