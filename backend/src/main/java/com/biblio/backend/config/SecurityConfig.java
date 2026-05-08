// backend/src/main/java/com/biblio/backend/config/SecurityConfig.java

package com.biblio.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/authentification/**").permitAll()
                        .requestMatchers("/api/project-articles/**").permitAll()
                        .requestMatchers("/api/recherche/**").permitAll()
                        .requestMatchers("/api/export/**").permitAll()
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}