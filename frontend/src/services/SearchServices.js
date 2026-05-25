import api from './Api'

export const searchArticles = async (query, maxResults = 50) => {
    const response = await api.get('/api/recherche', {
        params: {
            query,
            crossref: true, 
            openalex: true, 
            arxiv: false,
            maxResults,
        }
    })
    return response.data
}