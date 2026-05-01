// repository/HistoriqueRepository.java
package com.biblio.backend.repository;

import com.biblio.backend.model.Historique;
import com.biblio.backend.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoriqueRepository extends JpaRepository<Historique, Long> {
    List<Historique> findByArticle(Article article);
}