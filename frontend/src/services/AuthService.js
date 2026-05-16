import api from './Api'

export const register = async (nom, prenom, email, motDePasse, profil) => {
    const response = await api.post('/api/authentification/inscription', {
        nom,
        prenom,
        email,
        motDePasse,
        profil,
    })
    return response.data
}

export const login = async (email, motDePasse) => {
    const response = await api.post('/api/authentification/SeConnecter', {
        email,
        motDePasse,
    })
    return response.data
}