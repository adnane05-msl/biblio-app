package com.biblio.admin.service;

import com.biblio.admin.dto.DashboardDto;
import com.biblio.admin.dto.SourceDto;
import com.biblio.admin.dto.UserDto;
import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import com.biblio.admin.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AdminUserRepository   userRepository;
    private final AdminSourceRepository sourceRepository;

    public DashboardDto getDashboard() {
        return DashboardDto.builder()
                .totalUtilisateurs(userRepository.count())
                .utilisateursActifs(userRepository.countByStatut("ACTIF"))
                .utilisateursInactifs(userRepository.countByStatut("INACTIF"))
                .sourcesEnLigne(sourceRepository.countByStatut(
                        AdminSource.StatutSource.EN_LIGNE))
                .totalSources(sourceRepository.count())
                .versionBackend("1.0.0")
                .versionFrontend("1.0.0")
                .sourcesSummary(
                        sourceRepository.findAll().stream()
                                .map(SourceDto.Response::from)
                                .collect(Collectors.toList())
                )
                .derniersInscrits(
                        // ✅ Méthode renommée
                        userRepository.findTop5ByOrderByDateInscriptionDesc().stream()
                                .map(UserDto.Response::from)
                                .collect(Collectors.toList())
                )
                .build();
    }
}