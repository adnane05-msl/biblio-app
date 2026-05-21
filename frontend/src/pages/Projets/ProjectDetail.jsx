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
    faFileAlt, faCopy
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

    const filteredArticles = filterStatut === 'TOUS'
        ? articles
        : articles.filter(a => a.statut === filterStatut)

    const stats = {
        total: articles.length,
        retenus: articles.filter(a => a.statut === 'RETENU').length,
        exclus: articles.filter(a => a.statut === 'EXCLU').length,
        aLire: articles.filter(a => a.statut === 'A_LIRE').length,
        doublons: articles.filter(a => a.statut === 'DOUBLON').length,
    }

    const cleanAbstract = (text) => {
        if (!text) return ''
        return text
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    }

    const handleDeduplicate = async () => {
        if (!window.confirm(
            'Détecter automatiquement les doublons dans ce projet ?'))
            return

        setDedupLoading(true)
        try {
            const result = await deduplicateProject(id)

            // Recharger les articles
            const arts = await getArticlesByProject(id)
            setArticles(arts)

            // Si des doublons détectés → filtrer automatiquement
            if (result.marked > 0) {
                setFilterStatut('DOUBLON')
            }

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

                {/* Retour à gauche */}
                <button className="btn-back-hero btn-back-left" onClick={() => navigate('/projects')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour aux projets
                </button>

                <div className="detail-hero-content">
                    <h1 className="detail-hero-title">{project?.nomProjet}</h1>
                    {project?.description && (
                        <p className="detail-hero-subtitle">{project.description}</p>
                    )}
                </div>

                {/* Stats */}
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
                    {/* Ligne 1 : Filtres à gauche + Exports à droite */}
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

                    {/* Ligne 2 : Dashboard + Dédupliquer */}
                    <div className="toolbar-row toolbar-row-secondary">
                        <button className="btn-dashboard" onClick={() => navigate(`/projects/${id}/dashboard`)}>
                            <FontAwesomeIcon icon={faChartBar} /> Dashboard analytique
                        </button>
                        {articles.length > 0 && (
                            <button
                                className="btn-export btn-dedup"
                                onClick={handleDeduplicate}
                                disabled={dedupLoading}
                                title="Détecter et marquer les doublons automatiquement"
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
                    <div className="saved-articles-list">
                        {filteredArticles.map(article => {
                            // const statutInfo = STATUTS_MANUEL.find(s => s.value === article.statut)
                            return (
                                <div key={article.id} className="saved-article-card">
                                    <div className="saved-card-header">
                                        <div className="saved-card-meta">
                                            {article.annee && (
                                                <span className="saved-year">
                                                    <FontAwesomeIcon icon={faCalendar} /> {article.annee}
                                                </span>
                                            )}
                                            {article.nbCitations != null && (
                                                <span className="saved-citations">
                                                    <FontAwesomeIcon icon={faChartBar} /> {article.nbCitations} citations
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            className="statut-select"
                                            value={article.statut}
                                            style={{
                                                borderColor: STATUTS_DISPLAY.find(
                                                    s => s.value === article.statut)?.color,
                                                color: STATUTS_DISPLAY.find(
                                                    s => s.value === article.statut)?.color,
                                                // Si DOUBLON → désactiver le select
                                                pointerEvents: article.statut === 'DOUBLON'
                                                    ? 'none' : 'auto',
                                                opacity: article.statut === 'DOUBLON' ? 0.7 : 1,
                                            }}
                                            onChange={(e) => handleStatutChange(
                                                article.id, e.target.value)}
                                            disabled={article.statut === 'DOUBLON'}
                                        >
                                            {article.statut === 'DOUBLON' ? (
                                                // Si doublon → afficher seulement le label doublon
                                                <option value="DOUBLON">🔁 Doublon</option>
                                            ) : (
                                                STATUTS_MANUEL.map(s => (
                                                    <option key={s.value} value={s.value}>
                                                        {s.label}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    <h3 className="saved-title">
                                        {article.url ? (
                                            <a href={article.url} target="_blank" rel="noreferrer">{article.titre}</a>
                                        ) : article.titre}
                                    </h3>

                                    {article.auteurs && (
                                        <p className="saved-authors">
                                            <FontAwesomeIcon icon={faUsers} /> {article.auteurs}
                                        </p>
                                    )}

                                    {article.doi && (
                                        <p className="saved-doi">
                                            <FontAwesomeIcon icon={faLink} /> DOI : 
                                            <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noreferrer">{article.doi}</a>
                                        </p>
                                    )}

                                    {article.resume && (
                                        <p className="saved-resume">
                                            {cleanAbstract(article.resume).length > 200
                                                ? cleanAbstract(article.resume).substring(0, 200) + '...'
                                                : cleanAbstract(article.resume)}
                                        </p>
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

                                    <div className="saved-card-footer">
                                        <span className="saved-date">
                                            Ajouté le {article.dateAjout ? new Date(article.dateAjout).toLocaleDateString('fr-FR') : '—'}
                                        </span>
                                        <button className="btn-remove" onClick={() => handleRemove(article.id)}>
                                            <FontAwesomeIcon icon={faTrash} /> Retirer
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default ProjectDetail