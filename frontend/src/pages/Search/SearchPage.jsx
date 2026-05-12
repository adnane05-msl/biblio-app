import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { searchArticles } from '../../services/SearchServices'
import { getProjectsByUser } from '../../services/ProjectServices'
import Navbar from '../../components/Navbar/Navbar'
import SearchBar from '../../components/Search/SearchBar'
import ArticleCard from '../../components/Search/ArticleCard'
import { saveArticleToProject } from '../../services/ProjectArticleServices'
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
    const [publisherFilter, setPublisherFilter] = useState('TOUS')
    const [publishers, setPublishers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const ARTICLES_PER_PAGE = 10

    // Charger les projets de l'utilisateur
    useEffect(() => {
        if (user?.id) {
            getProjectsByUser(user.id)
                .then(data => setProjects(data))
                .catch(() => {})
        }
    }, [user])

    const handleSearch = async (query) => {
        setLoading(true)
        setError('')
        setHasSearched(true)
        setArticles([])
        setCurrentPage(1)


        try {
            const data = await searchArticles(query)
            setArticles(data)

            const uniquePublishers = [
                ...new Set(
                    data
                        .map(a => a.publisher)
                        .filter(p => p && p.trim() !== '')
                )
            ].sort()
            setPublishers(uniquePublishers)
            setPublisherFilter('TOUS')
            setCurrentPage(1)
        } catch{
            setError('Erreur lors de la recherche. Vérifiez votre connexion.')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (article, projectId) => {
    try {
        await saveArticleToProject(article, projectId)
        setSuccess('✅ Article sauvegardé dans le projet !')
        setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
        const msg = err.response?.data?.message
        if (msg === 'Article déjà sauvegardé dans ce projet') {
            setError('⚠️ Cet article est déjà dans ce projet !')
        } else {
            setError('Erreur lors de la sauvegarde')
        }
        setTimeout(() => setError(''), 3000)
    }
    }

    // Articles filtrés par publisher
    const filteredArticles = publisherFilter === 'TOUS'
        ? articles
        : articles.filter(a => a.publisher === publisherFilter)

    
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ARTICLES_PER_PAGE,
        currentPage * ARTICLES_PER_PAGE
    )

    const getPageNumbers = (current, total) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }
    if (current <= 3) {
        return [1, 2, 3, 4, '...', total]
    }
    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total]
    }
    return [1, '...', current - 1, current, current + 1, '...', total]
    }



    return (
        <div className="search-page">
            <Navbar />

            <div className="search-container">

                {/* En-tête */}
                <div className="search-header">
                    <h1 className="search-title"><FontAwesomeIcon icon={faMagnifyingGlass} className='icon'/> Recherche d'articles</h1>
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

                {/* Filtre par publisher */}
                {publishers.length > 0 && (
                    <div className="publisher-filter">
                        <span className="publisher-filter-label">
                            🏢 Éditeur :
                        </span>
                        <div className="publisher-filter-scroll">
                            <button
                                className={`publisher-btn ${publisherFilter === 'TOUS' ? 'active' : ''}`}
                                onClick={() => setPublisherFilter('TOUS')}
                            >
                                Tous ({articles.length})
                            </button>
                            {publishers.map(publisher => (
                                <button
                                    key={publisher}
                                    className={`publisher-btn ${publisherFilter === publisher ? 'active' : ''}`}
                                    onClick={() => setPublisherFilter(publisher)}
                                >
                                    {publisher.length > 30
                                        ? publisher.substring(0, 30) + '...'
                                        : publisher}
                                    <span className="publisher-count">
                                        {articles.filter(a =>
                                            a.publisher === publisher).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Page {currentPage} sur {totalPages}
                            <span className="pagination-total">
                                ({filteredArticles.length} articles)
                            </span>
                        </div>

                        <div className="pagination-controls">
                            {/* Bouton Première page */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(1)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === 1}
                                title="Première page"
                            >
                                «
                            </button>

                            {/* Bouton Précédent */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(p => p - 1)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === 1}
                                title="Page précédente"
                            >
                                ‹
                            </button>

                            {/* Numéros de pages */}
                            {getPageNumbers(currentPage, totalPages).map((page, index) =>
                                page === '...' ? (
                                    <span key={`dots-${index}`} className="page-dots">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => {
                                            setCurrentPage(page)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            {/* Bouton Suivant */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(p => p + 1)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === totalPages}
                                title="Page suivante"
                            >
                                ›
                            </button>

                            {/* Bouton Dernière page */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(totalPages)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === totalPages}
                                title="Dernière page"
                            >
                                »
                            </button>
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
                        {paginatedArticles.map((article, index) => (
                            <ArticleCard
                                key={`${article.doi || article.title}-${index}`}
                                article={article}
                                onSave={handleSave}
                                projects={projects}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Page {currentPage} sur {totalPages}
                            <span className="pagination-total">
                                ({filteredArticles.length} articles)
                            </span>
                        </div>

                        <div className="pagination-controls">
                            {/* Bouton Première page */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(1)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === 1}
                                title="Première page"
                            >
                                «
                            </button>

                            {/* Bouton Précédent */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(p => p - 1)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === 1}
                                title="Page précédente"
                            >
                                ‹
                            </button>

                            {/* Numéros de pages */}
                            {getPageNumbers(currentPage, totalPages).map((page, index) =>
                                page === '...' ? (
                                    <span key={`dots-${index}`} className="page-dots">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => {
                                            setCurrentPage(page)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            {/* Bouton Suivant */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(p => p + 1)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === totalPages}
                                title="Page suivante"
                            >
                                ›
                            </button>

                            {/* Bouton Dernière page */}
                            <button
                                className="page-btn page-nav"
                                onClick={() => {
                                    setCurrentPage(totalPages)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === totalPages}
                                title="Dernière page"
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPage