import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBookOpen, faChevronDown, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import './Navbar.css'

function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    const [showMenu, setShowMenu] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Ferme le menu mobile après un clic sur un lien
    const closeMobile = () => setMobileOpen(false)

    if (!user) return null

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <FontAwesomeIcon icon={faBookOpen} /> BiblioApp
            </div>

            {/* Bouton burger — visible uniquement sur mobile via le CSS */}
            <button
                className="navbar-burger"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
            >
                <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
            </button>

            <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
                <Link to="/" onClick={closeMobile}
                    className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    Accueil
                </Link>
                <Link to="/search" onClick={closeMobile}
                    className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
                    Recherche
                </Link>
                <Link to="/projects" onClick={closeMobile}
                    className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
                    Mes Projets
                </Link>

                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                    <Link to="/admin" onClick={closeMobile}
                        className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                        Espace Admin
                    </Link>
                )}
            </div>

            <div className="navbar-user">
                <div
                    className="user-menu-trigger"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <div className="user-avatar">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="user-details">
                        <span className="user-name">
                            {user?.prenom} {user?.nom}
                        </span>
                        <span className="user-profil">
                            {user?.profil || 'Profil'}
                        </span>
                    </div>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`chevron ${showMenu ? 'open' : ''}`}
                    />
                </div>

                {showMenu && (
                    <div className="user-dropdown">
                        <Link
                            to="/profil"
                            className="dropdown-item"
                            onClick={() => setShowMenu(false)}
                        >
                            <FontAwesomeIcon icon={faUser} />
                            Mon profil
                        </Link>
                        <div className="dropdown-divider" />
                        <button
                            className="dropdown-item dropdown-logout"
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar