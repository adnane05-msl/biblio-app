package com.biblio.backend.service;

import com.biblio.backend.dto.SaveArticleRequest;
import com.biblio.backend.model.Article;
import com.biblio.backend.model.Project;
import com.biblio.backend.model.ProjectArticle;
import com.biblio.backend.repository.ArticleRepository;
import com.biblio.backend.repository.ProjectArticleRepository;
import com.biblio.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class BatchSaveService {

    private final ProjectRepository projectRepository;
    private final ProjectArticleRepository projectArticleRepository;
    private final ArticleRepository articleRepository;

    public BatchSaveService(ProjectRepository projectRepository,
                            ProjectArticleRepository projectArticleRepository,
                            ArticleRepository articleRepository) {
        this.projectRepository = projectRepository;
        this.projectArticleRepository = projectArticleRepository;
        this.articleRepository = articleRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveOne(Long projectId, SaveArticleRequest req) {
        Project project = projectRepository.getReferenceById(projectId);

        String titre = req.getTitre() != null ? req.getTitre().trim() : null;
        if (titre == null || titre.isEmpty()) {
            titre = "Article sans titre #" + UUID.randomUUID().toString().substring(0, 8);
        }
        String doi = req.getDoi() != null ? req.getDoi().trim() : null;

        Article article = new Article();
        article.setTitre(cut(titre, 2000));
        article.setDoi(doi != null && !doi.isEmpty() ? cut(doi, 500) : null);
        article.setAuteurs(cut(req.getAuteurs(), 2000));
        article.setAnnee(req.getAnnee());
        article.setJournal(cut(req.getJournal(), 500));
        article.setDocumentType(cut(req.getDocumentType(), 100));
        article.setSourceNom(cut(req.getSource(), 100));
        article.setResume(cut(req.getResume(), 5000));
        article.setUrl(cut(req.getUrl(), 2000));
        article.setNbCitations(req.getNbCitations());
        article = articleRepository.save(article);

        ProjectArticle pa = new ProjectArticle();
        pa.setProject(project);
        pa.setArticle(article);
        pa.setStatut(ProjectArticle.Statut.A_LIRE);
        projectArticleRepository.save(pa);
    }

    private String cut(String s, int max) {
        if (s == null) return null;
        s = s.trim();
        return s.length() > max ? s.substring(0, max) : s;
    }
}