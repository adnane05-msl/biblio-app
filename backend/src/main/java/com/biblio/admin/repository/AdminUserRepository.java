package com.biblio.admin.repository;

import com.biblio.admin.model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByEmail(String email);

    long countByStatut(String statut);

    List<AdminUser> findTop5ByOrderByCreatedAtDesc();

    List<AdminUser> findByNomContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nom, String email);
}