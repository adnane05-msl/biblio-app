import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import './SearchPage.css'

function SearchPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div className="search-container">
            <h1 className="search-title">
                Bienvenue {user?.prenom} {user?.nom}
            </h1>
            {/* <p className="search-subtitle">Module de recherche — à venir</p> */}
            <button className="btn-logout" onClick={handleLogout}>
                Se déconnecter
            </button>
        </div>
    )
}

export default SearchPage