package com.biblio.admin.controller;

import com.biblio.admin.dto.UserDto;
import com.biblio.admin.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST pour la gestion des utilisateurs (admin uniquement).
 * Base URL : /api/admin/users
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    /** GET /api/admin/users — liste tous les utilisateurs */
    @GetMapping
    public ResponseEntity<List<UserDto.Response>> findAll(
            @RequestParam(required = false) String q) {

        List<UserDto.Response> result = (q != null && !q.isBlank())
                ? userAdminService.search(q)
                : userAdminService.findAll();
        return ResponseEntity.ok(result);
    }

    /** GET /api/admin/users/stats — métriques */
    @GetMapping("/stats")
    public ResponseEntity<UserDto.Stats> getStats() {
        return ResponseEntity.ok(userAdminService.getStats());
    }

    /** GET /api/admin/users/{id} — détail d'un utilisateur */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userAdminService.findById(id));
    }

    /** POST /api/admin/users — créer un utilisateur */
    @PostMapping
    public ResponseEntity<UserDto.Response> create(
            @Valid @RequestBody UserDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userAdminService.create(req));
    }

    /** PUT /api/admin/users/{id} — modifier un utilisateur */
    @PutMapping("/{id}")
    public ResponseEntity<UserDto.Response> update(
            @PathVariable Long id,
            @RequestBody UserDto.UpdateRequest req) {
        return ResponseEntity.ok(userAdminService.update(id, req));
    }

    /** PATCH /api/admin/users/{id}/desactiver — désactiver (soft delete) */
    @PatchMapping("/{id}/desactiver")
    public ResponseEntity<Void> desactiver(@PathVariable Long id) {
        userAdminService.desactiver(id);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/admin/users/{id} — suppression définitive */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        userAdminService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}