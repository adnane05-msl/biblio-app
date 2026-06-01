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

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    public ResponseEntity<List<UserDto.Response>> findAll(
            @RequestParam(required = false) String q) {
        List<UserDto.Response> result = (q != null && !q.isBlank())
                ? userAdminService.search(q)
                : userAdminService.findAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<UserDto.Stats> getStats() {
        return ResponseEntity.ok(userAdminService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userAdminService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserDto.Response> create(@Valid @RequestBody UserDto.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userAdminService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto.Response> update(
            @PathVariable Long id,
            @RequestBody UserDto.UpdateRequest req) {
        return ResponseEntity.ok(userAdminService.update(id, req));
    }

    @PatchMapping("/{id}/desactiver")
    public ResponseEntity<Void> desactiver(@PathVariable Long id) {
        userAdminService.desactiver(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        userAdminService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}