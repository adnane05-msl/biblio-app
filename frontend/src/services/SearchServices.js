import api from './Api'

export const searchArticles = async (query, maxResults = 50) => {
    const response = await api.get('/api/recherche', {
        params: {
            query,
            crossref: true,    // ← toujours true
            openalex: true,    // ← toujours true
            arxiv: false,      // ← toujours false
            maxResults,
        }
    })
    return response.data
}