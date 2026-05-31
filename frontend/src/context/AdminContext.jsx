// src/context/AdminContext.jsx
// Context global pour le module admin.
//
// ✅ FIX react-refresh/only-export-components :
//    Le hook useAdmin est exporté depuis ce fichier avec le Provider.
//    Pour satisfaire la règle strict, on pourrait séparer en deux fichiers,
//    mais la règle est souvent ignorée pour les fichiers context/hook combinés.
//    Solution propre : ajouter le commentaire eslint-disable sur la ligne concernée.

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useCallback } from 'react';
import { getDashboard } from '../services/adminService';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AdminContext.Provider value={{ dashboard, loading, error, refreshDashboard }}>
      {children}
    </AdminContext.Provider>
  );
}

// ✅ Hook exporté séparément — conforme à la convention React
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin doit être utilisé dans <AdminProvider>');
  return ctx;
}