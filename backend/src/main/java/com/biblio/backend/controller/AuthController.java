package com.biblio.backend.controller;

import com.biblio.backend.dto.LoginRequest;
import com.biblio.backend.dto.RegisterRequest;
import com.biblio.backend.dto.UtilisateurDTO;
import com.biblio.backend.dto.EmailRequest;
import com.biblio.backend.dto.VerifyCodeRequest;
import com.biblio.backend.dto.ApiResponse;
import com.biblio.backend.service.UtilisateurService;
import com.biblio.backend.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authentification")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:3008",
        "http://127.0.0.1:3008",
        "http://127.0.0.1:5173"
})
public class AuthController {

    private final UtilisateurService utilisateurService;

    @Autowired
    private VerificationService verificationService;

    public AuthController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/inscription")
    public ResponseEntity<UtilisateurDTO> register(@RequestBody RegisterRequest request) {
        System.out.println("Email: " + request.getEmail());
        System.out.println("Nom: " + request.getNom());
        System.out.println("VerificationCode: " + request.getVerificationCode());
        return ResponseEntity.ok(utilisateurService.register(request));
    }

    @PostMapping("/SeConnecter")
    public ResponseEntity<UtilisateurDTO> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(utilisateurService.login(request));
    }

    @PostMapping("/envoyer-code")
    public ResponseEntity<ApiResponse> sendVerificationCode(@RequestBody EmailRequest request) {
        boolean sent = verificationService.sendVerificationCode(request.getEmail());
        if (sent) {
            return ResponseEntity.ok(new ApiResponse(true, "Code envoyé avec succès"));
        } else {
            return ResponseEntity.status(500)
                    .body(new ApiResponse(false, "Erreur lors de l'envoi du code"));
        }
    }

    @PostMapping("/verifier-code")
    public ResponseEntity<ApiResponse> verifyCode(@RequestBody VerifyCodeRequest request) {
        boolean verified = verificationService.verifyCode(request.getEmail(), request.getCode());
        if (verified) {
            return ResponseEntity.ok(new ApiResponse(true, "Code vérifié avec succès"));
        } else {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Code invalide ou expiré"));
        }
    }
}