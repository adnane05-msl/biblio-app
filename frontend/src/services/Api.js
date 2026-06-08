import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:9090',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')  // ← lu EN PREMIER
        
        if (token) {
            config.headers = config.headers || {}
            config.headers['Authorization'] = `Bearer ${token}`  // ← assigné directement
        }
        
        console.log('Requête:', config.method?.toUpperCase(), config.url)
        console.log('Authorization:', config.headers['Authorization'])
        
        return config
    },
    (error) => Promise.reject(error)
)

// Intercepteur pour les réponses
api.interceptors.response.use(
    (response) => {
        console.log('Réponse:', response.status, response.config.url)
        return response
    },
    (error) => {
        console.error('Erreur:', error.response?.status, error.response?.data)
        return Promise.reject(error)
    }
)

export default api