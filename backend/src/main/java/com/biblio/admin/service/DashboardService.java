package com.biblio.admin.service;

import com.biblio.admin.dto.DashboardDto;
import com.biblio.admin.dto.UserDto;
import com.biblio.admin.model.Source;
import com.biblio.admin.model.User;
import com.biblio.admin.repository.SourceRepository;
import com.biblio.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * Service agrégeant les données pour le tableau de bord admin.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final SourceRepository sourceRepository;
    private final LogService logService;

    public DashboardDto getDashboard() {
        return DashboardDto.builder()
                .totalUtilisateurs(userRepository.count())
                .utilisateursActifs(userRepository.countByStatut(User.Statut.ACTIF))
                .sourcesEnLigne(sourceRepository.countByStatut(Source.StatutSource.EN_LIGNE))
                .totalSources(sourceRepository.count())
                .erreursAujourdhui(logService.countErreursAujourdhui())
                .uptimePct(99.2)
                .versionBackend("1.1.3")
                .versionFrontend("1.2.0")
                .sourcesSummary(sourceRepository.findAll()
                        .stream()
                        .map(com.biblio.admin.dto.SourceDto.Response::from)
                        .collect(Collectors.toList()))
                .logsRecents(logService.findDernieres24h().stream().limit(10).collect(Collectors.toList()))
                .derniersInscrits(userRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(UserDto.Response::from)
                        .collect(Collectors.toList()))
                .build();
    }
}