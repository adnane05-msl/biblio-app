// src/pages/admin/AdminRoutes.jsx
// Configuration des routes du module admin.
// À intégrer dans votre App.jsx principal avec : <Route path="/admin/*" element={<AdminRoutes />} />

import { Routes, Route } from 'react-router-dom';
import AdminLayout      from '../../components/admin/AdminLayout';
import DashboardPage    from './DashboardPage';
import UsersPage        from './UsersPage';
import SourcesPage      from './SourcesPage';
import MaintenancePage  from './MaintenancePage';
import LogsPage         from './LogsPage';
import { AdminProvider } from '../../context/AdminContext';

export default function AdminRoutes() {
  return (
    <AdminProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index          element={<DashboardPage />}   />
          <Route path="users"   element={<UsersPage />}       />
          <Route path="sources" element={<SourcesPage />}     />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="logs"    element={<LogsPage />}        />
        </Route>
      </Routes>
    </AdminProvider>
  );
}