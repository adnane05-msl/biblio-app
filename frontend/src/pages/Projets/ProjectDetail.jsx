import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProjectById } from '../../services/ProjectServices'
import { deduplicateProject } from '../../services/ProjectArticleServices'
import {
    getArticlesByProject,
    updateArticleStatut,
    updateArticleNote,
    removeArticleFromProject
} from '../../services/ProjectArticleServices'
import { exportBibtex, exportCsv, exportRis } from '../../services/ExportServices'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './ProjectDetail.css'
import {
    faTrash, faNoteSticky, faCircleCheck, faCircleXmark,
    faBookOpen, faArrowLeft, faMagnifyingGlass, faUsers,
    faChartBar, faCalendar, faLink, faFileCode, faFileCsv,
    faFileAlt, faCopy, faSort, faChevronLeft, faChevronRight,
    faAnglesLeft, faAnglesRight
} from '@fortawesome/free-solid-svg-icons'

const STATUTS_MANUEL = [
    { value: 'A_LIRE',  label: 'À lire',  color: '#6b7280' },
    { value: 'RETENU',  label: 'Retenu',  color: '#16a34a' },
    { value: 'EXCLU',   label: 'Exclu',   color: '#dc2626' },
]

const STATUTS_DISPLAY = [
    { value: 'A_LIRE',  label: 'À lire',  color: '#6b7280' },
    { value: 'RETENU',  label: 'Retenu',  color: '#16a34a' },
    { value: 'EXCLU',   label: 'Exclu',   color: '#dc2626' },
    { value: 'DOUBLON', label: 'Doublon', color: '#d97706' },
]

const ARTICLES_PER_PAGE = 10

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Date ajout (récent)' },
    { value: 'date_asc',  label: 'Date ajout (ancien)' },
    { value: 'year_desc', label: 'Année (récent)' },
    { value: 'year_asc',  label: 'Année (ancien)' },
    { value: 'citations', label: 'Citations' },
    { value: 'titre',     label: 'Titre (A-Z)' },
]

