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
public class OpenAlexService {

    private static final String API_URL = "https://api.openalex.org/works";

    // OpenAlex limite à 200 résultats par page
    private static final int PER_PAGE = 200;

    private static final int MAX_TOTAL_RESULTS = 5000;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executor;

    public OpenAlexService(ExecutorService searchExecutor) {
        this.executor = searchExecutor;
    }

    public List<ArticleDTO> search(String query) {
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);

            // ── Page 1 : récupère aussi meta.count (total disponible) ──
            String firstPageUrl = buildUrl(encodedQuery, 1);
            String firstResponse = restTemplate.getForObject(firstPageUrl, String.class);
            JsonNode firstRoot = objectMapper.readTree(firstResponse);

            List<ArticleDTO> page1 = extractArticles(firstRoot.path("results"));

            int totalAvailable = firstRoot.path("meta").path("count").asInt(page1.size());
            int totalToFetch = Math.min(totalAvailable, MAX_TOTAL_RESULTS);
            int totalPages = (int) Math.ceil(totalToFetch / (double) PER_PAGE);

            List<ArticleDTO> results = new ArrayList<>(page1);

            if (totalPages > 1) {
                List<CompletableFuture<List<ArticleDTO>>> futures = new ArrayList<>();
                for (int page = 2; page <= totalPages; page++) {
                    final int p = page;
                    futures.add(CompletableFuture.supplyAsync(
                            () -> fetchPage(encodedQuery, p), executor));
                }

                for (CompletableFuture<List<ArticleDTO>> f : futures) {
                    results.addAll(f.join());
                }
            }

            if (results.size() > MAX_TOTAL_RESULTS) {
                results = results.subList(0, MAX_TOTAL_RESULTS);
            }

            return results;

        } catch (Exception e) {
            System.err.println("Erreur OpenAlex: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<ArticleDTO> fetchPage(String encodedQuery, int page) {
        try {
            String url = buildUrl(encodedQuery, page);
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            return extractArticles(root.path("results"));
        } catch (Exception e) {
            System.err.println("Erreur OpenAlex (page=" + page + "): " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private String buildUrl(String encodedQuery, int page) {
        return API_URL + "?search=" + encodedQuery
                + "&per-page=" + PER_PAGE
                + "&page=" + page;
    }

    private List<ArticleDTO> extractArticles(JsonNode items) {
        List<ArticleDTO> list = new ArrayList<>();
        if (!items.isArray()) return list;

        for (JsonNode item : items) {
            ArticleDTO article = new ArticleDTO();

            article.setTitle(item.path("title").asText());
            article.setYear(item.path("publication_year").asInt());

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
                        ? null
                        : reconstructAbstract(item.path("abstract_inverted_index"));
            }
            article.setAbstractText(cleanAbstract(abstractText));

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