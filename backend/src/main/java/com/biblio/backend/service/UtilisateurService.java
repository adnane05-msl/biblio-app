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

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UtilisateurDTO register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // Créer le nouvel utilisateur
        Utilisateur user = new Utilisateur();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setRole("USER");
        user.setProfil(request.getProfil());

        Utilisateur savedUser = utilisateurRepository.save(user);
        String token = jwtService.generateToken(savedUser.getEmail());

        // Convertir en DTO
        return new UtilisateurDTO(
                savedUser.getId(),
                savedUser.getNom(),
                savedUser.getPrenom(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getProfil(),
                token
        );
    }

    // Connexion
    public UtilisateurDTO login(LoginRequest request) {
        Optional<Utilisateur> userOpt = utilisateurRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        Utilisateur user = userOpt.get();

        if (!passwordEncoder.matches(request.getMotDePasse(),
                user.getMotDePasse())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new UtilisateurDTO(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole(),
                user.getProfil(),
                token
        );
    }

    // Trouver un utilisateur par ID
//    public Utilisateur findById(Long id) {
//        return utilisateurRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
//    }

    // Mettre à jour le profil
    public UtilisateurDTO updateProfil(Long id, UpdateProfilRequest request) {

        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé"));

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setProfil(request.getProfil());

        Utilisateur updated = utilisateurRepository.save(user);
        String token = jwtService.generateToken(updated.getEmail());

        return new UtilisateurDTO(
                updated.getId(),
                updated.getNom(),
                updated.getPrenom(),
                updated.getEmail(),
                updated.getRole(),
                updated.getProfil(),
                token
        );
    }

    // Changer le mot de passe
    public void changePassword(Long id, ChangePasswordRequest request) {

        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(
                request.getAncienMotDePasse(),
                user.getMotDePasse())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        user.setMotDePasse(
                passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(user);
    }

    // Récupérer un utilisateur par ID
    public UtilisateurDTO findById(Long id) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur non trouvé"));

        return new UtilisateurDTO(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getRole(),
                user.getProfil(),
                null
        );
    }

}