package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CrossrefService {

    private static final String API_URL = "https://api.crossref.org/works";
    private static final int MAX_RESULTS = 300;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ArticleDTO> search(String query) {
        List<ArticleDTO> results = new ArrayList<>();

        try {
            String url = API_URL + "?query=" + query + "&rows=" + MAX_RESULTS;
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("message").path("items");

            for (JsonNode item : items) {
                ArticleDTO article = new ArticleDTO();

                // Titre
                JsonNode title = item.path("title");
                if (title.isArray() && title.size() > 0) {
                    article.setTitle(title.get(0).asText());
                }

                // Auteurs
                JsonNode authors = item.path("author");
                if (authors.isArray()) {
                    StringBuilder authorNames = new StringBuilder();
                    for (JsonNode author : authors) {
                        String family = author.path("family").asText();
                        String given = author.path("given").asText();
                        if (authorNames.length() > 0) authorNames.append(", ");
                        authorNames.append(given).append(" ").append(family);
                    }
                    article.setAuthors(authorNames.toString());
                }

                // Année
                JsonNode issued = item.path("issued").path("date-parts");
                if (issued.isArray() && issued.size() > 0) {
                    JsonNode dateParts = issued.get(0);
                    if (dateParts.isArray() && dateParts.size() > 0) {
                        article.setYear(dateParts.get(0).asInt());
                    }
                }

                // Journal / Container
                JsonNode container = item.path("container-title");
                if (container.isArray() && container.size() > 0) {
                    article.setJournal(container.get(0).asText());
                }

                article.setPublisher(item.path("publisher").asText());
                article.setDoi(item.path("DOI").asText());
                article.setAbstractText(cleanAbstract(item.path("abstract").asText()));
                article.setDocumentType(item.path("type").asText());
                article.setCitations(item.path("is-referenced-by-count").asInt());
                article.setSource("Crossref");

                if (article.getDoi() != null && !article.getDoi().isEmpty()) {
                    article.setUrl("https://doi.org/" + article.getDoi());
                }

                results.add(article);
            }

        } catch (Exception e) {
            System.err.println("Erreur Crossref: " + e.getMessage());
        }

        return results;
    }

    private String cleanAbstract(String text) {
        if (text == null || text.isBlank()) return null;
        return text
                .replaceAll("<[^>]+>", " ")  // supprimer toutes les balises XML/HTML
                .replaceAll("\\s+", " ")      // nettoyer les espaces multiples
                .trim();
    }
}