// src/components/admin/AdminLayout.jsx
// Layout principal du module admin : sidebar + zone de contenu.

import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin',              icon: '📊', label: 'Tableau de bord' },
  { path: '/admin/users',        icon: '👥', label: 'Utilisateurs'    },
  { path: '/admin/sources',      icon: '🔗', label: 'Sources'         },
  { path: '/admin/maintenance',  icon: '🔧', label: 'Maintenance'     },
  { path: '/admin/logs',         icon: '📋', label: 'Journaux'        },
];

export default function AdminLayout() {
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Vérification du rôle (remplacer par votre logique auth)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'ROLE_ADMIN') return <Navigate to="/unauthorized" replace />;

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📚</span>
          {!collapsed && <span className="brand-name">BibAdmin</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Réduire le menu"
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* ── Contenu principal ─────────────────────────────────────── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}