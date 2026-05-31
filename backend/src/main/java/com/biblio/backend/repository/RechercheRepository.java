// repository/RechercheRepository.java
package com.biblio.backend.repository;

import com.biblio.backend.model.Recherche;
import com.biblio.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface RechercheRepository extends JpaRepository<Recherche, Long> {

    List<Recherche> findByUtilisateur(Utilisateur utilisateur);

    List<Recherche> findByUtilisateurIdOrderByDateRechercheDesc(Long utilisateurId);

    // Suppression définitive d'une entrée par ID
    @Modifying
    @Transactional
    @Query("DELETE FROM Recherche r WHERE r.id = :id")
    void deleteDefinitivement(@Param("id") Long id);

    // Suppression définitive de tout l'historique d'un utilisateur
    @Modifying
    @Transactional
    @Query("DELETE FROM Recherche r WHERE r.utilisateur.id = :userId")
    void deleteAllByUtilisateurId(@Param("userId") Long userId);
}