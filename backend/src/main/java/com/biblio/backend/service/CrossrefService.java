package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

@Service
public class CrossrefService {

    private static final String API_URL = "https://api.crossref.org/works";

    // Crossref autorise jusqu'à 1000 résultats par page
    private static final int ROWS_PER_PAGE = 1000;

    // Garde-fou anti-surcharge — reste sous la limite de "deep paging"
    // par offset de Crossref (offset + rows doit rester ≤ ~10000).
    private static final int MAX_TOTAL_RESULTS = 5000;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executor;

    public CrossrefService(ExecutorService searchExecutor) {
        this.executor = searchExecutor;
    }

    public List<ArticleDTO> search(String query) {
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);

            String firstPageUrl = buildUrl(encodedQuery, 0);
            String firstResponse = restTemplate.getForObject(firstPageUrl, String.class);
            JsonNode firstRoot = objectMapper.readTree(firstResponse);
            JsonNode firstMessage = firstRoot.path("message");

            List<ArticleDTO> page1 = extractArticles(firstMessage.path("items"));

            int totalAvailable = firstMessage.path("total-results").asInt(page1.size());
            int totalToFetch = Math.min(totalAvailable, MAX_TOTAL_RESULTS);
            int totalPages = (int) Math.ceil(totalToFetch / (double) ROWS_PER_PAGE);

            List<ArticleDTO> results = new ArrayList<>(page1);

            if (totalPages > 1) {
                // ── Pages restantes en parallèle ──
                List<CompletableFuture<List<ArticleDTO>>> futures = new ArrayList<>();
                for (int page = 1; page < totalPages; page++) {
                    int offset = page * ROWS_PER_PAGE;
                    futures.add(CompletableFuture.supplyAsync(
                            () -> fetchPage(encodedQuery, offset), executor));
                }

                for (CompletableFuture<List<ArticleDTO>> f : futures) {
                    results.addAll(f.join());
                }
            }

            // On tronque au cas où la dernière page dépasse légèrement la limite
            if (results.size() > MAX_TOTAL_RESULTS) {
                results = results.subList(0, MAX_TOTAL_RESULTS);
            }

            return results;

        } catch (Exception e) {
            System.err.println("Erreur Crossref: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<ArticleDTO> fetchPage(String encodedQuery, int offset) {
        try {
            String url = buildUrl(encodedQuery, offset);
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            return extractArticles(root.path("message").path("items"));
        } catch (Exception e) {
            System.err.println("Erreur Crossref (offset=" + offset + "): " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private String buildUrl(String encodedQuery, int offset) {
        return API_URL + "?query=" + encodedQuery
                + "&rows=" + ROWS_PER_PAGE
                + "&offset=" + offset;
    }

    private List<ArticleDTO> extractArticles(JsonNode items) {
        List<ArticleDTO> list = new ArrayList<>();
        if (!items.isArray()) return list;

        for (JsonNode item : items) {
            ArticleDTO article = new ArticleDTO();

            JsonNode title = item.path("title");
            if (title.isArray() && title.size() > 0) {
                article.setTitle(title.get(0).asText());
            }

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

            JsonNode issued = item.path("issued").path("date-parts");
            if (issued.isArray() && issued.size() > 0) {
                JsonNode dateParts = issued.get(0);
                if (dateParts.isArray() && dateParts.size() > 0) {
                    article.setYear(dateParts.get(0).asInt());
                }
            }

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

            list.add(article);
        }
        return list;
    }

    private String cleanAbstract(String text) {
        if (text == null || text.isBlank()) return null;
        return text
                .replaceAll("<[^>]+>", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}