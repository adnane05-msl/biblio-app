// src/components/admin/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faUsers, faPlug,
  faScroll, faChevronLeft, faScrewdriverWrench
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/useAuth';
import Navbar from '../Navbar/Navbar';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin',             icon: faChartLine,         label: 'Tableau de bord' },
  { path: '/admin/users',       icon: faUsers,             label: 'Utilisateurs'    },
  { path: '/admin/sources',     icon: faPlug,              label: 'Sources'         },
  { path: '/admin/maintenance', icon: faScrewdriverWrench, label: 'Maintenance' },
  { path: '/admin/logs',        icon: faScroll,            label: 'Journaux'        },
];

export default function AdminLayout() {
  const location                  = useLocation();
  const { user }                  = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // ── Vérification du rôle admin ────────────────────────────
  const role    = user?.role ?? '';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

  if (!user)    return <Navigate to="/"            replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="admin-page-wrapper">

      {/* ── NAVBAR GLOBALE ── */}
      <Navbar />

      {/* ── BODY : sidebar + contenu ── */}
      <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>

        {/* ── SIDEBAR ── */}
        <aside className="admin-sidebar">

          <nav className="sidebar-nav">
            {!collapsed && <span className="nav-section-label">Navigation</span>}
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon"><FontAwesomeIcon icon={item.icon} /></span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button
              className="collapse-btn"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Développer' : 'Réduire'}
            >
              <span className="collapse-icon"><FontAwesomeIcon icon={faChevronLeft} /></span>
              {!collapsed && <span className="collapse-label">Réduire</span>}
            </button>
          </div>
        </aside>

        {/* ── CONTENU PRINCIPAL ── */}
        <div className="admin-content-wrapper">
          <main className="admin-main">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}