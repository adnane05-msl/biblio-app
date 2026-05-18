import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { searchArticles } from '../../services/SearchServices'
import { getProjectsByUser } from '../../services/ProjectServices'
import { saveArticleToProject } from '../../services/ProjectArticleServices'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import SearchBar from '../../components/Search/SearchBar'
import ArticleCard from '../../components/Search/ArticleCard'
import './SearchPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSort,
    faCalendar, faFile,
    faBuilding, faXmark, faFloppyDisk, faFolder
} from '@fortawesome/free-solid-svg-icons'

const SORT_OPTIONS = [
    { value: 'pertinence', label: 'Pertinence' },
    { value: 'year_desc',  label: 'Année (récent)' },
    { value: 'year_asc',   label: 'Année (ancien)' },
    { value: 'citations',  label: 'Citations' },
]

const ARTICLES_PER_PAGE = 10

function SearchPage() {
    const { user } = useAuth()

    const [articles,        setArticles]        = useState([])
    const [projects,        setProjects]        = useState([])
    const [loading,         setLoading]         = useState(false)
    const [error,           setError]           = useState('')
    const [success,         setSuccess]         = useState('')
    const [hasSearched,     setHasSearched]     = useState(false)
    const [currentPage,     setCurrentPage]     = useState(1)
    const [selectedArticles, setSelectedArticles] = useState([])
    const [showBulkMenu,     setShowBulkMenu]     = useState(false)
    const [bulkLoading,      setBulkLoading]      = useState(false)
    const [selectAllMode, setSelectAllMode] = useState(false)


    // ── Filtres ──
    const [sortBy,          setSortBy]          = useState('pertinence')
    const [yearMin,         setYearMin]         = useState('')
    const [yearMax,         setYearMax]         = useState('')
    const [selectedTypes,   setSelectedTypes]   = useState([])
    const [publisherFilter, setPublisherFilter] = useState('TOUS')

    // ── Données dérivées pour les filtres ──
    const [availableTypes,  setAvailableTypes]  = useState([])
    const [publishers,      setPublishers]      = useState([])
    const [yearRange,       setYearRange]       = useState({ min: 2000, max: 2025 })

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
        resetFilters()

        try {
            const data = await searchArticles(query)
            setArticles(data)

            // Extraire types disponibles
            const types = [...new Set(
                data.map(a => a.documentType)
                    .filter(t => t && t.trim() !== '')
            )].sort()
            setAvailableTypes(types)

            // Extraire publishers
            const pubs = [...new Set(
                data.map(a => a.publisher)
                    .filter(p => p && p.trim() !== '')
            )].sort()
            setPublishers(pubs)

            // Calculer plage d'années
            const years = data
                .map(a => a.year)
                .filter(y => y != null)
            if (years.length > 0) {
                setYearRange({
                    min: Math.min(...years),
                    max: Math.max(...years)
                })
            }
        } catch {
            setError('Erreur lors de la recherche.')
        } finally {
            setLoading(false)
        }
    }

    const resetFilters = () => {
        setSortBy('pertinence')
        setYearMin('')
        setYearMax('')
        setSelectedTypes([])
        setPublisherFilter('TOUS')
    }

    const handleSave = async (article, projectId) => {
        try {
            await saveArticleToProject(article, projectId)
            setSuccess('✅ Article sauvegardé !')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            const msg = err.response?.data?.message
            setError(msg === 'Article déjà sauvegardé dans ce projet'
                ? '⚠️ Déjà dans ce projet'
                : 'Erreur lors de la sauvegarde')
            setTimeout(() => setError(''), 3000)
        }
    }

    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
        setCurrentPage(1)
    }

    // ── Appliquer tous les filtres + tri ──
    const getFilteredAndSorted = () => {
        let result = [...articles]

        // Filtre année min
        if (yearMin !== '') {
            result = result.filter(a =>
                a.year != null && a.year >= parseInt(yearMin))
        }

        // Filtre année max
        if (yearMax !== '') {
            result = result.filter(a =>
                a.year != null && a.year <= parseInt(yearMax))
        }

        // Filtre type
        if (selectedTypes.length > 0) {
            result = result.filter(a =>
                selectedTypes.includes(a.documentType))
        }

        // Filtre publisher
        if (publisherFilter !== 'TOUS') {
            result = result.filter(a =>
                a.publisher === publisherFilter)
        }

        // Tri
        switch (sortBy) {
            case 'year_desc':
                result.sort((a, b) => (b.year || 0) - (a.year || 0))
                break
            case 'year_asc':
                result.sort((a, b) => (a.year || 0) - (b.year || 0))
                break
            case 'citations':
                result.sort((a, b) =>
                    (b.citations || 0) - (a.citations || 0))
                break
            default:
                break
        }

        return result
    }

    const filteredArticles = getFilteredAndSorted()
    const totalPages = Math.ceil(
        filteredArticles.length / ARTICLES_PER_PAGE)
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ARTICLES_PER_PAGE,
        currentPage * ARTICLES_PER_PAGE
    )

    const activeFiltersCount = [
        yearMin !== '',
        yearMax !== '',
        selectedTypes.length > 0,
        publisherFilter !== 'TOUS'
    ].filter(Boolean).length

    const getPageNumbers = (current, total) => {
        if (total <= 7)
            return Array.from({ length: total }, (_, i) => i + 1)
        if (current <= 3)
            return [1, 2, 3, 4, '...', total]
        if (current >= total - 2)
            return [1, '...', total-3, total-2, total-1, total]
        return [1, '...', current-1, current, current+1, '...', total]
    }

    //deduplication des articles sélectionnés basée sur DOI ou titre

    const toggleSelect = (article) => {
        setSelectAllMode(false)  // ← AJOUTE CETTE LIGNE
        setSelectedArticles(prev => {
            const key = article.doi || article.title
            const exists = prev.find(a => (a.doi || a.title) === key)
            if (exists) {
                return prev.filter(a => (a.doi || a.title) !== key)
            }
            return [...prev, article]
        })
    }

    const isSelected = (article) => {
        const key = article.doi || article.title
        return selectedArticles.some(
            a => (a.doi || a.title) === key)
    }

    const handleBulkSave = async (projectId) => {
        setBulkLoading(true)
        setShowBulkMenu(false)
        let saved = 0
        let skipped = 0

        for (const article of selectedArticles) {
            try {
                await saveArticleToProject(article, projectId)
                saved++
            } catch {
                skipped++
            }
        }

        // 🔥 AJOUTE CES 2 LIGNES pour désélectionner automatiquement
        setSelectedArticles([])
        setSelectAllMode(false)  // Désactive le mode "Tous sélectionnés"

        setSuccess(`✅ ${saved} article(s) sauvegardé(s)${
            skipped > 0 ? ` (${skipped} déjà existant(s))` : ''}`)
        setTimeout(() => setSuccess(''), 4000)
        setBulkLoading(false)
    }

    return (
        <div className="search-page">
            <Navbar />

            <div className="search-page-inner">

                {/* ── Barre de recherche ── */}
                <div className="search-top">
                    <div className="search-top-header">
                        <h1 className="search-title">
                            Recherche d'articles scientifiques
                        </h1>
                        <p className="search-subtitle">
                            Trouvez et sauvegardez des références
                            pour vos projets de recherche
                        </p>
                    </div>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                </div>

                {/* ── Messages ── */}
                {error && (
                    <div className="search-alerts">
                        <div className="alert alert-error">
                            {error}
                            <button onClick={() => setError('')}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="search-alerts">
                        <div className="alert alert-success">
                            {success}
                        </div>
                    </div>
                )}

                {/* ── Layout sidebar + articles ── */}
                {hasSearched && (
                    <div className="search-layout">

                        {/* ── SIDEBAR ── */}
                        <aside className="search-sidebar">

                            {/* Stats */}
                            <div className="sidebar-card">
                                <div className="sidebar-section-title">
                                    📊 Résultats
                                </div>
                                <div className="sidebar-stats">
                                    <div className="sidebar-stat">
                                        <span className="sidebar-stat-num">
                                            {filteredArticles.length}
                                        </span>
                                        <span className="sidebar-stat-lbl">
                                            {filteredArticles.length !==
                                                articles.length
                                                ? `/ ${articles.length} total`
                                                : 'articles'}
                                        </span>
                                    </div>
                                </div>

                                {activeFiltersCount > 0 && (
                                    <button
                                        className="btn-reset-filters"
                                        onClick={() => {
                                            resetFilters()
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                        Effacer les filtres
                                        ({activeFiltersCount})
                                    </button>
                                )}
                            </div>

                            {/* Filtre année */}
                            <div className="sidebar-card">
                                <div className="sidebar-section-title">
                                    <FontAwesomeIcon icon={faCalendar} />
                                    Année de publication
                                </div>
                                <div className="year-inputs">
                                    <div className="year-input-group">
                                        <label>De</label>
                                        <input
                                            type="number"
                                            className="year-input"
                                            placeholder={yearRange.min}
                                            value={yearMin}
                                            min={yearRange.min}
                                            max={yearRange.max}
                                            onChange={e => {
                                                setYearMin(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                        />
                                    </div>
                                    <span className="year-separator">—</span>
                                    <div className="year-input-group">
                                        <label>À</label>
                                        <input
                                            type="number"
                                            className="year-input"
                                            placeholder={yearRange.max}
                                            value={yearMax}
                                            min={yearRange.min}
                                            max={yearRange.max}
                                            onChange={e => {
                                                setYearMax(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="year-hint">
                                    Disponible : {yearRange.min} — {yearRange.max}
                                </div>
                            </div>

                            {/* Filtre type document */}
                            {availableTypes.length > 0 && (
                                <div className="sidebar-card">
                                    <div className="sidebar-section-title">
                                        <FontAwesomeIcon icon={faFile} />
                                        Type de document
                                    </div>
                                    <div className="type-list">
                                        {availableTypes.map(type => (
                                            <label
                                                key={type}
                                                className="type-checkbox"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes
                                                        .includes(type)}
                                                    onChange={() =>
                                                        toggleType(type)}
                                                />
                                                <span className="type-name">
                                                    {type}
                                                </span>
                                                <span className="type-count">
                                                    {articles.filter(a =>
                                                        a.documentType === type
                                                    ).length}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filtre éditeur */}
                            {publishers.length > 0 && (
                                <div className="sidebar-card">
                                    <div className="sidebar-section-title">
                                        <FontAwesomeIcon icon={faBuilding} />
                                        Éditeur
                                    </div>
                                    <select
                                        className="publisher-select"
                                        value={publisherFilter}
                                        onChange={e => {
                                            setPublisherFilter(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <option value="TOUS">
                                            Tous les éditeurs
                                        </option>
                                        {publishers.map(p => (
                                            <option key={p} value={p}>
                                                {p.length > 35
                                                    ? p.substring(0, 35) + '...'
                                                    : p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </aside>

                        {/* ── ZONE ARTICLES ── */}
                        <div className="search-results">

                            {/* Barre de tri */}
                            {!loading && articles.length > 0 && (
                                <div className="results-toolbar">
                                    <span className="results-count">
                                        <strong>{filteredArticles.length}</strong>
                                        {' '}article{filteredArticles.length > 1
                                            ? 's' : ''}
                                        {filteredArticles.length !== articles.length
                                            && ` (sur ${articles.length})`}
                                    </span>
                                    <div className="sort-control">
                                        <FontAwesomeIcon icon={faSort} />
                                        <select
                                            className="sort-select"
                                            value={sortBy}
                                            onChange={e => {
                                                setSortBy(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                        >
                                            {SORT_OPTIONS.map(opt => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div className="loading-state">
                                    <div className="loading-spinner" />
                                    <p>Recherche en cours...</p>
                                </div>
                            )}

                            {/* Aucun résultat */}
                            {!loading && hasSearched &&
                                filteredArticles.length === 0 && (
                                <div className="empty-state">
                                    <p className="empty-icon">📭</p>
                                    <p className="empty-title">
                                        Aucun résultat
                                    </p>
                                    <p className="empty-subtitle">
                                        {activeFiltersCount > 0
                                            ? 'Essayez d\'élargir vos filtres'
                                            : 'Essayez avec d\'autres mots-clés'}
                                    </p>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            className="btn-reset-filters-center"
                                            onClick={() => {
                                                resetFilters()
                                                setCurrentPage(1)
                                            }}
                                        >
                                            Effacer les filtres
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* ── Barre de sélection multiple ── */}
                            {!loading && paginatedArticles.length > 0 && (
                                <div className="selection-bar">
                                    <div className="select-controls">
                                        {/* Bouton pour sélectionner TOUS les résultats */}
                                        <button
                                            className={`btn-select-all ${selectAllMode ? 'active' : ''}`}
                                            onClick={() => {
                                                if (selectAllMode) {
                                                    // Désélectionner tout
                                                    setSelectAllMode(false)
                                                    setSelectedArticles([])
                                                } else {
                                                    // Sélectionner TOUS les articles filtrés
                                                    setSelectAllMode(true)
                                                    setSelectedArticles(filteredArticles)
                                                }
                                            }}
                                        >
                                            {selectAllMode ? (
                                                <>✅ Tous sélectionnés ({filteredArticles.length})</>
                                            ) : (
                                                <>☐ Sélectionner tous les résultats ({filteredArticles.length})</>
                                            )}
                                        </button>

                                        {/* Afficher le nombre sélectionné */}
                                        {selectedArticles.length > 0 && (
                                            <span className="selected-count">
                                                {selectedArticles.length} article(s) sélectionné(s)
                                            </span>
                                        )}
                                    </div>

                                    {/* Boutons d'action groupée */}
                                    {selectedArticles.length > 0 && (
                                        <div className="bulk-actions">
                                            <div className="bulk-save-wrapper">
                                                <button
                                                    className="btn-bulk-save"
                                                    onClick={() => setShowBulkMenu(!showBulkMenu)}
                                                    disabled={bulkLoading}
                                                >
                                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                                    {bulkLoading ? 'Sauvegarde...' : `Sauvegarder (${selectedArticles.length})`}
                                                </button>

                                                {showBulkMenu && (
                                                    <div className="bulk-menu">
                                                        <p className="bulk-menu-title">Choisir un projet :</p>
                                                        {projects.length > 0 ? (
                                                            projects.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    className="bulk-menu-item"
                                                                    onClick={() => handleBulkSave(p.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFolder} />
                                                                    {p.nomProjet}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <p className="bulk-menu-empty">Aucun projet disponible</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                className="btn-clear-selection"
                                                onClick={() => {
                                                    setSelectedArticles([])
                                                    setSelectAllMode(false)
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                                Annuler
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Liste articles */}
                            {!loading && paginatedArticles.length > 0 && (
                                <div className="articles-list">
                                    {paginatedArticles.map((article, index) => (
                                        <ArticleCard
                                            key={`${article.doi ||
                                                article.title}-${index}`}
                                            article={article}
                                            onSave={handleSave}
                                            projects={projects}
                                            onToggleSelect={toggleSelect}
                                            isSelected={isSelected(article)}
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
                                        <button
                                            className="page-btn page-nav"
                                            onClick={() => {
                                                setCurrentPage(1)
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: 'smooth'
                                                })
                                            }}
                                            disabled={currentPage === 1}
                                        >«</button>
                                        <button
                                            className="page-btn page-nav"
                                            onClick={() => {
                                                setCurrentPage(p => p - 1)
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: 'smooth'
                                                })
                                            }}
                                            disabled={currentPage === 1}
                                        >‹</button>

                                        {getPageNumbers(currentPage, totalPages)
                                            .map((page, index) =>
                                            page === '...' ? (
                                                <span
                                                    key={`dots-${index}`}
                                                    className="page-dots"
                                                >...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    className={`page-btn ${
                                                        currentPage === page
                                                            ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setCurrentPage(page)
                                                        window.scrollTo({
                                                            top: 0,
                                                            behavior: 'smooth'
                                                        })
                                                    }}
                                                >{page}</button>
                                            )
                                        )}

                                        <button
                                            className="page-btn page-nav"
                                            onClick={() => {
                                                setCurrentPage(p => p + 1)
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: 'smooth'
                                                })
                                            }}
                                            disabled={
                                                currentPage === totalPages}
                                        >›</button>
                                        <button
                                            className="page-btn page-nav"
                                            onClick={() => {
                                                setCurrentPage(totalPages)
                                                window.scrollTo({
                                                    top: 0,
                                                    behavior: 'smooth'
                                                })
                                            }}
                                            disabled={
                                                currentPage === totalPages}
                                        >»</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* État initial avant recherche */}
                {!hasSearched && !loading && (
                    <div className="empty-state">
                        <p className="empty-icon">🔬</p>
                        <p className="empty-title">Prêt à rechercher</p>
                        <p className="empty-subtitle">
                            Entrez des mots-clés pour trouver
                            des articles scientifiques
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default SearchPage