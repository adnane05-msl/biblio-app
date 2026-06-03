package com.biblio.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.cache.annotation.EnableCaching;


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
@EnableCaching
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}