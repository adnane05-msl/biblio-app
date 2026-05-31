// frontend/src/services/SearchServices.js
import api from './Api'

// ── Recherche + sauvegarde auto dans historique ──
export const searchArticles = async (query, userId = null, maxResults = 50) => {
    const params = {
        query,
        crossref: true,
        openalex: true,
        arxiv: false,
        maxResults,
    }
    if (userId) params.userId = userId

    const response = await api.get('/api/recherche', { params })
    return response.data
}

// ── Récupérer l'historique d'un utilisateur ──
export const getHistorique = async (userId) => {
    const response = await api.get(`/api/recherche/historique/${userId}`)
    return response.data
}

// ── Supprimer une entrée de l'historique ──
export const deleteHistoriqueEntry = async (id) => {
    await api.delete(`/api/recherche/historique/${id}`)
}

// ── Vider tout l'historique ──
export const clearHistorique = async (userId) => {
    await api.delete(`/api/recherche/historique/utilisateur/${userId}`)
}