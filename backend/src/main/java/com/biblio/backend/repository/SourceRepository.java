// repository/SourceRepository.java
package com.biblio.backend.repository;

import com.biblio.backend.model.Source;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SourceRepository extends JpaRepository<Source, Long> {
    Optional<Source> findByNomSource(String nomSource);
    List<Source> findByActiveTrue();
}
