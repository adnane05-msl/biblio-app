package com.biblio.backend.config;

import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class SourceInitializer implements CommandLineRunner {

    private final AdminSourceRepository sourceRepository;

    public SourceInitializer(AdminSourceRepository sourceRepository) {
        this.sourceRepository = sourceRepository;
    }

    @Override
    public void run(String... args) {
        creerSource("Crossref", "https://api.crossref.org", "REST");
        creerSource("OpenAlex", "https://api.openalex.org", "REST");
    }

    private void creerSource(String nom, String urlBase, String typeApi) {
        if (sourceRepository.existsByNom(nom)) {
            System.out.println("ℹSource déjà existante : " + nom);
            return;
        }

        AdminSource source = AdminSource.builder()
                .nom(nom)
                .urlBase(urlBase)
                .typeApi(typeApi)
                .statut(AdminSource.StatutSource.EN_LIGNE)
                .build();

        sourceRepository.save(source);
        System.out.println("Source créée : " + nom);
    }
}