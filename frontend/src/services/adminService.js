// src/services/adminService.js
// Toutes les fonctions d'appel API pour le module admin.

import apiClient from './apiClient';

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
export const getDashboard = () =>
  apiClient.get('/api/admin/dashboard').then((r) => r.data);

// ═══════════════════════════════════════════════════════════════
// UTILISATEURS
// ═══════════════════════════════════════════════════════════════
export const getUsers = (query = '') =>
  apiClient.get('/api/admin/users', { params: query ? { q: query } : {} }).then((r) => r.data);

export const getUserStats = () =>
  apiClient.get('/api/admin/users/stats').then((r) => r.data);

export const getUserById = (id) =>
  apiClient.get(`/api/admin/users/${id}`).then((r) => r.data);

export const createUser = (data) =>
  apiClient.post('/api/admin/users', data).then((r) => r.data);

export const updateUser = (id, data) =>
  apiClient.put(`/api/admin/users/${id}`, data).then((r) => r.data);

export const desactiverUser = (id) =>
  apiClient.patch(`/api/admin/users/${id}/desactiver`);

export const supprimerUser = (id) =>
  apiClient.delete(`/api/admin/users/${id}`);

// ═══════════════════════════════════════════════════════════════
// SOURCES
// ═══════════════════════════════════════════════════════════════
export const getSources = () =>
  apiClient.get('/api/admin/sources').then((r) => r.data);

export const createSource = (data) =>
  apiClient.post('/api/admin/sources', data).then((r) => r.data);

export const updateSource = (id, data) =>
  apiClient.put(`/api/admin/sources/${id}`, data).then((r) => r.data);

export const rafraichirSource = (id) =>
  apiClient.post(`/api/admin/sources/${id}/rafraichir`).then((r) => r.data);

export const changerStatutSource = (id, statut) =>
  apiClient.patch(`/api/admin/sources/${id}/statut`, null, { params: { statut } }).then((r) => r.data);

export const supprimerSource = (id) =>
  apiClient.delete(`/api/admin/sources/${id}`);

// ═══════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════
export const getLogs = (type = null) =>
  apiClient.get('/api/admin/logs', { params: type ? { type } : {} }).then((r) => r.data);

// ── MAINTENANCE ──────────────────────────────────────────────
export const testerSource = (id) =>
  apiClient.post(`/api/admin/maintenance/tester-source/${id}`).then((r) => r.data);

export const viderHistorique = () =>
  apiClient.delete('/api/admin/maintenance/vider-historique').then((r) => r.data);

// Vider le cache de l'application

export const viderCache = () =>
  apiClient.post('/api/admin/maintenance/vider-cache').then((r) => r.data);
