package com.biblio.backend.repository;

import com.biblio.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findByDoi(String doi);
    boolean existsByDoi(String doi);
}