function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [editingNote, setEditingNote] = useState(null)
    const [noteText, setNoteText] = useState('')
    const [filterStatut, setFilterStatut] = useState('TOUS')
    const [dedupLoading, setDedupLoading] = useState(false)
    const [expandedAbstracts, setExpandedAbstracts] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState('date_desc')
    const [filterKey, setFilterKey] = useState('')  // tracks last filter+sort combo

    useEffect(() => {
        const load = async () => {
            try {
                const [proj, arts] = await Promise.all([
                    getProjectById(id),
                    getArticlesByProject(id)
                ])
                setProject(proj)
                setArticles(arts)
            } catch {
                navigate('/projects')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, navigate])

    // Derive the effective page: reset to 1 when filter or sort changes
    const comboKey = `${filterStatut}__${sortBy}`
    const effectivePage = comboKey !== filterKey ? 1 : currentPage

    const handleStatutChange = async (articleId, statut) => {
        try {
            await updateArticleStatut(articleId, statut)
            setArticles(prev => prev.map(a =>
                a.id === articleId ? { ...a, statut } : a
            ))
            setSuccess('Statut mis à jour !')
            setTimeout(() => setSuccess(''), 2000)
        } catch {
            setError('Erreur lors de la mise à jour')
            setTimeout(() => setError(''), 3000)
        }
    }

    const handleSaveNote = async (articleId) => {
        try {
            await updateArticleNote(articleId, noteText)
            setArticles(prev => prev.map(a =>
                a.id === articleId ? { ...a, note: noteText } : a
            ))
            setEditingNote(null)
            setSuccess('Note sauvegardée !')
            setTimeout(() => setSuccess(''), 2000)
        } catch {
            setError('Erreur lors de la sauvegarde')
            setTimeout(() => setError(''), 3000)
        }
    }

    const handleRemove = async (articleId) => {
        if (!window.confirm('Retirer cet article du projet ?')) return
        try {
            await removeArticleFromProject(articleId)
            setArticles(prev => prev.filter(a => a.id !== articleId))
            setSuccess('Article retiré du projet !')
            setTimeout(() => setSuccess(''), 2000)
        } catch {
            setError('Erreur lors de la suppression')
            setTimeout(() => setError(''), 3000)
        }
    }

    const toggleAbstract = (articleId) => {
        setExpandedAbstracts(prev => ({ ...prev, [articleId]: !prev[articleId] }))
    }

    const cleanAbstract = (text) => {
        if (!text) return ''
        return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }

    // Filtering
    const filteredArticles = filterStatut === 'TOUS'
        ? articles
        : articles.filter(a => a.statut === filterStatut)

    // Sorting
    const sortedArticles = [...filteredArticles].sort((a, b) => {
        switch (sortBy) {
            case 'date_asc':
                return new Date(a.dateAjout || 0) - new Date(b.dateAjout || 0)
            case 'date_desc':
                return new Date(b.dateAjout || 0) - new Date(a.dateAjout || 0)
            case 'year_desc':
                return (b.annee || 0) - (a.annee || 0)
            case 'year_asc':
                return (a.annee || 0) - (b.annee || 0)
            case 'citations':
                return (b.nbCitations || 0) - (a.nbCitations || 0)
            case 'titre':
                return (a.titre || '').localeCompare(b.titre || '')
            default:
                return 0
        }
    })

    // Pagination — use effectivePage (resets to 1 when filter/sort changes)
    const totalPages = Math.ceil(sortedArticles.length / ARTICLES_PER_PAGE)
    const paginatedArticles = sortedArticles.slice(
        (effectivePage - 1) * ARTICLES_PER_PAGE,
        effectivePage * ARTICLES_PER_PAGE
    )

    const getPageNumbers = (current, total) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
        if (current <= 3) return [1, 2, 3, 4, '...', total]
        if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total]
        return [1, '...', current - 1, current, current + 1, '...', total]
    }

    const goToPage = (page) => {
        setFilterKey(comboKey)
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const stats = {
        total: articles.length,
        retenus: articles.filter(a => a.statut === 'RETENU').length,
        exclus: articles.filter(a => a.statut === 'EXCLU').length,
        aLire: articles.filter(a => a.statut === 'A_LIRE').length,
        doublons: articles.filter(a => a.statut === 'DOUBLON').length,
    }

    const handleDeduplicate = async () => {
        if (!window.confirm('Détecter automatiquement les doublons dans ce projet ?')) return
        setDedupLoading(true)
        try {
            const result = await deduplicateProject(id)
            const arts = await getArticlesByProject(id)
            setArticles(arts)
            if (result.marked > 0) setFilterStatut('DOUBLON')
            setSuccess(result.message)
            setTimeout(() => setSuccess(''), 4000)
        } catch {
            setError('Erreur lors de la déduplication')
            setTimeout(() => setError(''), 3000)
        } finally {
            setDedupLoading(false)
        }
    }

    if (loading) return (
        <div className="project-detail-page">
            <Navbar />
            <div className="loading-state">Chargement...</div>
        </div>
    )

    return (
        <div className="project-detail-page">
            <Navbar />

            {/* Hero Section */}
            <section className="detail-hero">
                <div className="detail-hero-bg">
                    <div className="hero-circle circle1" />
                    <div className="hero-circle circle2" />
                    <div className="hero-circle circle3" />
                </div>

                <button className="btn-back-hero btn-back-left" onClick={() => navigate('/projects')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour aux projets
                </button>

                <div className="detail-hero-content">
                    <h1 className="detail-hero-title">{project?.nomProjet}</h1>
                    {project?.description && (
                        <p className="detail-hero-subtitle">{project.description}</p>
                    )}
                </div>

                <div className="detail-hero-stats">
                    <div className="hero-stat-box">
                        <span className="hero-stat-num">{stats.total}</span>
                        <span className="hero-stat-lbl">Total</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-box stat-green">
                        <span className="hero-stat-num">{stats.retenus}</span>
                        <span className="hero-stat-lbl">Retenus</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-box stat-gray">
                        <span className="hero-stat-num">{stats.aLire}</span>
                        <span className="hero-stat-lbl">À lire</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-box stat-red">
                        <span className="hero-stat-num">{stats.exclus}</span>
                        <span className="hero-stat-lbl">Exclus</span>
                    </div>
                    <div className="hero-stat-divider" />
                    <div className="hero-stat-box stat-yellow">
                        <span className="hero-stat-num">{stats.doublons}</span>
                        <span className="hero-stat-lbl">Doublons</span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="detail-container">
                {/* Toolbar */}
                <div className="detail-toolbar">
                    <div className="toolbar-row">
                        <div className="detail-filters">
                            <span className="filter-label">Filtrer :</span>
                            {['TOUS', 'A_LIRE', 'RETENU', 'EXCLU', 'DOUBLON'].map(s => (
                                <button
                                    key={s}
                                    className={`filter-btn ${filterStatut === s ? 'active' : ''}`}
                                    onClick={() => setFilterStatut(s)}
                                >
                                    {s === 'TOUS' ? 'Tous'
                                        : s === 'A_LIRE' ? 'À lire'
                                            : s === 'RETENU' ? 'Retenus'
                                                : s === 'EXCLU' ? 'Exclus' : 'Doublons'}
                                    {s !== 'TOUS' && (
                                        <span className="filter-count">
                                            {articles.filter(a => a.statut === s).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {articles.length > 0 && (
                            <div className="export-actions">
                                <button className="btn-export btn-bibtex" onClick={() => exportBibtex(id)}>
                                    <FontAwesomeIcon icon={faFileCode} /> BibTeX
                                </button>
                                <button className="btn-export btn-csv" onClick={() => exportCsv(id)}>
                                    <FontAwesomeIcon icon={faFileCsv} /> CSV
                                </button>
                                <button className="btn-export btn-ris" onClick={() => exportRis(id)}>
                                    <FontAwesomeIcon icon={faFileAlt} /> RIS
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="toolbar-row toolbar-row-secondary">
                        <button className="btn-dashboard" onClick={() => navigate(`/projects/${id}/dashboard`)}>
                            <FontAwesomeIcon icon={faChartBar} /> Dashboard analytique
                        </button>
                        {articles.length > 0 && (
                            <button
                                className="btn-export btn-dedup"
                                onClick={handleDeduplicate}
                                disabled={dedupLoading}
                            >
                                <FontAwesomeIcon icon={faCopy} />
                                {dedupLoading ? 'Détection...' : 'Détecter les doublons'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Articles List */}
                {articles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <FontAwesomeIcon icon={faBookOpen} />
                        </div>
                        <h2 className="empty-title">Aucun article sauvegardé</h2>
                        <p className="empty-subtitle">
                            Faites une recherche et sauvegardez des articles dans ce projet
                        </p>
                        <button className="btn-go-search" onClick={() => navigate('/search')}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} /> Aller à la recherche
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Results toolbar */}
                        <div className="results-toolbar">
                            <span className="results-count">
                                <strong>{sortedArticles.length}</strong>
                                {' '}article{sortedArticles.length > 1 ? 's' : ''}
                                {filterStatut !== 'TOUS' && ` (filtre: ${filterStatut === 'A_LIRE' ? 'À lire' : filterStatut === 'RETENU' ? 'Retenus' : filterStatut === 'EXCLU' ? 'Exclus' : 'Doublons'})`}
                            </span>
                            <div className="sort-control">
                                <FontAwesomeIcon icon={faSort} />
                                <select
                                    className="sort-select"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {sortedArticles.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon-wrapper">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </div>
                                <h2 className="empty-title">Aucun article pour ce filtre</h2>
                                <p className="empty-subtitle">Essayez un autre filtre de statut</p>
                                <button className="btn-go-search" onClick={() => setFilterStatut('TOUS')}>
                                    Voir tous les articles
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="saved-articles-list">
                                    {paginatedArticles.map(article => {
                                        const isExpanded = expandedAbstracts[article.id]
                                        const abstract = cleanAbstract(article.resume)
                                        return (
                                            <div key={article.id} className="article-card-detail">

                                                {/* Header: meta + statut select */}
                                                <div className="article-card-header-detail">
                                                    <div className="article-meta-top">
                                                        {article.annee && (
                                                            <span className="article-year">
                                                                <FontAwesomeIcon icon={faCalendar} /> {article.annee}
                                                            </span>
                                                        )}
                                                        {article.nbCitations != null && (
                                                            <span className="article-citations">
                                                                <FontAwesomeIcon icon={faChartBar} /> {article.nbCitations} citations
                                                            </span>
                                                        )}
                                                        <span
                                                            className="statut-badge"
                                                            style={{
                                                                backgroundColor: `${STATUTS_DISPLAY.find(s => s.value === article.statut)?.color}18`,
                                                                color: STATUTS_DISPLAY.find(s => s.value === article.statut)?.color,
                                                                border: `1px solid ${STATUTS_DISPLAY.find(s => s.value === article.statut)?.color}40`,
                                                            }}
                                                        >
                                                            {STATUTS_DISPLAY.find(s => s.value === article.statut)?.label || article.statut}
                                                        </span>
                                                    </div>

                                                    <div className="article-actions-top">
                                                        <select
                                                            className="statut-select-inline"
                                                            value={article.statut}
                                                            style={{
                                                                borderColor: STATUTS_DISPLAY.find(s => s.value === article.statut)?.color,
                                                                color: STATUTS_DISPLAY.find(s => s.value === article.statut)?.color,
                                                            }}
                                                            onChange={e => handleStatutChange(article.id, e.target.value)}
                                                            disabled={article.statut === 'DOUBLON'}
                                                        >
                                                            {article.statut === 'DOUBLON' ? (
                                                                <option value="DOUBLON">Doublon</option>
                                                            ) : (
                                                                STATUTS_MANUEL.map(s => (
                                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                                ))
                                                            )}
                                                        </select>

                                                        <button className="btn-remove-inline" onClick={() => handleRemove(article.id)} title="Retirer du projet">
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h3 className="article-title-detail">
                                                    {article.url ? (
                                                        <a href={article.url} target="_blank" rel="noreferrer">
                                                            {article.titre || 'Titre non disponible'}
                                                        </a>
                                                    ) : (
                                                        article.titre || 'Titre non disponible'
                                                    )}
                                                </h3>

                                                {/* Authors */}
                                                {article.auteurs && (
                                                    <p className="article-authors-detail">
                                                        <FontAwesomeIcon icon={faUsers} /> {article.auteurs}
                                                    </p>
                                                )}

                                                {/* DOI */}
                                                {article.doi && (
                                                    <p className="article-doi-detail">
                                                        <FontAwesomeIcon icon={faLink} /> DOI :&nbsp;
                                                        <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noreferrer">
                                                            {article.doi}
                                                        </a>
                                                    </p>
                                                )}

                                                {/* Abstract */}
                                                {abstract && (
                                                    <div className="article-abstract-detail">
                                                        <p className={`abstract-text-detail ${isExpanded ? 'expanded' : ''}`}>
                                                            {abstract}
                                                        </p>
                                                        <button
                                                            className="btn-toggle-abstract"
                                                            onClick={() => toggleAbstract(article.id)}
                                                        >
                                                            {isExpanded ? '▲ Réduire' : '▼ Voir le résumé'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Note Section */}
                                                {editingNote === article.id ? (
                                                    <div className="note-editor">
                                                        <textarea
                                                            className="note-textarea"
                                                            value={noteText}
                                                            onChange={e => setNoteText(e.target.value)}
                                                            placeholder="Votre note..."
                                                            rows={3}
                                                        />
                                                        <div className="note-actions">
                                                            <button className="btn-save-note" onClick={() => handleSaveNote(article.id)}>
                                                                <FontAwesomeIcon icon={faCircleCheck} /> Sauvegarder
                                                            </button>
                                                            <button className="btn-cancel-note" onClick={() => setEditingNote(null)}>
                                                                <FontAwesomeIcon icon={faCircleXmark} /> Annuler
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="note-display">
                                                        {article.note && <p className="note-text">📝 {article.note}</p>}
                                                        <button className="btn-add-note" onClick={() => {
                                                            setEditingNote(article.id)
                                                            setNoteText(article.note || '')
                                                        }}>
                                                            <FontAwesomeIcon icon={faNoteSticky} />
                                                            {article.note ? ' Modifier la note' : ' Ajouter une note'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Footer */}
                                                <div className="saved-card-footer">
                                                    <span className="saved-date">
                                                        Ajouté le {article.dateAjout
                                                            ? new Date(article.dateAjout).toLocaleDateString('fr-FR')
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <div className="pagination-info">
                                            Page {effectivePage} sur {totalPages}
                                            <span className="pagination-total">({sortedArticles.length} articles)</span>
                                        </div>
                                        <div className="pagination-controls">
                                            <button
                                                className="page-btn page-nav"
                                                onClick={() => goToPage(1)}
                                                disabled={effectivePage === 1}
                                                title="Première page"
                                            >
                                                <FontAwesomeIcon icon={faAnglesLeft} />
                                            </button>
                                            <button
                                                className="page-btn page-nav"
                                                onClick={() => goToPage(effectivePage - 1)}
                                                disabled={effectivePage === 1}
                                                title="Page précédente"
                                            >
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </button>

                                            {getPageNumbers(effectivePage, totalPages).map((page, index) =>
                                                page === '...' ? (
                                                    <span key={`dots-${index}`} className="page-dots">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        className={`page-btn ${effectivePage === page ? 'active' : ''}`}
                                                        onClick={() => goToPage(page)}
                                                    >{page}</button>
                                                )
                                            )}

                                            <button
                                                className="page-btn page-nav"
                                                onClick={() => goToPage(effectivePage + 1)}
                                                disabled={effectivePage === totalPages}
                                                title="Page suivante"
                                            >
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </button>
                                            <button
                                                className="page-btn page-nav"
                                                onClick={() => goToPage(totalPages)}
                                                disabled={effectivePage === totalPages}
                                                title="Dernière page"
                                            >
                                                <FontAwesomeIcon icon={faAnglesRight} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default ProjectDetail