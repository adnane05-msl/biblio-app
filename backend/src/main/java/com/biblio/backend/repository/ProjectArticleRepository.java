package com.biblio.backend.repository;

import com.biblio.backend.model.Article;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectArticleRepository extends JpaRepository<ProjectArticle, Long> {
    List<ProjectArticle> findByProjet(Project project);
    List<ProjectArticle> findByProjetId(Long projectId);
    Optional<ProjectArticle> findByProjetAndArticle(Project project, Article article);
    void deleteByProjetAndArticle(Project project, Article article);
    long countByProjetIdAndStatut(Long projetId, ProjectArticle.Statut statut);
}
