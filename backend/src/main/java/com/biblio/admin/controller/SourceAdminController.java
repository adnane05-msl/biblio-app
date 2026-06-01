package com.biblio.admin.controller;

import com.biblio.admin.dto.SourceDto;
import com.biblio.admin.model.AdminSource;
import com.biblio.admin.service.SourceAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sources")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SourceAdminController {

    private final SourceAdminService sourceAdminService;

    @GetMapping
    public ResponseEntity<List<SourceDto.Response>> findAll() {
        return ResponseEntity.ok(sourceAdminService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SourceDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(sourceAdminService.findById(id));
    }

    @PostMapping
    public ResponseEntity<SourceDto.Response> create(@Valid @RequestBody SourceDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sourceAdminService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SourceDto.Response> update(
            @PathVariable Long id,
            @RequestBody SourceDto.UpdateRequest req) {
        return ResponseEntity.ok(sourceAdminService.update(id, req));
    }

    @PostMapping("/{id}/rafraichir")
    public ResponseEntity<SourceDto.Response> rafraichir(@PathVariable Long id) {
        return ResponseEntity.ok(sourceAdminService.rafraichir(id));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<SourceDto.Response> changerStatut(
            @PathVariable Long id,
            @RequestParam AdminSource.StatutSource statut) {
        return ResponseEntity.ok(sourceAdminService.changerStatut(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        sourceAdminService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}