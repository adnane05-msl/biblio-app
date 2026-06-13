package com.biblio.backend.repository;

import com.biblio.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    @Query("SELECT a FROM Article a WHERE a.doi IS NOT NULL AND TRIM(a.doi) != '' AND LOWER(TRIM(a.doi)) = LOWER(TRIM(:doi)) ORDER BY a.id DESC")
    java.util.List<Article> findAllByDoi(@Param("doi") String doi);

    @Query("SELECT a FROM Article a WHERE LOWER(TRIM(a.titre)) = LOWER(TRIM(:titre))")
    Optional<Article> findByTitre(@Param("titre") String titre);
}