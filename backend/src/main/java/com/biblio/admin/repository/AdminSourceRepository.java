package com.biblio.admin.repository;

import com.biblio.admin.model.AdminSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminSourceRepository extends JpaRepository<AdminSource, Long> {

    List<AdminSource> findByStatut(AdminSource.StatutSource statut);

    long countByStatut(AdminSource.StatutSource statut);

    boolean existsByNom(String nom);
}