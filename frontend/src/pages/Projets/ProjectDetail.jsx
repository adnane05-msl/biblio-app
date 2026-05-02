import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProjectById } from '../../services/ProjectServices'
import {
    getArticlesByProject,
    updateArticleStatut,
    updateArticleNote,
    removeArticleFromProject
} from '../../services/ProjectArticleServices'
import Navbar from '../../components/Navbar/Navbar'
import './ProjectDetail.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTrash, faNoteSticky,
    faCircleCheck, faCircleXmark,
    faBookOpen, faArrowLeft
} from '@fortawesome/free-solid-svg-icons'

const STATUTS = [
    { value: 'A_LIRE',  label: 'À lire',  color: '#6b7280' },
    { value: 'RETENU',  label: 'Retenu',  color: '#16a34a' },
    { value: 'EXCLU',   label: 'Exclu',   color: '#dc2626' },
    { value: 'DOUBLON', label: 'Doublon', color: '#d97706' },
]

function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject]   = useState(null)
    const [articles, setArticles] = useState([])
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState('')
    const [success, setSuccess]   = useState('')
    const [editingNote, setEditingNote] = useState(null)
    const [noteText, setNoteText] = useState('')
    const [filterStatut, setFilterStatut] = useState('TOUS')

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
            setError('Erreur lors de la mise à jour du statut')
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
            setError('Erreur lors de la sauvegarde de la note')
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

    // Filtrer les articles par statut
    const filteredArticles = filterStatut === 'TOUS'
        ? articles
        : articles.filter(a => a.statut === filterStatut)

    // Statistiques
    const stats = {
        total:   articles.length,
        retenus: articles.filter(a => a.statut === 'RETENU').length,
        exclus:  articles.filter(a => a.statut === 'EXCLU').length,
        aLire:   articles.filter(a => a.statut === 'A_LIRE').length,
        doublons:articles.filter(a => a.statut === 'DOUBLON').length,
    }

    if (loading) return (
        <div className="detail-page">
            <Navbar />
            <div className="detail-loading">Chargement...</div>
        </div>
    )

    return (
        <div className="detail-page">
            <Navbar />
            <div className="detail-container">

                {/* Retour */}
                <button className="btn-back"
                    onClick={() => navigate('/projects')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour aux projets
                </button>

                {/* En-tête projet */}
                <h1 className="detail-title">{project?.nomProjet}</h1>
                {project?.description && (
                    <p className="detail-description">
                        {project.description}
                    </p>
                )}

                {/* Stats */}
                <div className="detail-stats">
                    <div className="detail-stat">
                        <span className="stat-num">{stats.total}</span>
                        <span className="stat-lbl">Total</span>
                    </div>
                    <div className="detail-stat stat-green">
                        <span className="stat-num">{stats.retenus}</span>
                        <span className="stat-lbl">Retenus</span>
                    </div>
                    <div className="detail-stat stat-gray">
                        <span className="stat-num">{stats.aLire}</span>
                        <span className="stat-lbl">À lire</span>
                    </div>
                    <div className="detail-stat stat-red">
                        <span className="stat-num">{stats.exclus}</span>
                        <span className="stat-lbl">Exclus</span>
                    </div>
                    <div className="detail-stat stat-yellow">
                        <span className="stat-num">{stats.doublons}</span>
                        <span className="stat-lbl">Doublons</span>
                    </div>
                </div>

                {/* Alertes */}
                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">{success}</div>
                )}

                {/* Filtre par statut */}
                {articles.length > 0 && (
                    <div className="detail-filters">
                        <span className="filter-label">Filtrer :</span>
                        {['TOUS', 'A_LIRE', 'RETENU', 'EXCLU', 'DOUBLON']
                            .map(s => (
                            <button
                                key={s}
                                className={`filter-btn ${filterStatut === s ? 'active' : ''}`}
                                onClick={() => setFilterStatut(s)}
                            >
                                {s === 'TOUS' ? 'Tous'
                                    : s === 'A_LIRE' ? 'À lire'
                                    : s === 'RETENU' ? 'Retenus'
                                    : s === 'EXCLU' ? 'Exclus'
                                    : 'Doublons'}
                                {s !== 'TOUS' && (
                                    <span className="filter-count">
                                        {articles.filter(a =>
                                            a.statut === s).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Liste des articles */}
                {articles.length === 0 ? (
                    <div className="detail-empty">
                        <p className="empty-icon">
                            <FontAwesomeIcon icon={faBookOpen} />
                        </p>
                        <p className="empty-title">
                            Aucun article sauvegardé
                        </p>
                        <p className="empty-subtitle">
                            Faites une recherche et sauvegardez des articles
                            dans ce projet
                        </p>
                        <button
                            className="btn-go-search"
                            onClick={() => navigate('/search')}
                        >
                            🔍 Aller à la recherche
                        </button>
                    </div>
                ) : (
                    <div className="saved-articles-list">
                        {filteredArticles.map(article => {
                            const statutInfo = STATUTS.find(
                                s => s.value === article.statut)
                            return (
                                <div key={article.id}
                                    className="saved-article-card">

                                    {/* Header carte */}
                                    <div className="saved-card-header">
                                        <div className="saved-card-meta">
                                            {article.annee && (
                                                <span className="saved-year">
                                                    📅 {article.annee}
                                                </span>
                                            )}
                                            {article.nbCitations != null && (
                                                <span className="saved-citations">
                                                    📊 {article.nbCitations} citations
                                                </span>
                                            )}
                                        </div>

                                        {/* Statut selector */}
                                        <select
                                            className="statut-select"
                                            value={article.statut}
                                            style={{
                                                borderColor: statutInfo?.color,
                                                color: statutInfo?.color
                                            }}
                                            onChange={(e) =>
                                                handleStatutChange(
                                                    article.id,
                                                    e.target.value)}
                                        >
                                            {STATUTS.map(s => (
                                                <option
                                                    key={s.value}
                                                    value={s.value}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Titre */}
                                    <h3 className="saved-title">
                                        {article.url ? (
                                            <a href={article.url}
                                                target="_blank"
                                                rel="noreferrer">
                                                {article.titre}
                                            </a>
                                        ) : article.titre}
                                    </h3>

                                    {/* Auteurs */}
                                    {article.auteurs && (
                                        <p className="saved-authors">
                                            👥 {article.auteurs}
                                        </p>
                                    )}

                                    {/* DOI */}
                                    {article.doi && (
                                        <p className="saved-doi">
                                            DOI : 
                                            <a href={`https://doi.org/${article.doi}`}
                                                target="_blank"
                                                rel="noreferrer">
                                                {article.doi}
                                            </a>
                                        </p>
                                    )}

                                    {/* Résumé */}
                                    {article.resume && (
                                        <p className="saved-resume">
                                            {article.resume.length > 200
                                                ? article.resume.substring(0, 200) + '...'
                                                : article.resume}
                                        </p>
                                    )}

                                    {/* Note */}
                                    {editingNote === article.id ? (
                                        <div className="note-editor">
                                            <textarea
                                                className="note-textarea"
                                                value={noteText}
                                                onChange={e =>
                                                    setNoteText(e.target.value)}
                                                placeholder="Votre note..."
                                                rows={3}
                                            />
                                            <div className="note-actions">
                                                <button
                                                    className="btn-save-note"
                                                    onClick={() =>
                                                        handleSaveNote(article.id)}>
                                                    <FontAwesomeIcon
                                                        icon={faCircleCheck} /> Sauvegarder
                                                </button>
                                                <button
                                                    className="btn-cancel-note"
                                                    onClick={() =>
                                                        setEditingNote(null)}>
                                                    <FontAwesomeIcon
                                                        icon={faCircleXmark} /> Annuler
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="note-display">
                                            {article.note ? (
                                                <p className="note-text">
                                                    📝 {article.note}
                                                </p>
                                            ) : null}
                                            <button
                                                className="btn-add-note"
                                                onClick={() => {
                                                    setEditingNote(article.id)
                                                    setNoteText(article.note || '')
                                                }}>
                                                <FontAwesomeIcon
                                                    icon={faNoteSticky} />
                                                {article.note
                                                    ? ' Modifier la note'
                                                    : ' Ajouter une note'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="saved-card-footer">
                                        <span className="saved-date">
                                            Ajouté le{' '}
                                            {article.dateAjout
                                                ? new Date(article.dateAjout)
                                                    .toLocaleDateString('fr-FR')
                                                : '—'}
                                        </span>
                                        <button
                                            className="btn-remove"
                                            onClick={() =>
                                                handleRemove(article.id)}>
                                            <FontAwesomeIcon icon={faTrash} /> Retirer
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProjectDetail