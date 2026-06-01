package com.biblio.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application.
 *
 * ✅ scanBasePackages inclut les deux packages :
 *    - com.biblio.backend  → controllers utilisateur, auth, export…
 *    - com.biblio.admin    → controllers admin (dashboard, users, sources, logs)
 *
 * Sans ce scan explicite, Spring Boot ne charge que com.biblio.backend
 * et tous les /api/admin/** retournent 404.
 */
@SpringBootApplication(scanBasePackages = {
		"com.biblio.backend",
		"com.biblio.admin"
})
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}