package com.biblio.admin.service;

import com.biblio.admin.model.LogSysteme;
import com.biblio.admin.repository.LogSystemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogSystemeRepository logRepository;

    public void info(String composant, String message, String userEmail) {
        save(LogSysteme.TypeLog.INFO, composant, message, userEmail);
    }

    public void ok(String composant, String message, String userEmail) {
        save(LogSysteme.TypeLog.OK, composant, message, userEmail);
    }

    public void warn(String composant, String message, String userEmail) {
        save(LogSysteme.TypeLog.WARN, composant, message, userEmail);
    }


    private void save(LogSysteme.TypeLog type, String composant,
                      String message, String userEmail) {
        LogSysteme log = LogSysteme.builder()
                .type(type)
                .composant(composant)
                .message(message)
                .userEmail(userEmail)
                .build();
        logRepository.save(log);
    }
}