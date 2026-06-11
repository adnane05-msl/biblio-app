// frontend/src/services/SearchServices.js
import api from './Api'

// ── Recherche articles depuis les APIs externes ───────────────────────────
export const searchArticles = async (query, maxResults = 50) => {
    const response = await api.get('/api/recherche', {
        params: { query, crossref: true, openalex: true, arxiv: false, maxResults }
    })
    return response.data
}

// ── Sauvegarder dans l'historique avec résultats JSON ────────────────────
// resultatsJson = JSON.stringify(validArticles) → cache persistant en BDD
export const saveHistorique = async (query, userId, nbResultats, resultatsJson) => {
    await api.post('/api/recherche/historique', {
        query,
        userId,
        nbResultats,
        resultatsJson,
    })
}

// ── Récupérer l'historique (inclut resultatsJson pour cache) ─────────────
export const getHistorique = async (userId) => {
    const response = await api.get(`/api/recherche/historique/${userId}`)
    return response.data
}