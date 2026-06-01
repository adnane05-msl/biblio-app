// src/components/admin/AdminLayout.jsx
// Layout admin avec icônes Font Awesome

import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUsers,
  faPlug,
  faScrewdriverWrench,
  faScroll,
  faChevronLeft,
  faCircleCheck,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin',             icon: faChartLine,          label: 'Tableau de bord' },
  { path: '/admin/users',       icon: faUsers,              label: 'Utilisateurs'    },
  { path: '/admin/sources',     icon: faPlug,               label: 'Sources'         },
  { path: '/admin/maintenance', icon: faScrewdriverWrench,  label: 'Maintenance'     },
  { path: '/admin/logs',        icon: faScroll,             label: 'Journaux'        },
];

const ROUTE_TITLES = {
  '/admin':             'Tableau de bord',
  '/admin/users':       'Utilisateurs',
  '/admin/sources':     'Sources connectées',
  '/admin/maintenance': 'Maintenance',
  '/admin/logs':        'Journaux système',
};

function initials(nom = '') {
  return nom.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';
}

export default function AdminLayout() {
  const location              = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'ROLE_ADMIN') return <Navigate to="/unauthorized" replace />;

  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'Admin';

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <Link to="/admin" className="sidebar-brand">
          <span className="brand-icon">
            <FontAwesomeIcon icon={faBookOpen} />
          </span>
          {!collapsed && <span className="brand-name">BiblioApp</span>}
        </Link>

        {/* Navigation */}
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
                <span className="nav-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer collapse */}
        <div className="sidebar-footer">
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'}
          >
            <span className="collapse-icon">
              <FontAwesomeIcon icon={faChevronLeft} />
            </span>
            {!collapsed && <span className="collapse-label">Réduire</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          CONTENU
      ══════════════════════════════════════ */}
      <div className="admin-content-wrapper">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <span className="topbar-title">{pageTitle}</span>
          </div>

          <div className="topbar-right">
            <div className="topbar-status">
              <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#10b981' }} />
              Système opérationnel
            </div>
            <div
              className="topbar-avatar"
              title={`${user.nom ?? 'Administrateur'} — ${user.email ?? ''}`}
            >
              {initials(user.nom ?? 'Admin')}
            </div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}