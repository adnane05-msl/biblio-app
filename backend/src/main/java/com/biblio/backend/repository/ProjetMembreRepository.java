package com.biblio.backend.repository;

import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjetMembre;
import com.biblio.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetMembreRepository extends JpaRepository<ProjetMembre, Long> {

    /** Tous les membres d'un projet (propriétaire inclus). */
    List<ProjetMembre> findByProjet(Project projet);

    /** Tous les membres d'un projet par son ID. */
    List<ProjetMembre> findByProjet_Id(Long projetId);

    /** Vérifier si un utilisateur est déjà membre d'un projet. */
    boolean existsByProjetAndUtilisateur(Project projet, Utilisateur utilisateur);

    /** Trouver le lien spécifique d'un utilisateur dans un projet. */
    Optional<ProjetMembre> findByProjetAndUtilisateur(Project projet, Utilisateur utilisateur);

    /** Tous les projets auxquels un utilisateur participe (en tant que membre). */
    List<ProjetMembre> findByUtilisateur(Utilisateur utilisateur);

    /** Tous les projets auxquels un utilisateur participe par ID. */
    @Query("SELECT pm FROM ProjetMembre pm WHERE pm.utilisateur.id = :userId")
    List<ProjetMembre> findByUtilisateurId(@Param("userId") Long userId);

    /** Supprimer un membre d'un projet. */
    void deleteByProjetAndUtilisateur(Project projet, Utilisateur utilisateur);
}