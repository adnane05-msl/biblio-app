import api from './Api'

// ── Sauvegarde unitaire (gardé pour compatibilité) ──────────────────────────
export const saveArticleToProject = async (article, projectId) => {
    const response = await api.post('/api/projet-articles/save', {
        projectId,
        titre:        article.title,
        auteurs:      article.authors,
        annee:        article.year,
        doi:          article.doi,
        resume:       article.abstractText,
        url:          article.url,
        nbCitations:  article.citations,
        source:       article.source,
        journal:      article.journal,
        documentType: article.documentType,
    })
    return response.data
}

export const saveArticlesToProject = async (articles, projectId, totalRecherche = 0, query = '') => {
    const payload = {
        projectId,
        totalRecherche,
        query,                   // ← NOUVEAU
        articles: articles.map(article => ({
            projectId,
            titre:        article.title,
            auteurs:      article.authors,
            annee:        article.year,
            doi:          article.doi,
            resume:       article.abstractText,
            url:          article.url,
            nbCitations:  article.citations,
            source:       article.source,
            journal:      article.journal,
            documentType: article.documentType,
        }))
    }
    const response = await api.post('/api/projet-articles/save-batch', payload)
    return response.data
}

// ── Autres fonctions (inchangées) ────────────────────────────────────────────
export const getArticlesByProject = async (projectId) => {
    const response = await api.get(`/api/projet-articles/project/${projectId}`)
    return response.data
}

export const updateArticleStatut = async (projectArticleId, statut) => {
    const response = await api.put(
        `/api/projet-articles/${projectArticleId}/statut`,
        { statut })
    return response.data
}

export const updateArticleNote = async (projectArticleId, note) => {
    const response = await api.put(
        `/api/projet-articles/${projectArticleId}/note`,
        { note })
    return response.data
}

export const removeArticleFromProject = async (projectArticleId) => {
    await api.delete(`/api/projet-articles/${projectArticleId}`)
}

export const deduplicateProject = async (projectId) => {
    const response = await api.post(
        `/api/projet-articles/project/${projectId}/deduplicate`
    )
    return response.data
}