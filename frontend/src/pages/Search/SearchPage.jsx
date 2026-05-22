import { useState, useEffect, useRef } from 'react'
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
    { value: 'Recommandé', label: 'Recommandé' },
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
    const selectAllRef = useRef(null)

    // ── Filtres ──
    const [sortBy,          setSortBy]          = useState('Recommandé')
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

            const types = [...new Set(
                data.map(a => a.documentType).filter(t => t && t.trim() !== '')
            )].sort()
            setAvailableTypes(types)

            const pubs = [...new Set(
                data.map(a => a.publisher).filter(p => p && p.trim() !== '')
            )].sort()
            setPublishers(pubs)

            const years = data.map(a => a.year).filter(y => y != null && y > 0)
            if (years.length > 0) {
                setYearRange({ min: Math.min(...years), max: Math.max(...years) })
            }
        } catch {
            setError('Erreur lors de la recherche.')
        } finally {
            setLoading(false)
        }
    }

    const resetFilters = () => {
        setSortBy('Recommandé')
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
        } catch {
            setError('Erreur lors de la sauvegarde')
            setTimeout(() => setError(''), 3000)
        }
    }

    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
        setCurrentPage(1)
    }

    const getFilteredAndSorted = () => {
        let result = [...articles]

        if (yearMin !== '') {
            result = result.filter(a => a.year != null && a.year >= parseInt(yearMin))
        }
        if (yearMax !== '') {
            result = result.filter(a => a.year != null && a.year <= parseInt(yearMax))
        }
        if (selectedTypes.length > 0) {
            result = result.filter(a => selectedTypes.includes(a.documentType))
        }
        if (publisherFilter !== 'TOUS') {
            result = result.filter(a => a.publisher === publisherFilter)
        }

        switch (sortBy) {
            case 'year_desc': result.sort((a, b) => (b.year || 0) - (a.year || 0)); break
            case 'year_asc':  result.sort((a, b) => (a.year || 0) - (b.year || 0)); break
            case 'citations': result.sort((a, b) => (b.citations || 0) - (a.citations || 0)); break
            default: break
        }

        return result
    }

    const filteredArticles = getFilteredAndSorted()
    const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
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
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
        if (current <= 3) return [1, 2, 3, 4, '...', total]
        if (current >= total - 2) return [1, '...', total-3, total-2, total-1, total]
        return [1, '...', current-1, current, current+1, '...', total]
    }

    const toggleSelect = (article) => {
        setSelectedArticles(prev => {
            const key = article.doi || article.title
            const exists = prev.find(a => (a.doi || a.title) === key)
            if (exists) return prev.filter(a => (a.doi || a.title) !== key)
            return [...prev, article]
        })
    }

    const isAllSelected = filteredArticles.length > 0 &&
        filteredArticles.every(a =>
            selectedArticles.some(s => (s.doi || s.title) === (a.doi || a.title))
        )

    const isIndeterminate = !isAllSelected && selectedArticles.length > 0

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate
        }
    }, [isIndeterminate])

    // Sauvegarde en masse : tous les articles sont sauvegardés
    // Le backend retourne silencieusement le DTO existant si l'article est déjà dans le projet
    const handleBulkSave = async (projectId) => {
        setBulkLoading(true)
        setShowBulkMenu(false)

        let saved = 0
        for (const article of selectedArticles) {
            try {
                await saveArticleToProject(article, projectId)
                saved++
            } catch {
                // erreur réseau réelle uniquement
            }
        }

        setSelectedArticles([])
        setSuccess(`✅ ${saved} article(s) sauvegardé(s) dans le projet`)
        setTimeout(() => setSuccess(''), 4000)
        setBulkLoading(false)
    }

    const selectAll = () => {
        if (isAllSelected) {
            const filteredKeys = new Set(filteredArticles.map(a => a.doi || a.title))
            setSelectedArticles(prev => prev.filter(a => !filteredKeys.has(a.doi || a.title)))
        } else {
            const existing = new Set(selectedArticles.map(a => a.doi || a.title))
            const toAdd = filteredArticles.filter(a => !existing.has(a.doi || a.title))
            setSelectedArticles(prev => [...prev, ...toAdd])
        }
    }

    const isSelected = (article) => {
        const key = article.doi || article.title
        return selectedArticles.some(a => (a.doi || a.title) === key)
    }

    return (
        <div className="search-page">
            <Navbar />

            <div className="search-page-inner">

                <div className="search-top">
                    <div className="search-top-header">
                        <h1 className="search-title">Recherche d'articles scientifiques</h1>
                        <p className="search-subtitle">
                            Trouvez et sauvegardez des références pour vos projets de recherche
                        </p>
                    </div>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                </div>

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
                        <div className="alert alert-success">{success}</div>
                    </div>
                )}

                {loading && (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Recherche en cours...</p>
                    </div>
                )}

                {hasSearched && (
                    <div className="search-layout">

                        {!loading && <aside className="search-sidebar">

                            <div className="sidebar-card">
                                <div className="sidebar-section-title">📊 Résultats</div>
                                <div className="sidebar-stats">
                                    <div className="sidebar-stat">
                                        <span className="sidebar-stat-num">{filteredArticles.length}</span>
                                        <span className="sidebar-stat-lbl">
                                            {filteredArticles.length !== articles.length
                                                ? `/ ${articles.length} total`
                                                : 'articles'}
                                        </span>
                                    </div>
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button className="btn-reset-filters" onClick={() => { resetFilters(); setCurrentPage(1) }}>
                                        <FontAwesomeIcon icon={faXmark} />
                                        Effacer les filtres ({activeFiltersCount})
                                    </button>
                                )}
                            </div>

                            <div className="sidebar-card">
                                <div className="sidebar-section-title">
                                    <FontAwesomeIcon icon={faCalendar} /> Année de publication
                                </div>
                                <div className="year-inputs">
                                    <div className="year-input-group">
                                        <label>De</label>
                                        <input type="number" className="year-input" placeholder={yearRange.min}
                                            value={yearMin} min={yearRange.min} max={yearRange.max}
                                            onChange={e => { setYearMin(e.target.value); setCurrentPage(1) }} />
                                    </div>
                                    <span className="year-separator">—</span>
                                    <div className="year-input-group">
                                        <label>À</label>
                                        <input type="number" className="year-input" placeholder={yearRange.max}
                                            value={yearMax} min={yearRange.min} max={yearRange.max}
                                            onChange={e => { setYearMax(e.target.value); setCurrentPage(1) }} />
                                    </div>
                                </div>
                                <div className="year-hint">Disponible : {yearRange.min} — {yearRange.max}</div>
                            </div>

                            {availableTypes.length > 0 && (
                                <div className="sidebar-card">
                                    <div className="sidebar-section-title">
                                        <FontAwesomeIcon icon={faFile} /> Type de document
                                    </div>
                                    <div className="type-list">
                                        {availableTypes.map(type => (
                                            <label key={type} className="type-checkbox">
                                                <input type="checkbox"
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={() => toggleType(type)} />
                                                <span className="type-name">{type}</span>
                                                <span className="type-count">
                                                    {articles.filter(a => a.documentType === type).length}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {publishers.length > 0 && (
                                <div className="sidebar-card">
                                    <div className="sidebar-section-title">
                                        <FontAwesomeIcon icon={faBuilding} /> Éditeur
                                    </div>
                                    <select className="publisher-select" value={publisherFilter}
                                        onChange={e => { setPublisherFilter(e.target.value); setCurrentPage(1) }}>
                                        <option value="TOUS">Tous les éditeurs</option>
                                        {publishers.map(p => (
                                            <option key={p} value={p}>
                                                {p.length > 35 ? p.substring(0, 35) + '...' : p}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </aside>}

                        <div className="search-results">

                            {!loading && articles.length > 0 && (
                                <div className="results-toolbar">
                                    <span className="results-count">
                                        <strong>{filteredArticles.length}</strong>
                                        {' '}article{filteredArticles.length > 1 ? 's' : ''}
                                        {filteredArticles.length !== articles.length && ` (sur ${articles.length})`}
                                    </span>
                                    <div className="sort-control">
                                        <FontAwesomeIcon icon={faSort} />
                                        <select className="sort-select" value={sortBy}
                                            onChange={e => { setSortBy(e.target.value); setCurrentPage(1) }}>
                                            {SORT_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {!loading && hasSearched && filteredArticles.length === 0 && (
                                <div className="empty-state">
                                    <p className="empty-icon">📭</p>
                                    <p className="empty-title">Aucun résultat</p>
                                    <p className="empty-subtitle">
                                        {activeFiltersCount > 0 ? 'Essayez d\'élargir vos filtres' : 'Essayez avec d\'autres mots-clés'}
                                    </p>
                                    {activeFiltersCount > 0 && (
                                        <button className="btn-reset-filters-center"
                                            onClick={() => { resetFilters(); setCurrentPage(1) }}>
                                            Effacer les filtres
                                        </button>
                                    )}
                                </div>
                            )}

                            {!loading && filteredArticles.length > 0 && (
                                <div className="selection-bar">
                                    <div className="selection-left">
                                        <label className="select-all-label">
                                            <input type="checkbox" ref={selectAllRef}
                                                checked={isAllSelected} onChange={selectAll} />
                                            {isAllSelected ? 'Tout désélectionner'
                                                : isIndeterminate ? 'Sélectionner tout'
                                                : 'Tout sélectionner'}
                                        </label>
                                        {selectedArticles.length > 0 && (
                                            <span className="selected-badge">
                                                {selectedArticles.length} sélectionné(s)
                                            </span>
                                        )}
                                    </div>

                                    {selectedArticles.length > 0 && (
                                        <div className="bulk-actions">
                                            <div className="bulk-save-wrapper">
                                                <button className="btn-bulk-save"
                                                    onClick={() => setShowBulkMenu(!showBulkMenu)}
                                                    disabled={bulkLoading}>
                                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                                    {bulkLoading
                                                        ? 'Sauvegarde...'
                                                        : `Sauvegarder (${selectedArticles.length})`}
                                                </button>

                                                {showBulkMenu && (
                                                    <div className="bulk-menu">
                                                        <p className="bulk-menu-title">Choisir un projet :</p>
                                                        {projects.length > 0 ? (
                                                            projects.map(p => (
                                                                <button key={p.id} className="bulk-menu-item"
                                                                    onClick={() => handleBulkSave(p.id)}>
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

                                            <button className="btn-clear-selection"
                                                onClick={() => setSelectedArticles([])}>
                                                <FontAwesomeIcon icon={faXmark} /> Annuler
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!loading && paginatedArticles.length > 0 && (
                                <div className="articles-list">
                                    {paginatedArticles.map((article, index) => (
                                        <ArticleCard
                                            key={`${article.doi || article.title}-${index}`}
                                            article={article}
                                            onSave={handleSave}
                                            projects={projects}
                                            onToggleSelect={toggleSelect}
                                            selected={isSelected(article)}
                                        />
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <div className="pagination-info">
                                        Page {currentPage} sur {totalPages}
                                        <span className="pagination-total">({filteredArticles.length} articles)</span>
                                    </div>
                                    <div className="pagination-controls">
                                        <button className="page-btn page-nav"
                                            onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                            disabled={currentPage === 1}>«</button>
                                        <button className="page-btn page-nav"
                                            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                            disabled={currentPage === 1}>‹</button>

                                        {getPageNumbers(currentPage, totalPages).map((page, index) =>
                                            page === '...' ? (
                                                <span key={`dots-${index}`} className="page-dots">...</span>
                                            ) : (
                                                <button key={page}
                                                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                                                    {page}
                                                </button>
                                            )
                                        )}

                                        <button className="page-btn page-nav"
                                            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                            disabled={currentPage === totalPages}>›</button>
                                        <button className="page-btn page-nav"
                                            onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                            disabled={currentPage === totalPages}>»</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!hasSearched && !loading && (
                    <div className="empty-state">
                        <p className="empty-icon">🔬</p>
                        <p className="empty-title">Prêt à rechercher</p>
                        <p className="empty-subtitle">Entrez des mots-clés pour trouver des articles scientifiques</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default SearchPage