// backend/src/main/java/com/biblio/backend/config/CorsConfig.java
package com.biblio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",   // React CRA
                        "http://localhost:3008",   // votre port actuel
                        "http://localhost:5173",   // Vite défaut
                        "http://localhost:5174"    // Vite port alternatif
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}