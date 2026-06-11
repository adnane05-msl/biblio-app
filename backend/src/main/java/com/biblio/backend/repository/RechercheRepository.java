// repository/RechercheRepository.java
package com.biblio.backend.repository;

import com.biblio.backend.model.Recherche;
import com.biblio.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RechercheRepository extends JpaRepository<Recherche, Long> {

    List<Recherche> findByUtilisateur(Utilisateur utilisateur);

    List<Recherche> findByUtilisateurIdOrderByDateRechercheDesc(Long utilisateurId);
}