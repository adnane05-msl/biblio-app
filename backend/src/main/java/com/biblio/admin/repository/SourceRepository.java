package com.biblio.admin.repository;

import com.biblio.admin.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SourceRepository extends JpaRepository<Source, Long> {

    List<Source> findByStatut(Source.StatutSource statut);

    long countByStatut(Source.StatutSource statut);

    boolean existsByNom(String nom);
}