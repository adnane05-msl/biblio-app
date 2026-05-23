import api from './Api'

// Sauvegarder un article dans un projet (unitaire - gardé pour compatibilité)
export const saveArticleToProject = async (article, projectId) => {
    const response = await api.post('/api/projet-articles/save', {
        projectId,
        titre: article.title,
        auteurs: article.authors,
        annee: article.year,
        doi: article.doi,
        resume: article.abstractText,
        url: article.url,
        nbCitations: article.citations,
        source: article.source,
        journal: article.journal,
        documentType: article.documentType,
    })
    return response.data
}

// NOUVEAU : Sauvegarder plusieurs articles en une seule requête
// Cela évite les race conditions qui causaient les articles perdus
export const saveArticlesToProject = async (articles, projectId) => {
    const payload = {
        projectId,
        articles: articles.map(article => ({
            projectId,
            titre: article.title,
            auteurs: article.authors,
            annee: article.year,
            doi: article.doi,
            resume: article.abstractText,
            url: article.url,
            nbCitations: article.citations,
            source: article.source,
            journal: article.journal,
            documentType: article.documentType,
        }))
    }
    const response = await api.post('/api/projet-articles/save-batch', payload)
    return response.data
    // Retourne : { total, saved, existing, failed, errors }
}

// Récupérer les articles d'un projet
export const getArticlesByProject = async (projectId) => {
    const response = await api.get(`/api/projet-articles/project/${projectId}`)
    return response.data
}

// Changer le statut d'un article
export const updateArticleStatut = async (projectArticleId, statut) => {
    const response = await api.put(
        `/api/projet-articles/${projectArticleId}/statut`,
        { statut })
    return response.data
}

// Modifier la note d'un article
export const updateArticleNote = async (projectArticleId, note) => {
    const response = await api.put(
        `/api/projet-articles/${projectArticleId}/note`,
        { note })
    return response.data
}

// Supprimer un article d'un projet
export const removeArticleFromProject = async (projectArticleId) => {
    await api.delete(`/api/projet-articles/${projectArticleId}`)
}

// Déduplication d'articles dans un projet
export const deduplicateProject = async (projectId) => {
    const response = await api.post(
        `/api/projet-articles/project/${projectId}/deduplicate`
    )
    return response.data
}