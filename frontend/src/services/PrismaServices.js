import api from './Api'

export const getPrismaData = async (projectId) => {
    const lastSearchCount = parseInt(localStorage.getItem('lastSearchCount') || '0')
    const response = await api.get(`/api/dashboard/prisma/${projectId}`, {
        params: { totalRecherche: lastSearchCount }
    })
    return response.data
}