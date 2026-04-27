import api from './Api'

// Récupérer tous les projets d'un utilisateur
export const getProjectsByUser = async (userId) => {
    const response = await api.get(`/api/projets/utilisateur/${userId}`)
    return response.data
}

// Récupérer un projet par ID
export const getProjectById = async (projectId) => {
    const response = await api.get(`/api/projets/${projectId}`)
    return response.data
}

// Créer un projet
export const createProject = async (userId, nomProjet, description) => {
    const response = await api.post(`/api/projets/utilisateur/${userId}`, {
        nomProjet,
        description,
    })
    return response.data
}

// Modifier un projet
export const updateProject = async (projectId, nomProjet, description) => {
    const response = await api.put(`/api/projets/${projectId}`, {
        nomProjet,
        description,
    })
    return response.data
}

// Supprimer un projet
export const deleteProject = async (projectId) => {
    await api.delete(`/api/projets/${projectId}`)
}