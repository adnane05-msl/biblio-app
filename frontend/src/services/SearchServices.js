import api from './Api'

export const searchArticles = async (query, sources = {
    crossref: true,
    openalex: true,
    arxiv: false
}) => {
    const response = await api.get('/api/recherche', {
        params: {
            query,
            crossref: sources.crossref,
            openalex: sources.openalex,
            arxiv: sources.arxiv,
        }
    })
    return response.data
}