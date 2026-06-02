package com.biblio.admin.service;

import com.biblio.admin.dto.UserDto;
import com.biblio.admin.model.AdminUser;
import com.biblio.admin.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final AdminUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogService logService;

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

    @Transactional
    public UserDto.Response create(UserDto.CreateRequest req) {
        AdminUser user = AdminUser.builder()
                .nom(req.getNom())
                .email(req.getEmail())
                .role(req.getRole() != null ? req.getRole() : "ROLE_USER")
                .statut("ACTIF")
                .build();
        AdminUser saved = userRepository.save(user);

        logService.ok("Gestion utilisateurs",
                "Utilisateur créé par admin : " + saved.getNom() + " (" + saved.getEmail() + ")",
                saved.getEmail());

        return UserDto.Response.from(saved);
    }

    @Transactional
    public UserDto.Response update(Long id, UserDto.UpdateRequest req) {
        AdminUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));
        if (req.getNom()    != null) user.setNom(req.getNom());
        if (req.getEmail()  != null) user.setEmail(req.getEmail());
        if (req.getRole()   != null) user.setRole(req.getRole());
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