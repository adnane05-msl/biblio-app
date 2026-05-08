package com.biblio.backend.service;

import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.model.Article;
import com.biblio.backend.repository.ProjectArticleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExportService {

    private final ProjectArticleRepository projectArticleRepository;

    public ExportService(
            ProjectArticleRepository projectArticleRepository) {
        this.projectArticleRepository = projectArticleRepository;
    }

    // ================================
    // EXPORT BIBTEX
    // ================================
    public String exportBibtex(Long projectId) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProjectId(projectId);

        StringBuilder sb = new StringBuilder();
        sb.append("% BibTeX export — BiblioApp\n\n");

        for (ProjectArticle pa : list) {
            Article a = pa.getArticle();

            // Générer une clé BibTeX unique
            String key = generateBibtexKey(a);
            String type = detectBibtexType(a);

            sb.append("@").append(type).append("{")
                    .append(key).append(",\n");

            if (a.getTitre() != null)
                sb.append("  title     = {")
                        .append(cleanBibtex(a.getTitre())).append("},\n");

            if (a.getAuteurs() != null)
                sb.append("  author    = {")
                        .append(cleanBibtex(a.getAuteurs())).append("},\n");

            if (a.getAnnee() != null)
                sb.append("  year      = {")
                        .append(a.getAnnee()).append("},\n");

            if (a.getDoi() != null && !a.getDoi().isEmpty())
                sb.append("  doi       = {")
                        .append(a.getDoi()).append("},\n");

            if (a.getUrl() != null && !a.getUrl().isEmpty())
                sb.append("  url       = {")
                        .append(a.getUrl()).append("},\n");

            if (a.getNbCitations() != null)
                sb.append("  note      = {Citations: ")
                        .append(a.getNbCitations()).append("},\n");

            if (pa.getNote() != null && !pa.getNote().isEmpty())
                sb.append("  annote    = {")
                        .append(cleanBibtex(pa.getNote())).append("},\n");

            // Supprimer la dernière virgule
            int lastComma = sb.lastIndexOf(",\n");
            if (lastComma != -1)
                sb.replace(lastComma, lastComma + 2, "\n");

            sb.append("}\n\n");
        }

        return sb.toString();
    }

    // ================================
    // EXPORT CSV
    // ================================
    public String exportCsv(Long projectId) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProjectId(projectId);

        StringBuilder sb = new StringBuilder();

        // BOM UTF-8 — force Excel à lire en UTF-8
        sb.append('\uFEFF');

        // Séparateur point-virgule — Excel français l'utilise
        sb.append("Titre;Auteurs;Annee;DOI;URL;Citations;Statut;Note\n");

        for (ProjectArticle pa : list) {
            Article a = pa.getArticle();

            sb.append(csvField(a.getTitre())).append(";");
            sb.append(csvField(a.getAuteurs())).append(";");
            sb.append(a.getAnnee() != null
                    ? a.getAnnee() : "").append(";");
            sb.append(csvField(a.getDoi())).append(";");
            sb.append(csvField(a.getUrl())).append(";");
            sb.append(a.getNbCitations() != null
                    ? a.getNbCitations() : "").append(";");
            sb.append(csvField(pa.getStatut().name())).append(";");
            sb.append(csvField(pa.getNote())).append("\n");
        }

        return sb.toString();
    }

    // ================================
    // EXPORT RIS
    // ================================
    public String exportRis(Long projectId) {
        List<ProjectArticle> list =
                projectArticleRepository.findByProjectId(projectId);

        StringBuilder sb = new StringBuilder();

        for (ProjectArticle pa : list) {
            Article a = pa.getArticle();

            sb.append("TY  - JOUR\n");

            if (a.getTitre() != null)
                sb.append("TI  - ").append(a.getTitre()).append("\n");

            if (a.getAuteurs() != null) {
                for (String author : a.getAuteurs().split(",")) {
                    sb.append("AU  - ").append(author.trim())
                            .append("\n");
                }
            }

            if (a.getAnnee() != null)
                sb.append("PY  - ").append(a.getAnnee()).append("\n");

            if (a.getDoi() != null && !a.getDoi().isEmpty())
                sb.append("DO  - ").append(a.getDoi()).append("\n");

            if (a.getUrl() != null && !a.getUrl().isEmpty())
                sb.append("UR  - ").append(a.getUrl()).append("\n");

            if (a.getResume() != null && !a.getResume().isEmpty())
                sb.append("AB  - ").append(a.getResume()).append("\n");

            if (a.getNbCitations() != null)
                sb.append("N1  - Citations: ")
                        .append(a.getNbCitations()).append("\n");

            if (pa.getNote() != null && !pa.getNote().isEmpty())
                sb.append("N2  - ").append(pa.getNote()).append("\n");

            sb.append("ER  - \n\n");
        }

        return sb.toString();
    }

    // ================================
    // HELPERS
    // ================================
    private String generateBibtexKey(Article a) {
        String author = "unknown";
        if (a.getAuteurs() != null && !a.getAuteurs().isEmpty()) {
            String first = a.getAuteurs().split(",")[0].trim();
            String[] parts = first.split(" ");
            author = parts[parts.length - 1]
                    .toLowerCase()
                    .replaceAll("[^a-z]", "");
        }
        String year = a.getAnnee() != null
                ? String.valueOf(a.getAnnee()) : "0000";
        String title = "";
        if (a.getTitre() != null && a.getTitre().length() > 3) {
            title = a.getTitre().split(" ")[0]
                    .toLowerCase()
                    .replaceAll("[^a-z]", "");
        }
        return author + year + title;
    }

    private String detectBibtexType(Article a) {
        return "article";
    }

    private String cleanBibtex(String text) {
        if (text == null) return "";
        return text.replace("{", "\\{")
                .replace("}", "\\}")
                .replace("&", "\\&");
    }

    private String csvField(String value) {
        if (value == null) return "";
        // Entourer de guillemets si contient virgule ou guillemet
        if (value.contains(",") || value.contains("\"")
                || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
