package com.biblio.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
		"com.biblio.backend",
		"com.biblio.admin"
})
@EnableJpaRepositories(basePackages = {
		"com.biblio.backend.repository",
		"com.biblio.admin.repository"
})
@EntityScan(basePackages = {
		"com.biblio.backend.model",
		"com.biblio.admin.model"
})
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}