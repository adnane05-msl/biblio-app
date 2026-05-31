package com.biblio.admin.repository;

import com.biblio.admin.model.LogSysteme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogSystemeRepository extends JpaRepository<LogSysteme, Long> {

    List<LogSysteme> findTop50ByOrderByCreatedAtDesc();

    List<LogSysteme> findByType(LogSysteme.TypeLog type);

    List<LogSysteme> findByComposant(String composant);

    // Logs des dernières 24h
    @Query("SELECT l FROM LogSysteme l WHERE l.createdAt >= :depuis ORDER BY l.createdAt DESC")
    List<LogSysteme> findDepuis(LocalDateTime depuis);

    long countByTypeAndCreatedAtAfter(LogSysteme.TypeLog type, LocalDateTime depuis);
}