//package com.biblio.backend.service;
//
//import com.biblio.backend.dto.AuthResponse;
//import com.biblio.backend.dto.LoginRequest;
//import com.biblio.backend.dto.RegisterRequest;
//import com.biblio.backend.model.Utilisateur;
//import com.biblio.backend.repository.UtilisateurRepository;
//import com.biblio.backend.security.JwtService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//
//@Service
//@RequiredArgsConstructor
//public class AuthService {
//
//    private final UtilisateurRepository utilisateurRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final JwtService jwtService;
//
//    public AuthResponse register(RegisterRequest request) {
//
//        if (utilisateurRepository.existsByEmail(request.getEmail())) {
//            throw new RuntimeException("Email déjà utilisé");
//        }
//
//        Utilisateur utilisateur = new Utilisateur();
//        utilisateur.setNom(request.getNom());
//        utilisateur.setPrenom(request.getPrenom());
//        utilisateur.setEmail(request.getEmail());
//        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
//        utilisateur.setRole("USER");
//        utilisateur.setDateInscription(LocalDate.now());
//
//        utilisateurRepository.save(utilisateur);
//
//        String token = jwtService.generateToken(utilisateur.getEmail());
//
//        return new AuthResponse(
//                token,
//                utilisateur.getEmail(),
//                utilisateur.getNom(),
//                utilisateur.getPrenom(),
//                utilisateur.getRole()
//        );
//    }
//
//    public AuthResponse login(LoginRequest request) {
//
//        Utilisateur utilisateur = utilisateurRepository
//                .findByEmail(request.getEmail())
//                .orElseThrow(() -> new RuntimeException("Email introuvable"));
//
//        if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasse())) {
//            throw new RuntimeException("Mot de passe incorrect");
//        }
//
//        String token = jwtService.generateToken(utilisateur.getEmail());
//
//        return new AuthResponse(
//                token,
//                utilisateur.getEmail(),
//                utilisateur.getNom(),
//                utilisateur.getPrenom(),
//                utilisateur.getRole()
//        );
//    }
//}