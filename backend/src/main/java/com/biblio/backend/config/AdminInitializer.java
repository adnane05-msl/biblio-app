package com.biblio.backend.config;

import com.biblio.backend.model.Utilisateur;
import com.biblio.backend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public AdminInitializer(UtilisateurRepository utilisateurRepository,
                            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        if (utilisateurRepository.existsByEmail(adminEmail)) {
            System.out.println("Compte admin déjà existant : " + adminEmail);
            return;
        }

        Utilisateur admin = new Utilisateur();
        admin.setNom("Admin");
        admin.setPrenom("BiblioApp");
        admin.setEmail(adminEmail);
        admin.setMotDePasse(passwordEncoder.encode(adminPassword));
        admin.setRole("ROLE_ADMIN");
        admin.setProfil("Administrateur");
        admin.setEmailVerified(true);

        utilisateurRepository.save(admin);
        System.out.println("Compte admin créé : " + adminEmail);
    }
}