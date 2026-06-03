import { Routes, Route } from 'react-router-dom';
import AdminLayout      from '../../components/admin/AdminLayout';
import DashboardPage    from './DashboardAdminPage';
import UsersPage        from './UsersPage';
import SourcesPage      from './SourcesPage';
import LogsPage         from './LogsPage';
import MaintenancePage   from './MaintenancePage';
import AdminProfilPage  from './AdminProfilPage';
import { AdminProvider } from '../../context/AdminContext';

export default function AdminRoutes() {
  return (
    <AdminProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index              element={<DashboardPage />}   />
          <Route path="users"       element={<UsersPage />}       />
          <Route path="sources"     element={<SourcesPage />}     />
          <Route path="logs"        element={<LogsPage />}        />
          <Route path="profil"      element={<AdminProfilPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>
      </Routes>
    </AdminProvider>
  );
}