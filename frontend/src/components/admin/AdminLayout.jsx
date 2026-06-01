// src/components/admin/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faUsers, faPlug, faScrewdriverWrench,
  faScroll, faChevronLeft, faBookOpen,
  faUser, faChevronDown, faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/useAuth';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin',             icon: faChartLine,         label: 'Tableau de bord' },
  { path: '/admin/users',       icon: faUsers,             label: 'Utilisateurs'    },
  { path: '/admin/sources',     icon: faPlug,              label: 'Sources'         },
  { path: '/admin/maintenance', icon: faScrewdriverWrench, label: 'Maintenance'     },
  { path: '/admin/logs',        icon: faScroll,            label: 'Journaux'        },
];

const ROUTE_TITLES = {
  '/admin':             'Tableau de bord',
  '/admin/users':       'Utilisateurs',
  '/admin/sources':     'Sources connectées',
  '/admin/maintenance': 'Maintenance',
  '/admin/logs':        'Journaux système',
  '/admin/profil':      'Mon profil',
};

export default function AdminLayout() {
  const location                  = useLocation();
  const navigate                  = useNavigate();
  const { user, logout }          = useAuth();   // ← user depuis le contexte Auth
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);

  // ── Vérification du rôle admin ────────────────────────────
  const role    = user?.role ?? '';
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

  // Si pas connecté ou pas admin → redirection
  if (!user)    return <Navigate to="/"        replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'Admin';

  const handleLogout = () => {
    setShowMenu(false);
    logout();                  // vide le contexte + localStorage
    navigate('/');        // ← redirige vers login, pas unauthorized
  };

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <Link to="/admin" className="sidebar-brand">
          <span className="brand-icon"><FontAwesomeIcon icon={faBookOpen} /></span>
          {!collapsed && <span className="brand-name">BiblioApp</span>}
        </Link>

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

      {/* ── CONTENU ── */}
      <div className="admin-content-wrapper">
        <header className="admin-topbar">

          <div className="topbar-left">
            <span className="topbar-title">{pageTitle}</span>
          </div>

          <div className="topbar-right">
            
            {/* ── User menu — identique à la Navbar utilisateur ── */}
            <div className="topbar-user-menu">
              <div
                className="topbar-user-trigger"
                onClick={() => setShowMenu((s) => !s)}
              >
                <div className="topbar-user-avatar">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="topbar-user-details">
                  <span className="topbar-user-name">
                    {user?.prenom} {user?.nom}
                  </span>
                  <span className="topbar-user-role">Administrateur</span>
                </div>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`topbar-chevron ${showMenu ? 'open' : ''}`}
                />
              </div>

              {/* Dropdown */}
              {showMenu && (
                <>
                  <div className="topbar-overlay" onClick={() => setShowMenu(false)} />
                  <div className="topbar-dropdown">
                    <Link
                      to="/admin/profil"
                      className="topbar-dropdown-item"
                      onClick={() => setShowMenu(false)}
                    >
                      <FontAwesomeIcon icon={faUserShield} />
                      Mon profil
                    </Link>
                    <div className="topbar-dropdown-divider" />
                    <button
                      className="topbar-dropdown-item topbar-dropdown-logout"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
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