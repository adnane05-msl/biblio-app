package com.biblio.backend.repository;

import com.biblio.backend.model.Project;
import com.biblio.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
    public interface ProjectRepository extends JpaRepository<Project, Long> {
        List<Project> findByUtilisateur(Utilisateur user);
        List<Project> findByUtilisateurId(Long userId);
    }

