package com.biblio.backend.service;

import com.biblio.backend.dto.ArticleDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ArxivService {

    private static final String API_URL = "https://export.arxiv.org/api/query";
    private static final int MAX_RESULTS = 50;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<ArticleDTO> search(String query) {
        List<ArticleDTO> results = new ArrayList<>();

        try {
            String url = API_URL + "?search_query=" + query + "&max_results=" + MAX_RESULTS;
            String response = restTemplate.getForObject(url, String.class);

            // Parser XML
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode root = xmlMapper.readTree(response.getBytes());
            JsonNode entries = root.path("feed").path("entry");

            for (JsonNode entry : entries) {
                ArticleDTO article = new ArticleDTO();

                article.setTitle(entry.path("title").asText().replace("\n", " ").trim());
                article.setAbstractText(entry.path("summary").asText().replace("\n", " ").trim());

                // Auteurs
                JsonNode authors = entry.path("author");
                if (authors.isArray()) {
                    StringBuilder authorNames = new StringBuilder();
                    for (JsonNode author : authors) {
                        if (authorNames.length() > 0) authorNames.append(", ");
                        authorNames.append(author.path("name").asText());
                    }
                    article.setAuthors(authorNames.toString());
                } else if (authors.isObject()) {
                    article.setAuthors(authors.path("name").asText());
                }

                // Année à partir de la date de publication
                String published = entry.path("published").asText();
                if (published.length() >= 4) {
                    try {
                        article.setYear(Integer.parseInt(published.substring(0, 4)));
                    } catch (NumberFormatException e) {
                        article.setYear(null);
                    }
                }

                article.setJournal("arXiv");
                article.setPublisher("arXiv");
                article.setDocumentType("preprint");
                article.setSource("arXiv");

                // URL (lien vers l'article)
                JsonNode links = entry.path("link");
                if (links.isArray()) {
                    for (JsonNode link : links) {
                        if ("application/pdf".equals(link.path("type").asText()) ||
                                "text/html".equals(link.path("type").asText())) {
                            article.setUrl(link.path("href").asText());
                            break;
                        }
                    }
                }

                results.add(article);
            }

        } catch (Exception e) {
            System.err.println("Erreur arXiv: " + e.getMessage());
        }

        return results;
    }
}
