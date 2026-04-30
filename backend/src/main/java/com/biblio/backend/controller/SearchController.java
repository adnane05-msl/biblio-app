// controller/SearchController.java
package com.biblio.backend.controller;

import com.biblio.backend.dto.ArticleDTO;
import com.biblio.backend.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recherche")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<List<ArticleDTO>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "true") boolean crossref,
            @RequestParam(defaultValue = "true") boolean openalex,
            @RequestParam(defaultValue = "false") boolean arxiv) {

        List<ArticleDTO> results = searchService.search(query, crossref, openalex, arxiv);
        return ResponseEntity.ok(results);
    }
}