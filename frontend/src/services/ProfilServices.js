import api from './Api'

export const getUserById = async (id) => {
    const response = await api.get(`/api/utilisateurs/${id}`)
    return response.data
}

export const updateProfil = async (id, nom, prenom, profil) => {
    const response = await api.put(
        `/api/utilisateurs/${id}/profil`,
        { nom, prenom, profil }
    )
    return response.data
}

export const changePassword = async (
        id, ancienMotDePasse, nouveauMotDePasse) => {
    const response = await api.put(
        `/api/utilisateurs/${id}/password`,
        { ancienMotDePasse, nouveauMotDePasse }
    )
    return response.data
}