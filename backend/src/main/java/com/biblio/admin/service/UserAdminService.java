package com.biblio.admin.service;

import com.biblio.admin.dto.UserDto;
import com.biblio.admin.model.LogSysteme;
import com.biblio.admin.model.User;
import com.biblio.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des utilisateurs (scope admin).
 */
@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogService logService;

    // ── Liste complète ────────────────────────────────────────────────────────
    public List<UserDto.Response> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserDto.Response::from)
                .collect(Collectors.toList());
    }

    // ── Recherche ─────────────────────────────────────────────────────────────
    public List<UserDto.Response> search(String query) {
        return userRepository.searchByNomOrEmail(query)
                .stream()
                .map(UserDto.Response::from)
                .collect(Collectors.toList());
    }

    // ── Détail par ID ─────────────────────────────────────────────────────────
    public UserDto.Response findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));
        return UserDto.Response.from(user);
    }

    // ── Création ──────────────────────────────────────────────────────────────
    @Transactional
    public UserDto.Response create(UserDto.CreateRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + req.getEmail());
        }

        User user = User.builder()
                .nom(req.getNom())
                .email(req.getEmail())
                .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
                .role(req.getRole())
                .statut(User.Statut.ACTIF)
                .build();

        User saved = userRepository.save(user);
        logService.log(LogSysteme.TypeLog.INFO,
                "Nouvel utilisateur créé : " + saved.getEmail(), "Admin");
        return UserDto.Response.from(saved);
    }

    // ── Mise à jour ───────────────────────────────────────────────────────────
    @Transactional
    public UserDto.Response update(Long id, UserDto.UpdateRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));

        if (req.getNom() != null)    user.setNom(req.getNom());
        if (req.getEmail() != null)  user.setEmail(req.getEmail());
        if (req.getRole() != null)   user.setRole(req.getRole());
        if (req.getStatut() != null) user.setStatut(req.getStatut());

        logService.log(LogSysteme.TypeLog.INFO,
                "Utilisateur modifié : " + user.getEmail(), "Admin");
        return UserDto.Response.from(userRepository.save(user));
    }

    // ── Désactivation (soft delete) ───────────────────────────────────────────
    @Transactional
    public void desactiver(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));
        user.setStatut(User.Statut.INACTIF);
        userRepository.save(user);
        logService.log(LogSysteme.TypeLog.WARN,
                "Utilisateur désactivé : " + user.getEmail(), "Admin");
    }

    // ── Suppression définitive ────────────────────────────────────────────────
    @Transactional
    public void supprimer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));
        logService.log(LogSysteme.TypeLog.WARN,
                "Utilisateur supprimé : " + user.getEmail(), "Admin");
        userRepository.deleteById(id);
    }

    // ── Statistiques ──────────────────────────────────────────────────────────
    public UserDto.Stats getStats() {
        return UserDto.Stats.builder()
                .total(userRepository.count())
                .actifs(userRepository.countByStatut(User.Statut.ACTIF))
                .inactifs(userRepository.countByStatut(User.Statut.INACTIF))
                .admins(userRepository.countByRole(User.Role.ROLE_ADMIN))
                .build();
    }
}