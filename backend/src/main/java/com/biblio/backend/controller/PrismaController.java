package com.biblio.backend.controller;

import com.biblio.backend.dto.PrismaDTO;
import com.biblio.backend.service.PrismaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class PrismaController {

    private final PrismaService prismaService;

    public PrismaController(PrismaService prismaService) {
        this.prismaService = prismaService;
    }

    @GetMapping("/prisma/{projectId}")
    public ResponseEntity<PrismaDTO> getPrisma(@PathVariable Long projectId) {
        return ResponseEntity.ok(prismaService.getPrisma(projectId));
    }
}
