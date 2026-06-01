// src/services/apiClient.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:9090';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur requête : injection du token JWT ─────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Intercepteur réponse : gestion centralisée des erreurs ───────────────────
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    // FIX : distinction claire entre erreur réseau et erreurs HTTP
    if (!error.response) {
      // Pas de réponse du serveur (backend arrêté, CORS bloqué, timeout)
      return Promise.reject(
        new Error(
          'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 9090.'
        )
      );
    }

    const status = error.response.status;

    if (status === 401) {
      // Token expiré ou invalide → on nettoie et on redirige
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    if (status === 403) {
      // Token présent mais rôle insuffisant (ex: non-admin accède à /api/admin/**)
      // On NE redirige PAS automatiquement pour laisser les pages afficher un message clair
      return Promise.reject(
        new Error(
          "Accès refusé (403). Votre compte n'a pas les droits ADMIN nécessaires. " +
          "Assurez-vous que votre rôle en base de données est 'ROLE_ADMIN'."
        )
      );
    }

    if (status === 404) {
      return Promise.reject(new Error(`Ressource non trouvée (404) : ${error.config?.url}`));
    }

    if (status >= 500) {
      return Promise.reject(
        new Error(`Erreur serveur (${status}). Consultez les logs du backend.`)
      );
    }

    // Autres erreurs HTTP : on remonte le message du backend si disponible
    const backendMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message;

    return Promise.reject(new Error(backendMessage));
  }
);

export default apiClient;