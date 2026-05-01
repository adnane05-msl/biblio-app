import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { searchArticles } from '../../services/SearchServices'
import { getProjectsByUser } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import SearchBar from '../../components/Search/SearchBar'
import ArticleCard from '../../components/Search/ArticleCard'
import './SearchPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

function SearchPage() {
    const { user } = useAuth()

    const [articles, setArticles] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    const [stats, setStats] = useState({
        total: 0, crossref: 0, openalex: 0, arxiv: 0
    })

    // Charger les projets de l'utilisateur
    useEffect(() => {
        if (user?.id) {
            getProjectsByUser(user.id)
                .then(data => setProjects(data))
                .catch(() => {})
        }
    }, [user])

    const handleSearch = async (query, sources) => {
        setLoading(true)
        setError('')
        setHasSearched(true)
        setArticles([])

        try {
            const data = await searchArticles(query, sources)
            setArticles(data)

            // Calculer les stats par source
            setStats({
                total: data.length,
                crossref: data.filter(a => a.source === 'Crossref').length,
                openalex: data.filter(a => a.source === 'OpenAlex').length,
                arxiv: data.filter(a => a.source === 'arXiv').length,
            })
        } catch{
            setError('Erreur lors de la recherche. Vérifiez votre connexion.')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = (_article, projectId) => {
        setSuccess(`Article sauvegardé dans le projet !`)
        setTimeout(() => setSuccess(''), 3000)
    }

    return (
        <div className="search-page">
            <Navbar />

            <div className="search-container">
                {/* En-tête */}
                <div className="search-header">
                    <h1 className="search-title"><FontAwesomeIcon icon={faMagnifyingGlass} /> Recherche d'articles</h1>
                    <p className="search-subtitle">
                        Recherchez dans Crossref, OpenAlex et arXiv simultanément
                    </p>
                </div>

                {/* Barre de recherche */}
                <SearchBar onSearch={handleSearch} loading={loading} />

                {/* Messages */}
                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">{success}</div>
                )}

                {/* Stats après recherche */}
                {hasSearched && !loading && (
                    <div className="search-stats">
                        <div className="stat-item stat-total">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-item stat-crossref">
                            <span className="stat-number">{stats.crossref}</span>
                            <span className="stat-label">Crossref</span>
                        </div>
                        <div className="stat-item stat-openalex">
                            <span className="stat-number">{stats.openalex}</span>
                            <span className="stat-label">OpenAlex</span>
                        </div>
                        <div className="stat-item stat-arxiv">
                            <span className="stat-number">{stats.arxiv}</span>
                            <span className="stat-label">arXiv</span>
                        </div>
                    </div>
                )}

                {/* État de chargement */}
                {loading && (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Recherche en cours sur toutes les sources...</p>
                    </div>
                )}

                {/* État vide — avant recherche */}
                {!hasSearched && !loading && (
                    <div className="empty-state">
                        <p className="empty-icon">🔬</p>
                        <p className="empty-title">Prêt à rechercher</p>
                        <p className="empty-subtitle">
                            Entrez des mots-clés pour trouver des articles scientifiques
                        </p>
                    </div>
                )}

                {/* Aucun résultat */}
                {hasSearched && !loading && articles.length === 0 && (
                    <div className="empty-state">
                        <p className="empty-icon">📭</p>
                        <p className="empty-title">Aucun résultat trouvé</p>
                        <p className="empty-subtitle">
                            Essayez avec d'autres mots-clés ou activez plus de sources
                        </p>
                    </div>
                )}

                {/* Liste des articles */}
                {articles.length > 0 && (
                    <div className="articles-list">
                        {articles.map((article, index) => (
                            <ArticleCard
                                key={`${article.doi || article.title}-${index}`}
                                article={article}
                                onSave={handleSave}
                                projects={projects}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPage