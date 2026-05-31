package com.biblio.admin.repository;

import com.biblio.admin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByStatut(User.Statut statut);

    List<User> findByRole(User.Role role);

    // Recherche par nom ou email (insensible à la casse)
    @Query("SELECT u FROM User u WHERE LOWER(u.nom) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<User> searchByNomOrEmail(String q);

    long countByStatut(User.Statut statut);

    long countByRole(User.Role role);

    // Derniers inscrits
    List<User> findTop5ByOrderByCreatedAtDesc();
}