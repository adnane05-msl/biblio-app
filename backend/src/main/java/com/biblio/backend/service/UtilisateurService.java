package com.biblio.backend.service;

import com.biblio.admin.service.LogService;
import com.biblio.backend.dto.*;
import com.biblio.backend.model.Utilisateur;
import com.biblio.backend.repository.UtilisateurRepository;
import com.biblio.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationService verificationService;
    private final LogService logService;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              PasswordEncoder passwordEncoder,
                              JwtService jwtService,
                              VerificationService verificationService,
                              LogService logService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder       = passwordEncoder;
        this.jwtService            = jwtService;
        this.verificationService   = verificationService;
        this.logService            = logService;
    }

    public UtilisateurDTO register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            logService.warn("Authentification",
                    "Tentative d'inscription avec email déjà utilisé : " + request.getEmail(),
                    request.getEmail());
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        if (!verificationService.isEmailVerified(request.getEmail())) {
            throw new RuntimeException("Veuillez d'abord vérifier votre email");
        }

        Utilisateur user = new Utilisateur();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setRole("ROLE_USER");
        user.setProfil(request.getProfil());
        user.setEmailVerified(true);

        Utilisateur saved = utilisateurRepository.save(user);
        verificationService.clearVerificationCode(request.getEmail());

        logService.ok("Authentification",
                "Nouvel utilisateur inscrit : " + saved.getNom() + " (" + saved.getEmail() + ")",
                saved.getEmail());

        String token = jwtService.generateToken(saved.getEmail(), saved.getRole());
        return toDTO(saved, token);
    }

    public UtilisateurDTO login(LoginRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            logService.warn("Authentification",
                    "Mot de passe incorrect pour : " + request.getEmail(),
                    request.getEmail());
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        //bloquer les comptes désactivés par l'admin
        if ("INACTIF".equalsIgnoreCase(user.getStatut())) {
            logService.warn("Authentification",
                    "Tentative de connexion sur compte désactivé : " + request.getEmail(),
                    request.getEmail());
            throw new RuntimeException(
                    "Votre compte a été désactivé. Contactez l'administrateur.");
        }

        String role = user.getRole() != null ? user.getRole() : "ROLE_USER";

        logService.ok("Authentification",
                "Connexion réussie : " + user.getNom() + " (" + user.getEmail() + ")",
                user.getEmail());

        String token = jwtService.generateToken(user.getEmail(), role);
        return toDTO(user, token);
    }

    public UtilisateurDTO updateProfil(Long id, UpdateProfilRequest request) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setProfil(request.getProfil());
        Utilisateur updated = utilisateurRepository.save(user);
        String role  = updated.getRole() != null ? updated.getRole() : "ROLE_USER";
        String token = jwtService.generateToken(updated.getEmail(), role);
        return toDTO(updated, token);
    }

    public void changePassword(Long id, ChangePasswordRequest request) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getMotDePasse())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }
        user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(user);
    }

    public UtilisateurDTO findById(Long id) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return toDTO(user, null);
    }

    private UtilisateurDTO toDTO(Utilisateur u, String token) {
        return new UtilisateurDTO(
                u.getId(), u.getNom(), u.getPrenom(), u.getEmail(),
                u.getRole(), u.getProfil(), u.isEmailVerified(), token
        );
    }
}