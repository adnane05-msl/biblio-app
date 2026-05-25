import api from './Api'

export const getPrismaData = async (projectId) => {
    const response = await api.get(`/api/dashboard/prisma/${projectId}`)
    return response.data
}