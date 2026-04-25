package com.biblio.backend.controller;

import com.biblio.backend.dto.LoginRequest;
import com.biblio.backend.dto.RegisterRequest;
import com.biblio.backend.dto.UtilisateurDTO;
import com.biblio.backend.service.UtilisateurService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authentification")
public class AuthController {
    @Autowired
    private final UtilisateurService utilisateurService;

    @Setter
    @Getter
    private LoginRequest request;

    public AuthController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }


    @PostMapping("/inscription")
    public ResponseEntity<UtilisateurDTO> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(utilisateurService.register(request));
    }


    @PostMapping("/SeConnecter")
    public ResponseEntity<UtilisateurDTO> login(@RequestBody LoginRequest request) {
        this.request = request;
        return ResponseEntity.ok(utilisateurService.login(request));
    }

}