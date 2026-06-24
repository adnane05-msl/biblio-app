package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAlexService {

    private static final String API_URL = "https://api.openalex.org/works";
    private static final int MAX_RESULTS = 300;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ArticleDTO> search(String query) {
        List<ArticleDTO> results = new ArrayList<>();

        try {
            String url = API_URL + "?search=" + query + "&per-page=" + MAX_RESULTS;
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("results");

            for (JsonNode item : items) {
                ArticleDTO article = new ArticleDTO();

                article.setTitle(item.path("title").asText());
                article.setYear(item.path("publication_year").asInt());

                // Auteurs
                JsonNode authorships = item.path("authorships");
                if (authorships.isArray()) {
                    StringBuilder authorNames = new StringBuilder();
                    for (JsonNode auth : authorships) {
                        String authorName = auth.path("author").path("display_name").asText();
                        if (authorNames.length() > 0) authorNames.append(", ");
                        authorNames.append(authorName);
                    }
                    article.setAuthors(authorNames.toString());
                }

                JsonNode hostVenue = item.path("host_venue");
                article.setJournal(hostVenue.path("display_name").asText());

                article.setDoi(item.path("doi").asText());
                article.setDocumentType(item.path("type").asText());
                article.setCitations(item.path("cited_by_count").asInt());
                article.setSource("OpenAlex");

                String abstractText = item.path("abstract").asText();
                if (abstractText == null || abstractText.isBlank()) {
                    abstractText = item.path("abstract_inverted_index").isMissingNode()
                            ? null : reconstructAbstract(item.path("abstract_inverted_index"));
                }
                article.setAbstractText(cleanAbstract(abstractText));

                if (article.getDoi() != null && !article.getDoi().isEmpty()) {
                    article.setUrl("https://doi.org/" + article.getDoi());
                }

                results.add(article);
            }

        } catch (Exception e) {
            System.err.println("Erreur OpenAlex: " + e.getMessage());
        }

        return results;
    }

    private String cleanAbstract(String text) {
        if (text == null || text.isBlank()) return null;
        return text
                .replaceAll("<[^>]+>", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    // Cette méthode reconstruit le texte original
    private String reconstructAbstract(JsonNode invertedIndex) {
        try {
            java.util.TreeMap<Integer, String> positionMap = new java.util.TreeMap<>();

            for (java.util.Map.Entry<String, JsonNode> entry : invertedIndex.properties()) {
                String word = entry.getKey();
                JsonNode positions = entry.getValue();
                for (JsonNode pos : positions) {
                    positionMap.put(pos.asInt(), word);
                }
            }

            return String.join(" ", positionMap.values());
        } catch (Exception e) {
            return null;
        }
    }




}