import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

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

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                BiblioApp
            </div>

            <div className="navbar-links">
                <Link
                    to="/search"
                    className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                >
                    Recherche
                </Link>
                <Link
                    to="/projects"
                    className={`nav-link ${isActive('/projects') ? 'active' : ''}`}
                >
                    Mes Projets
                </Link>
            </div>

            <div className="navbar-user">
                <span className="user-info">
                    <FontAwesomeIcon icon={faUser} /> {user?.prenom} {user?.nom}
                </span>
                <span className="user-specialite">
                    {user?.specialite}
                </span>
                <button className="btn-logout" onClick={handleLogout}>
                    Déconnexion
                </button>
            </div>
        </nav>
    )
}

export default Navbar