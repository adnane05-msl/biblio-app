package com.biblio.backend.repository;

import com.biblio.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
    public interface ProjectRepository extends JpaRepository<Project, Long> {
        Optional<Project> findById(Long id);
        List<Project> findByUtilisateurId(Long userId);
    }

