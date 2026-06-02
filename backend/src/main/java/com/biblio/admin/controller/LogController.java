package com.biblio.admin.controller;

import com.biblio.admin.dto.LogDto;
import com.biblio.admin.model.LogSysteme;
import com.biblio.admin.repository.LogSystemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class LogController {

    private final LogSystemeRepository logRepository;

    @GetMapping
    public ResponseEntity<List<LogDto.Response>> getLogs(
            @RequestParam(required = false) String type) {

        List<LogSysteme> logs;

        if (type != null && !type.isBlank()) {
            LogSysteme.TypeLog typeLog = LogSysteme.TypeLog.valueOf(type.toUpperCase());
            logs = logRepository.findByType(typeLog);
        } else {
            logs = logRepository.findTop50ByOrderByCreatedAtDesc();
        }

        return ResponseEntity.ok(
                logs.stream()
                        .map(LogDto.Response::from)
                        .collect(Collectors.toList())
        );
    }
}