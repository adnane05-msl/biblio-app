import api from './Api'

export const getStatistiques = async (projectId) => {
    const response = await api.get(`/api/statistiques/${projectId}`)
    return response.data
}