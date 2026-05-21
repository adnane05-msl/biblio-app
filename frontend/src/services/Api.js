import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:9090',  // Gardez 9090
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
    (config) => {
        console.log('📤 Requête:', config.method?.toUpperCase(), config.url);
        console.log('📤 Data:', config.data);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
    (response) => {
        console.log('📥 Réponse:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Erreur:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default api;