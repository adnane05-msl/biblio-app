import api from './Api'

export const getDashboard = async (projectId) => {
    const response = await api.get(`/api/dashboard/${projectId}`)
    return response.data
}