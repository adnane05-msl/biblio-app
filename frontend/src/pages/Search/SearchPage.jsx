import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/useAuth'
import { searchArticles, saveHistorique } from '../../services/SearchServices'
import { getProjectsByUser } from '../../services/ProjectServices'
import { saveArticleToProject, saveArticlesToProject } from '../../services/ProjectArticleServices'
import Navbar from '../../components/Navbar/Navbar'
import SearchBar from '../../components/Search/SearchBar'
import ArticleCard from '../../components/Search/ArticleCard'
import SearchHistorySidebar from '../../components/Search/SearchHistorySidebar'
import './SearchPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSort, faCalendar, faFile,
    faBuilding, faXmark, faFloppyDisk, faFolder
} from '@fortawesome/free-solid-svg-icons'

const SORT_OPTIONS = [
    { value: 'Recommandé', label: 'Recommandé' },
    { value: 'year_desc',  label: 'Année (récent)' },
    { value: 'year_asc',   label: 'Année (ancien)' },
    { value: 'citations',  label: 'Citations' },
]
const ARTICLES_PER_PAGE = 10

function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages = []
    if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
    return pages
}

const cacheKey = (q) => q.trim().toLowerCase()

function SearchPage() {
    const { user } = useAuth()

    // ── Cache mémoire (session courante) ──────────────────────────────────
    // Complète le cache BDD pour les requêtes répétées dans la même session
    const sessionCache = useRef(new Map())

    // ── États ─────────────────────────────────────────────────────────────
    const [articles,         setArticles]         = useState([])
    const [projects,         setProjects]         = useState([])
    const [loading,          setLoading]          = useState(false)
    const [error,            setError]            = useState('')
    const [success,          setSuccess]          = useState('')
    const [hasSearched,      setHasSearched]      = useState(false)
    const [currentPage,      setCurrentPage]      = useState(1)
    const [selectedArticles, setSelectedArticles] = useState([])
    const [showBulkMenu,     setShowBulkMenu]     = useState(false)
    const [bulkLoading,      setBulkLoading]      = useState(false)
    const [currentQuery,     setCurrentQuery]     = useState('')
    const [totalRecherche,   setTotalRecherche]   = useState(0)
    const selectAllRef = useRef(null)

    // ── Filtres ────────────────────────────────────────────────────────────
    const [sortBy,          setSortBy]          = useState('Recommandé')
    const [yearMin,         setYearMin]         = useState('')
    const [yearMax,         setYearMax]         = useState('')
    const [selectedTypes,   setSelectedTypes]   = useState([])
    const [publisherFilter, setPublisherFilter] = useState('TOUS')
    const [availableTypes,  setAvailableTypes]  = useState([])
    const [publishers,      setPublishers]      = useState([])
    const [yearRange,       setYearRange]       = useState({ min: 2000, max: 2025 })
    const [searchBarQuery, setSearchBarQuery] = useState('')


    // ── Chargement projets ─────────────────────────────────────────────────
    useEffect(() => {
        if (user?.id) {
            getProjectsByUser(user.id).then(setProjects).catch(() => {})
        }
    }, [user])

    // ── Reset filtres ──────────────────────────────────────────────────────
    const resetFilters = () => {
        setSortBy('Recommandé')
        setYearMin('')
        setYearMax('')
        setSelectedTypes([])
        setPublisherFilter('TOUS')
    }

    // ── Applique les articles dans les états ───────────────────────────────
    const applyResults = useCallback((validArticles) => {
        setArticles(validArticles)
        setTotalRecherche(validArticles.length)

        const types = [...new Set(
            validArticles.map(a => a.documentType).filter(t => t?.trim())
        )].sort()
        setAvailableTypes(types)

        const pubs = [...new Set(
            validArticles.map(a => a.publisher).filter(p => p?.trim())
        )].sort()
        setPublishers(pubs)

        const years = validArticles.map(a => a.year).filter(y => y > 0)
        if (years.length > 0) {
            setYearRange({ min: Math.min(...years), max: Math.max(...years) })
        }
    }, [])

    // ── Recherche principale ───────────────────────────────────────────────
    const handleSearch = useCallback(async (query, cachedJsonFromDB = null) => {
        const key = cacheKey(query)

        setError('')
        setHasSearched(true)
        setCurrentPage(1)
        setCurrentQuery(query)
        setSearchBarQuery(query)
        resetFilters()
        setSelectedArticles([])

        // ── CAS 1 : résultats depuis le cache SESSION (même navigation) ──
        if (sessionCache.current.has(key)) {
            const cached = sessionCache.current.get(key)
            applyResults(cached)
            setLoading(false)
            return
        }

        // ── CAS 2 : résultats depuis la BDD (clic historique après retour page) ──
        if (cachedJsonFromDB) {
            try {
                const parsed = JSON.parse(cachedJsonFromDB)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    applyResults(parsed)
                    sessionCache.current.set(key, parsed) // aussi en mémoire session
                    setLoading(false)
                    return
                }
            } catch {
                // JSON invalide → on refait l'appel API
            }
        }

        // ── CAS 3 : nouvelle requête → appel APIs externes ──
        setLoading(true)
        setArticles([])

        try {
            const data = await searchArticles(query)

            const validArticles = data.filter(a =>
                a.title?.trim() &&
                a.title.trim().toLowerCase() !== 'titre non disponible'
            )

            // Mettre en cache session
            sessionCache.current.set(key, validArticles)

            // Sauvegarder en BDD avec le JSON des résultats (cache persistant)
            if (user?.id) {
                const jsonStr = JSON.stringify(validArticles)
                saveHistorique(query, user.id, validArticles.length, jsonStr)
                    .catch(e => console.warn('Erreur sauvegarde historique:', e))
            }

            applyResults(validArticles)

        } catch {
            setError('Erreur lors de la recherche.')
        } finally {
            setLoading(false)
        }
    }, [user?.id, applyResults])

    // ── Callback depuis la sidebar : clic sur un item historique ──────────
    // Reçoit la requête ET le JSON sauvegardé en BDD
    const handleHistorySelect = useCallback((query, resultatsJson) => {
        handleSearch(query, resultatsJson)
    }, [handleSearch])

    // ── Sauvegarde unitaire ────────────────────────────────────────────────
    const handleSave = async (article, projectId) => {
        try {
            await saveArticleToProject(article, projectId)
            setSuccess('Article sauvegardé !')
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Erreur lors de la sauvegarde')
            setTimeout(() => setError(''), 3000)
        }
    }

    // ── Sauvegarde groupée ─────────────────────────────────────────────────
    const handleBulkSave = async (projectId) => {
        setBulkLoading(true)
        setShowBulkMenu(false)
        try {
            const result = await saveArticlesToProject(selectedArticles, projectId, totalRecherche, currentQuery)
            setSelectedArticles([])
            setSuccess(`${result.saved} article(s) sauvegardé(s) sur ${result.total}`)
            setTimeout(() => setSuccess(''), 4000)
        } catch {
            setError('Erreur lors de la sauvegarde groupée')
            setTimeout(() => setError(''), 4000)
        } finally {
            setBulkLoading(false)
        }
    }

    // ── Filtres ────────────────────────────────────────────────────────────
    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
        setCurrentPage(1)
    }

    const toggleSelect = (article) => {
        const key = article.doi || article.title
        setSelectedArticles(prev =>
            prev.some(a => (a.doi || a.title) === key)
                ? prev.filter(a => (a.doi || a.title) !== key)
                : [...prev, article]
        )
    }

    const isSelected = (article) => {
        const key = article.doi || article.title
        return selectedArticles.some(a => (a.doi || a.title) === key)
    }

    let filteredArticles = [...articles]
    if (yearMin) filteredArticles = filteredArticles.filter(a => a.year >= parseInt(yearMin))
    if (yearMax) filteredArticles = filteredArticles.filter(a => a.year <= parseInt(yearMax))
    if (selectedTypes.length > 0) filteredArticles = filteredArticles.filter(a => selectedTypes.includes(a.documentType))
    if (publisherFilter !== 'TOUS') filteredArticles = filteredArticles.filter(a => a.publisher === publisherFilter)

    if (sortBy === 'year_desc') filteredArticles.sort((a, b) => (b.year || 0) - (a.year || 0))
    else if (sortBy === 'year_asc') filteredArticles.sort((a, b) => (a.year || 0) - (b.year || 0))
    else if (sortBy === 'citations') filteredArticles.sort((a, b) => (b.citations || 0) - (a.citations || 0))

    const activeFiltersCount =
        (yearMin ? 1 : 0) + (yearMax ? 1 : 0) +
        selectedTypes.length + (publisherFilter !== 'TOUS' ? 1 : 0)

    const totalPages        = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ARTICLES_PER_PAGE,
        currentPage * ARTICLES_PER_PAGE
    )

    const allFilteredSelected = filteredArticles.length > 0 &&
        filteredArticles.every(a => selectedArticles.some(s => (s.doi || s.title) === (a.doi || a.title)))
    const someFilteredSelected = !allFilteredSelected && selectedArticles.length > 0

    const selectAll = () => {
        if (allFilteredSelected) {
            const keys = new Set(filteredArticles.map(a => a.doi || a.title))
            setSelectedArticles(prev => prev.filter(a => !keys.has(a.doi || a.title)))
        } else {
            const existing = new Set(selectedArticles.map(a => a.doi || a.title))
            const toAdd = filteredArticles.filter(a => !existing.has(a.doi || a.title))
            setSelectedArticles(prev => [...prev, ...toAdd])
        }
    }

    const syncIndeterminate = useCallback(() => {
        if (selectAllRef.current) selectAllRef.current.indeterminate = someFilteredSelected
    }, [someFilteredSelected])

    useEffect(() => { syncIndeterminate() }, [syncIndeterminate])




    // ── Rendu ──────────────────────────────────────────────────────────────
    return (
        <div className="search-page">
            <Navbar />

            <div className="search-page-with-history">

                {/* ── Sidebar Historique ── */}
                <SearchHistorySidebar
                    userId={user?.id}
                    currentQuery={currentQuery}
                    onSelectQuery={handleHistorySelect}
                />

                {/* ── Contenu principal ── */}
                <div className="search-page-inner">

                    <div className="search-top">
                        <div className="search-top-header">
                            <h1 className="search-title">Recherche d'articles scientifiques</h1>
                            <p className="search-subtitle">
                                Trouvez et sauvegardez des références pour vos projets de recherche
                            </p>
                        </div>
                        <SearchBar
                            onSearch={handleSearch}
                            loading={loading}
                            query={searchBarQuery}
                            onQueryChange={setSearchBarQuery}
                        />
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

                            {!loading && (
                                <aside className="search-sidebar">
                                    <div className="sidebar-card">
                                        <div className="sidebar-section-title">📊 Résultats</div>
                                        <div className="sidebar-stats">
                                            <div className="sidebar-stat">
                                                <span className="sidebar-stat-num">{filteredArticles.length}</span>
                                                <span className="sidebar-stat-lbl">
                                                    {filteredArticles.length !== articles.length
                                                        ? `sur ${articles.length}`
                                                        : ' '}
                                                </span>
                                            </div>
                                        </div>
                                        {activeFiltersCount > 0 && (
                                            <button className="btn-reset-filters"
                                                onClick={() => { resetFilters(); setCurrentPage(1) }}>
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
                                                <input type="number" className="year-input"
                                                    placeholder={yearRange.min} value={yearMin}
                                                    min={yearRange.min} max={yearRange.max}
                                                    onChange={e => { setYearMin(e.target.value); setCurrentPage(1) }} />
                                            </div>
                                            <span className="year-separator">—</span>
                                            <div className="year-input-group">
                                                <label>À</label>
                                                <input type="number" className="year-input"
                                                    placeholder={yearRange.max} value={yearMax}
                                                    min={yearRange.min} max={yearRange.max}
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
                                                        <span>{type}</span>
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
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </aside>
                            )}

                            <div className="search-main">
                                {!loading && filteredArticles.length > 0 && (
                                    <div className="results-header">
                                        <span className="results-count">
                                            {filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''}
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
                                            {activeFiltersCount > 0
                                                ? "Essayez d'élargir vos filtres"
                                                : 'Essayez avec d\'autres mots-clés'}
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
                                                    checked={allFilteredSelected} onChange={selectAll} />
                                                {allFilteredSelected ? 'Tout désélectionner'
                                                    : someFilteredSelected
                                                        ? `${selectedArticles.length} sélectionné(s)`
                                                        : 'Tout sélectionner'}
                                            </label>
                                            {selectedArticles.length > 0 && (
                                                <span className="selected-badge">
                                                    {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        {selectedArticles.length > 0 && (
                                            <div className="bulk-actions">
                                                <div className="bulk-save-wrapper">
                                                    <button className="btn-bulk-action btn-bulk-save"
                                                        onClick={() => setShowBulkMenu(m => !m)}
                                                        disabled={bulkLoading}>
                                                        <FontAwesomeIcon icon={faFloppyDisk} />
                                                        {bulkLoading ? 'Sauvegarde...' : `Sauvegarder (${selectedArticles.length})`}
                                                    </button>
                                                    {showBulkMenu && (
                                                        <div className="bulk-menu">
                                                            <p className="bulk-menu-title">Choisir un projet :</p>
                                                            {projects.length > 0 ? projects.map(p => (
                                                                <button key={p.id} className="bulk-menu-item"
                                                                    onClick={() => handleBulkSave(p.id)}>
                                                                    <FontAwesomeIcon icon={faFolder} />
                                                                    {p.nomProjet}
                                                                </button>
                                                            )) : (
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
                                                    <span key={`dots-${index}`} className="page-dots">…</span>
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
                </div>
            </div>
        </div>
    )
}

export default SearchPage