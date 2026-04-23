package com.biblio.backend.repository;

import com.biblio.backend.model.Article;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectArticleRepository extends JpaRepository<ProjectArticle, Long> {
    List<ProjectArticle> findByProject(Project project);
    List<ProjectArticle> findByProjectId(Long projectId);
    Optional<ProjectArticle> findByProjectAndArticle(Project project, Article article);
    void deleteByProjectAndArticle(Project project, Article article);

}
