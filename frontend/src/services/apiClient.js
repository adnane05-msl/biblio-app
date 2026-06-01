// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '', 
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injection du token JWT dans chaque requête
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion centralisée des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new Error('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 9090.')
      );
    }

    const status = error.response.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    if (status === 403) {
      return Promise.reject(
        new Error("Accès refusé (403). Votre compte n'a pas les droits ADMIN nécessaires.")
      );
    }

    if (status === 404) {
      return Promise.reject(new Error(`Ressource non trouvée (404) : ${error.config?.url}`));
    }

    if (status >= 500) {
      return Promise.reject(new Error(`Erreur serveur (${status}). Consultez les logs du backend.`));
    }

    const backendMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message;

    return Promise.reject(new Error(backendMessage));
  }
);

export default apiClient;