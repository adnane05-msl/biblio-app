package com.biblio.backend.service;

import com.biblio.backend.dto.*;
import com.biblio.backend.model.Utilisateur;
import com.biblio.backend.repository.UtilisateurRepository;
import com.biblio.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final VerificationService verificationService;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                              PasswordEncoder passwordEncoder,
                              JwtService jwtService,
                              VerificationService verificationService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder       = passwordEncoder;
        this.jwtService            = jwtService;
        this.verificationService   = verificationService;
    }

    public UtilisateurDTO register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
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

        // ← Le role est maintenant inclus dans le token
        String token = jwtService.generateToken(saved.getEmail(), saved.getRole());

        return toDTO(saved, token);
    }

    public UtilisateurDTO login(LoginRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        String role  = user.getRole() != null ? user.getRole() : "ROLE_USER";
        // ← Le role est maintenant inclus dans le token → JwtAuthFilter peut lire ROLE_ADMIN
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