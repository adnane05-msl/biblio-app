package com.biblio.admin.service;

import com.biblio.admin.dto.SourceDto;
import com.biblio.admin.model.AdminSource;
import com.biblio.admin.repository.AdminSourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SourceAdminService {

    private final AdminSourceRepository sourceRepository;

    public List<SourceDto.Response> findAll() {
        return sourceRepository.findAll()
                .stream()
                .map(SourceDto.Response::from)
                .collect(Collectors.toList());
    }

    public SourceDto.Response findById(Long id) {
        AdminSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        return SourceDto.Response.from(source);
    }

    @Transactional
    public SourceDto.Response create(SourceDto.CreateRequest req) {
        if (sourceRepository.existsByNom(req.getNom())) {
            throw new RuntimeException("Source déjà existante : " + req.getNom());
        }
        AdminSource source = AdminSource.builder()
                .nom(req.getNom())
                .urlBase(req.getUrlBase())
                .typeApi(req.getTypeApi())
                .limiteRequetes(req.getLimiteRequetes())
                .cleApi(req.getCleApi())
                .statut(AdminSource.StatutSource.EN_LIGNE)
                .build();
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    @Transactional
    public SourceDto.Response update(Long id, SourceDto.UpdateRequest req) {
        AdminSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        if (req.getNom()           != null) source.setNom(req.getNom());
        if (req.getUrlBase()       != null) source.setUrlBase(req.getUrlBase());
        if (req.getTypeApi()       != null) source.setTypeApi(req.getTypeApi());
        if (req.getStatut()        != null) source.setStatut(req.getStatut());
        if (req.getLimiteRequetes() != null) source.setLimiteRequetes(req.getLimiteRequetes());
        if (req.getCleApi()        != null) source.setCleApi(req.getCleApi());
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    @Transactional
    public SourceDto.Response rafraichir(Long id) {
        AdminSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        // Simulation ping — à remplacer par un vrai appel HTTP
        source.setDerniereSynchro(LocalDateTime.now());
        source.setLatenceMs((int)(Math.random() * 200 + 50));
        source.setStatut(AdminSource.StatutSource.EN_LIGNE);
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    @Transactional
    public SourceDto.Response changerStatut(Long id, AdminSource.StatutSource statut) {
        AdminSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        source.setStatut(statut);
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    @Transactional
    public void supprimer(Long id) {
        sourceRepository.deleteById(id);
    }
}