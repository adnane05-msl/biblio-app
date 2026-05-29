import api from './Api'

export const getPrismaData = async (projectId) => {
    // Plus besoin de lire localStorage — totalRecherche vient directement de la BDD
    const response = await api.get(`/api/dashboard/prisma/${projectId}`)
    return response.data
}