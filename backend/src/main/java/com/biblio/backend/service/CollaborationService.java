package com.biblio.backend.service;

import com.biblio.backend.dto.InvitationRequest;
import com.biblio.backend.dto.MembreDTO;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjetMembre;
import com.biblio.backend.model.Utilisateur;
import com.biblio.backend.repository.ProjectRepository;
import com.biblio.backend.repository.ProjetMembreRepository;
import com.biblio.backend.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CollaborationService {

    private final ProjetMembreRepository membreRepository;
    private final ProjectRepository projectRepository;
    private final UtilisateurRepository utilisateurRepository;

    public CollaborationService(ProjetMembreRepository membreRepository,
                                ProjectRepository projectRepository,
                                UtilisateurRepository utilisateurRepository) {
        this.membreRepository = membreRepository;
        this.projectRepository = projectRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Initialiser le propriétaire d'un projet (appelé à la création du projet)
    // ─────────────────────────────────────────────────────────────────────────
    public void initProprietaire(Project projet, Utilisateur utilisateur) {
        if (!membreRepository.existsByProjetAndUtilisateur(projet, utilisateur)) {
            ProjetMembre pm = new ProjetMembre();
            pm.setProjet(projet);
            pm.setUtilisateur(utilisateur);
            pm.setRole(ProjetMembre.Role.PROPRIETAIRE);
            membreRepository.save(pm);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Inviter un utilisateur à collaborer sur un projet
    // ─────────────────────────────────────────────────────────────────────────
    public MembreDTO inviterMembre(Long projetId, InvitationRequest request) {
        Project projet = projectRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        Utilisateur cible = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "Aucun compte trouvé pour l'email : " + request.getEmail()));

        // Empêcher d'inviter quelqu'un déjà membre
        if (membreRepository.existsByProjetAndUtilisateur(projet, cible)) {
            throw new RuntimeException("Cet utilisateur est déjà membre du projet.");
        }

        // Valider le rôle fourni
        ProjetMembre.Role role;
        try {
            role = ProjetMembre.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide. Utilisez EDITEUR ou LECTEUR.");
        }

        if (role == ProjetMembre.Role.PROPRIETAIRE) {
            throw new RuntimeException("Impossible d'inviter en tant que PROPRIETAIRE.");
        }

        ProjetMembre pm = new ProjetMembre();
        pm.setProjet(projet);
        pm.setUtilisateur(cible);
        pm.setRole(role);

        ProjetMembre saved = membreRepository.save(pm);
        return toDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Récupérer tous les membres d'un projet
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MembreDTO> getMembres(Long projetId) {
        return membreRepository.findByProjet_Id(projetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modifier le rôle d'un membre
    // ─────────────────────────────────────────────────────────────────────────
    public MembreDTO modifierRole(Long membreId, String nouveauRole) {
        ProjetMembre pm = membreRepository.findById(membreId)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé"));

        if (pm.getRole() == ProjetMembre.Role.PROPRIETAIRE) {
            throw new RuntimeException("Impossible de modifier le rôle du propriétaire.");
        }

        ProjetMembre.Role role;
        try {
            role = ProjetMembre.Role.valueOf(nouveauRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide.");
        }

        if (role == ProjetMembre.Role.PROPRIETAIRE) {
            throw new RuntimeException("Impossible de définir PROPRIETAIRE via cette route.");
        }

        pm.setRole(role);
        return toDTO(membreRepository.save(pm));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Retirer un membre du projet
    // ─────────────────────────────────────────────────────────────────────────
    public void retirerMembre(Long membreId) {
        ProjetMembre pm = membreRepository.findById(membreId)
                .orElseThrow(() -> new RuntimeException("Membre non trouvé"));

        if (pm.getRole() == ProjetMembre.Role.PROPRIETAIRE) {
            throw new RuntimeException("Impossible de retirer le propriétaire du projet.");
        }

        membreRepository.deleteById(membreId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vérifier si un utilisateur a accès à un projet (propriétaire ou membre)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public boolean aAcces(Long projetId, Long utilisateurId) {
        return membreRepository.findByProjet_Id(projetId)
                .stream()
                .anyMatch(pm -> pm.getUtilisateur().getId().equals(utilisateurId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Récupérer le rôle d'un utilisateur dans un projet
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public String getRoleUtilisateur(Long projetId, Long utilisateurId) {
        return membreRepository.findByProjet_Id(projetId)
                .stream()
                .filter(pm -> pm.getUtilisateur().getId().equals(utilisateurId))
                .findFirst()
                .map(pm -> pm.getRole().name())
                .orElse(null);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Récupérer tous les projets partagés avec un utilisateur
    // (projets dont il est membre mais pas propriétaire)
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Long> getProjetsPartages(Long utilisateurId) {
        return membreRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .filter(pm -> pm.getRole() != ProjetMembre.Role.PROPRIETAIRE)
                .map(pm -> pm.getProjet().getId())
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Conversion Entity → DTO
    // ─────────────────────────────────────────────────────────────────────────
    private MembreDTO toDTO(ProjetMembre pm) {
        Utilisateur u = pm.getUtilisateur();
        return new MembreDTO(
                pm.getId(),
                u.getId(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getProfil(),
                pm.getRole().name(),
                pm.getDateAjout()
        );
    }
}
