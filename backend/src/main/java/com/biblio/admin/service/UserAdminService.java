package com.biblio.admin.service;

import com.biblio.admin.dto.UserDto;
import com.biblio.admin.model.AdminUser;
import com.biblio.admin.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final AdminUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogService logService;

    // ════════════════════════════════════════════════════════════════════
    //  Lecture
    // ════════════════════════════════════════════════════════════════════

    public List<UserDto.Response> findAll() {
        return userRepository.findAll().stream()
                .map(UserDto.Response::from)
                .collect(Collectors.toList());
    }

    public List<UserDto.Response> search(String q) {
        return userRepository
                .findByNomContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q)
                .stream()
                .map(UserDto.Response::from)
                .collect(Collectors.toList());
    }

    public UserDto.Stats getStats() {
        return UserDto.Stats.builder()
                .total(userRepository.count())
                .actifs(userRepository.countByStatut("ACTIF"))
                .inactifs(userRepository.countByStatut("INACTIF"))
                .admins(userRepository.findAll().stream()
                        .filter(u -> "ROLE_ADMIN".equals(u.getRole()))
                        .count())
                .build();
    }

    public UserDto.Response findById(Long id) {
        return UserDto.Response.from(
                userRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id)));
    }

    // ════════════════════════════════════════════════════════════════════
    //  Création (CORRIGÉE)
    // ════════════════════════════════════════════════════════════════════
    //  - Vérifie que l'email n'existe pas déjà
    //  - Hash le mot de passe avec BCrypt (même méthode que l'inscription)
    //  - Découpe "Nom complet" en nom + prénom (prenom NOT NULL en BDD)
    //  - Normalise le rôle (Utilisateur → ROLE_USER, Admin → ROLE_ADMIN)
    @Transactional
    public UserDto.Response create(UserDto.CreateRequest req) {

        // ── 1. Email unique ──────────────────────────────────────────────
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé : " + req.getEmail());
        }

        // ── 2. Découper "Nom complet" → nom + prénom ─────────────────────
        // La table utilisateur impose prenom NOT NULL.
        String nomComplet = req.getNom().trim();
        String nom = nomComplet;
        String prenom = nomComplet;   // fallback si un seul mot
        int idx = nomComplet.indexOf(' ');
        if (idx > 0) {
            nom    = nomComplet.substring(0, idx).trim();
            prenom = nomComplet.substring(idx + 1).trim();
        }
        // Les colonnes nom/prenom sont limitées à 25 caractères
        if (nom.length()    > 25) nom    = nom.substring(0, 25);
        if (prenom.length() > 25) prenom = prenom.substring(0, 25);

        // ── 3. Construire et sauvegarder ─────────────────────────────────
        AdminUser user = AdminUser.builder()
                .nom(nom)
                .prenom(prenom)
                .email(req.getEmail().trim())
                .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
                .role(normaliserRole(req.getRole()))
                .statut(req.getStatut() != null && !req.getStatut().isBlank()
                        ? req.getStatut().trim().toUpperCase()
                        : "ACTIF")
                .emailVerified(true)
                .dateInscription(LocalDate.now())
                .build();

        AdminUser saved = userRepository.save(user);

        logService.ok("Gestion utilisateurs",
                "Utilisateur créé par admin : " + saved.getNom() + " (" + saved.getEmail() + ")",
                saved.getEmail());

        return UserDto.Response.from(saved);
    }

    // ── Normalisation du rôle (robuste aux libellés du formulaire) ───────
    // "Utilisateur" / "user" / "ROLE_USER"   → ROLE_USER
    // "Admin" / "Administrateur" / "ROLE_ADMIN" → ROLE_ADMIN
    private String normaliserRole(String role) {
        if (role == null) return "ROLE_USER";
        String r = role.trim().toUpperCase();
        return r.contains("ADMIN") ? "ROLE_ADMIN" : "ROLE_USER";
    }

    // ════════════════════════════════════════════════════════════════════
    //  Mise à jour / désactivation / suppression (inchangées)
    // ════════════════════════════════════════════════════════════════════

    @Transactional
    public UserDto.Response update(Long id, UserDto.UpdateRequest req) {
        AdminUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));
        if (req.getNom()    != null) user.setNom(req.getNom());
        if (req.getEmail()  != null) user.setEmail(req.getEmail());
        if (req.getRole()   != null) user.setRole(normaliserRole(req.getRole()));
        if (req.getStatut() != null) user.setStatut(req.getStatut());
        AdminUser saved = userRepository.save(user);

        logService.info("Gestion utilisateurs",
                "Profil modifié par admin : " + saved.getNom() + " (" + saved.getEmail() + ")",
                saved.getEmail());

        return UserDto.Response.from(saved);
    }

    @Transactional
    public void desactiver(Long id) {
        AdminUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));
        user.setStatut("INACTIF");
        userRepository.save(user);

        logService.warn("Gestion utilisateurs",
                "Compte désactivé par admin : " + user.getNom() + " (" + user.getEmail() + ")",
                user.getEmail());
    }

    @Transactional
    public void supprimer(Long id) {
        AdminUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));

        logService.warn("Gestion utilisateurs",
                "Compte supprimé par admin : " + user.getNom() + " (" + user.getEmail() + ")",
                user.getEmail());

        userRepository.deleteById(id);
    }
}