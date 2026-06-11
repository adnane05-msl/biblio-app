import api from './Api'

// ── Récupérer tous les membres d'un projet ────────────────────────────────
export const getMembres = async (projetId) => {
    const response = await api.get(`/api/collaboration/${projetId}/membres`)
    return response.data
}

// ── Inviter un utilisateur par email ─────────────────────────────────────
export const inviterMembre = async (projetId, email, role) => {
    const response = await api.post(`/api/collaboration/${projetId}/inviter`, {
        projetId,
        email,
        role,
    })
    return response.data
}

// ── Modifier le rôle d'un membre ──────────────────────────────────────────
export const modifierRole = async (membreId, role) => {
    const response = await api.put(`/api/collaboration/membres/${membreId}/role`, { role })
    return response.data
}

// ── Retirer un membre du projet ───────────────────────────────────────────
export const retirerMembre = async (membreId) => {
    await api.delete(`/api/collaboration/membres/${membreId}`)
}

// ── Récupérer le rôle de l'utilisateur connecté dans un projet ────────────
export const getMonRole = async (projetId, userId) => {
    const response = await api.get(`/api/collaboration/${projetId}/mon-role/${userId}`)
    return response.data.role  // "PROPRIETAIRE" | "EDITEUR" | "LECTEUR" | "AUCUN"
}

// ── Récupérer les IDs des projets partagés avec l'utilisateur ────────────
export const getProjetsPartages = async (userId) => {
    const response = await api.get(`/api/collaboration/partages/${userId}`)
    return response.data  // tableau de Long
}