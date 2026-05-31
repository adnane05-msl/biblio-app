package com.biblio.admin.service;

import com.biblio.admin.dto.SourceDto;
import com.biblio.admin.model.LogSysteme;
import com.biblio.admin.model.Source;
import com.biblio.admin.repository.SourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de supervision des sources académiques externes.
 */
@Service
@RequiredArgsConstructor
public class SourceAdminService {

    private final SourceRepository sourceRepository;
    private final LogService logService;

    // ── Liste complète ────────────────────────────────────────────────────────
    public List<SourceDto.Response> findAll() {
        return sourceRepository.findAll()
                .stream()
                .map(SourceDto.Response::from)
                .collect(Collectors.toList());
    }

    // ── Détail par ID ─────────────────────────────────────────────────────────
    public SourceDto.Response findById(Long id) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        return SourceDto.Response.from(source);
    }

    // ── Création ──────────────────────────────────────────────────────────────
    @Transactional
    public SourceDto.Response create(SourceDto.CreateRequest req) {
        if (sourceRepository.existsByNom(req.getNom())) {
            throw new RuntimeException("Source déjà existante : " + req.getNom());
        }
        Source source = Source.builder()
                .nom(req.getNom())
                .urlBase(req.getUrlBase())
                .typeApi(req.getTypeApi())
                .limiteRequetes(req.getLimiteRequetes())
                .cleApi(req.getCleApi())
                .statut(Source.StatutSource.EN_LIGNE)
                .build();

        Source saved = sourceRepository.save(source);
        logService.log(LogSysteme.TypeLog.INFO,
                "Source ajoutée : " + saved.getNom(), "Admin");
        return SourceDto.Response.from(saved);
    }

    // ── Mise à jour ───────────────────────────────────────────────────────────
    @Transactional
    public SourceDto.Response update(Long id, SourceDto.UpdateRequest req) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));

        if (req.getNom() != null)            source.setNom(req.getNom());
        if (req.getUrlBase() != null)        source.setUrlBase(req.getUrlBase());
        if (req.getTypeApi() != null)        source.setTypeApi(req.getTypeApi());
        if (req.getStatut() != null)         source.setStatut(req.getStatut());
        if (req.getLimiteRequetes() != null) source.setLimiteRequetes(req.getLimiteRequetes());
        if (req.getCleApi() != null)         source.setCleApi(req.getCleApi());

        logService.log(LogSysteme.TypeLog.INFO,
                "Source modifiée : " + source.getNom(), "Admin");
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    // ── Ping / rafraîchissement ───────────────────────────────────────────────
    @Transactional
    public SourceDto.Response rafraichir(Long id) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));

        source.setDerniereSynchro(LocalDateTime.now());
        logService.log(LogSysteme.TypeLog.OK,
                "Synchro manuelle : " + source.getNom(), source.getNom());
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    // ── Basculer le statut ────────────────────────────────────────────────────
    @Transactional
    public SourceDto.Response changerStatut(Long id, Source.StatutSource nouveauStatut) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        source.setStatut(nouveauStatut);
        logService.log(LogSysteme.TypeLog.WARN,
                "Statut source changé → " + nouveauStatut + " : " + source.getNom(), "Admin");
        return SourceDto.Response.from(sourceRepository.save(source));
    }

    // ── Suppression ───────────────────────────────────────────────────────────
    @Transactional
    public void supprimer(Long id) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source introuvable : " + id));
        logService.log(LogSysteme.TypeLog.WARN,
                "Source supprimée : " + source.getNom(), "Admin");
        sourceRepository.deleteById(id);
    }
}