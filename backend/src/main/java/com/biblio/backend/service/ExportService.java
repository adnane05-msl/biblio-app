package com.biblio.backend.service;

import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.model.Article;
import com.biblio.backend.repository.ProjectArticleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExportService {

    private final ProjectArticleRepository projectArticleRepository;

    public ExportService(ProjectArticleRepository projectArticleRepository) {
        this.projectArticleRepository = projectArticleRepository;
    }

    //  Filtre par statut
    private List<ProjectArticle> getFilteredList(Long projectId, String statut) {
        List<ProjectArticle> list = projectArticleRepository.findByProject_Id(projectId);

        System.out.println("=== ExportService.getFilteredList: total=" + list.size() + " statut=" + statut + " ===");

        if (statut == null || statut.isBlank() || statut.equalsIgnoreCase("TOUS")) {
            return list;
        }

        try {
            ProjectArticle.Statut statutEnum = ProjectArticle.Statut.valueOf(statut.trim().toUpperCase());
            List<ProjectArticle> filtered = list.stream()
                    .filter(pa -> pa.getStatut() == statutEnum)
                    .collect(Collectors.toList());
            System.out.println("=== après filtre [" + statutEnum + "] : " + filtered.size() + " articles ===");
            return filtered;
        } catch (IllegalArgumentException e) {
            System.out.println("=== statut inconnu [" + statut + "], pas de filtre ===");
            return list;
        }
    }

    // EXPORT BIBTEX
    public String exportBibtex(Long projectId, String statut) {
        List<ProjectArticle> list = getFilteredList(projectId, statut);

        StringBuilder sb = new StringBuilder();
        sb.append("% BibTeX export — BiblioApp\n");
        if (statut != null && !statut.isBlank() && !statut.equalsIgnoreCase("TOUS")) {
            sb.append("% Filtre statut : ").append(statut.toUpperCase()).append("\n");
        }
        sb.append("% Articles exportés : ").append(list.size()).append("\n\n");

        for (ProjectArticle pa : list) {
            Article a = pa.getArticle();
            String key = generateBibtexKey(a);
            String type = detectBibtexType(a);

            sb.append("@").append(type).append("{").append(key).append(",\n");

            if (a.getTitre() != null)
                sb.append("  title        = {").append(cleanBibtex(a.getTitre())).append("},\n");
            if (a.getAuteurs() != null)
                sb.append("  author       = {").append(cleanBibtex(a.getAuteurs())).append("},\n");
            if (a.getAnnee() != null)
                sb.append("  year         = {").append(a.getAnnee()).append("},\n");
            if (a.getJournal() != null && !a.getJournal().isEmpty())
                sb.append("  journal      = {").append(cleanBibtex(a.getJournal())).append("},\n");
            if (a.getDocumentType() != null && !a.getDocumentType().isEmpty())
                sb.append("  type         = {").append(cleanBibtex(a.getDocumentType())).append("},\n");
            if (a.getDoi() != null && !a.getDoi().isEmpty())
                sb.append("  doi          = {").append(a.getDoi()).append("},\n");
            if (a.getUrl() != null && !a.getUrl().isEmpty())
                sb.append("  url          = {").append(a.getUrl()).append("},\n");
            if (a.getNbCitations() != null)
                sb.append("  cited-by     = {").append(a.getNbCitations()).append("},\n");
            if (a.getResume() != null && !a.getResume().isEmpty())
                sb.append("  abstract     = {").append(cleanBibtex(a.getResume())).append("},\n");
            sb.append("  statut       = {").append(pa.getStatut().name()).append("},\n");
            if (pa.getNote() != null && !pa.getNote().isEmpty())
                sb.append("  annote       = {").append(cleanBibtex(pa.getNote())).append("},\n");

            // Supprimer la dernière virgule
            int lastComma = sb.lastIndexOf(",\n");
            if (lastComma != -1) sb.replace(lastComma, lastComma + 2, "\n");

            sb.append("}\n\n");
        }

        return sb.toString();
    }

    // EXPORT CSV
    public String exportCsv(Long projectId, String statut) {
        List<ProjectArticle> list = getFilteredList(projectId, statut);

        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF'); // BOM UTF-8

        sb.append("Titre;Auteurs;Annee;Journal;TypeDocument;DOI;URL;Citations;Resume;Statut;Note;DateAjout\n");

        for (ProjectArticle pa : list) {
            Article a = pa.getArticle();
            sb.append(csvField(a.getTitre())).append(";");
            sb.append(csvField(a.getAuteurs())).append(";");
            sb.append(a.getAnnee() != null ? a.getAnnee() : "").append(";");
            sb.append(csvField(a.getJournal())).append(";");
            sb.append(csvField(a.getDocumentType())).append(";");
            sb.append(csvField(a.getDoi())).append(";");
            sb.append(csvField(a.getUrl())).append(";");
            sb.append(a.getNbCitations() != null ? a.getNbCitations() : "").append(";");
            sb.append(csvField(a.getResume())).append(";");
            sb.append(csvField(pa.getStatut().name())).append(";");
            sb.append(csvField(pa.getNote())).append(";");
            sb.append(pa.getDateAjout() != null ? pa.getDateAjout().toLocalDate().toString() : "").append("\n");
        }

        return sb.toString();
    }

    // EXPORT RIS
    public String exportRis(Long projectId, String statut) {
        List<ProjectArticle> list = getFilteredList(projectId, statut);

        StringBuilder sb = new StringBuilder();

        for (ProjectArticle pa : list) {
            Article a = pa.getArticle();

            sb.append("TY  - ").append(mapDocumentTypeToRis(a.getDocumentType())).append("\n");

            if (a.getTitre() != null)
                sb.append("TI  - ").append(a.getTitre()).append("\n");
            if (a.getAuteurs() != null) {
                for (String author : a.getAuteurs().split(",")) {
                    sb.append("AU  - ").append(author.trim()).append("\n");
                }
            }
            if (a.getAnnee() != null)
                sb.append("PY  - ").append(a.getAnnee()).append("\n");
            if (a.getJournal() != null && !a.getJournal().isEmpty())
                sb.append("JO  - ").append(a.getJournal()).append("\n");
            if (a.getDocumentType() != null && !a.getDocumentType().isEmpty())
                sb.append("M3  - ").append(a.getDocumentType()).append("\n");
            if (a.getDoi() != null && !a.getDoi().isEmpty())
                sb.append("DO  - ").append(a.getDoi()).append("\n");
            if (a.getUrl() != null && !a.getUrl().isEmpty())
                sb.append("UR  - ").append(a.getUrl()).append("\n");
            if (a.getResume() != null && !a.getResume().isEmpty())
                sb.append("AB  - ").append(a.getResume()).append("\n");
            if (a.getNbCitations() != null)
                sb.append("N1  - Citations: ").append(a.getNbCitations()).append("\n");
            sb.append("N1  - Statut: ").append(pa.getStatut().name()).append("\n");
            if (pa.getNote() != null && !pa.getNote().isEmpty())
                sb.append("N2  - ").append(pa.getNote()).append("\n");
            if (pa.getDateAjout() != null)
                sb.append("DA  - ").append(pa.getDateAjout().toLocalDate()).append("\n");

            sb.append("ER  - \n\n");
        }

        return sb.toString();
    }

    // HELPERS
    private String generateBibtexKey(Article a) {
        String author = "unknown";
        if (a.getAuteurs() != null && !a.getAuteurs().isEmpty()) {
            String first = a.getAuteurs().split(",")[0].trim();
            String[] parts = first.split(" ");
            author = parts[parts.length - 1].toLowerCase().replaceAll("[^a-z]", "");
        }
        String year = a.getAnnee() != null ? String.valueOf(a.getAnnee()) : "0000";
        String title = "";
        if (a.getTitre() != null && a.getTitre().length() > 3) {
            title = a.getTitre().split(" ")[0].toLowerCase().replaceAll("[^a-z]", "");
        }
        return author + year + title;
    }

    private String detectBibtexType(Article a) {
        if (a.getDocumentType() == null) return "article";
        String dt = a.getDocumentType().toLowerCase();
        if (dt.contains("book")) return "book";
        if (dt.contains("thesis") || dt.contains("phd")) return "phdthesis";
        if (dt.contains("conference") || dt.contains("proceedings")) return "inproceedings";
        if (dt.contains("preprint")) return "unpublished";
        return "article";
    }

    private String mapDocumentTypeToRis(String documentType) {
        if (documentType == null) return "JOUR";
        String dt = documentType.toLowerCase();
        if (dt.contains("book")) return "BOOK";
        if (dt.contains("thesis")) return "THES";
        if (dt.contains("conference") || dt.contains("proceedings")) return "CONF";
        if (dt.contains("preprint")) return "UNPB";
        return "JOUR";
    }

    private String cleanBibtex(String text) {
        if (text == null) return "";
        return text.replace("{", "\\{").replace("}", "\\}").replace("&", "\\&");
    }

    private String csvField(String value) {
        if (value == null) return "";
        if (value.contains(";") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}