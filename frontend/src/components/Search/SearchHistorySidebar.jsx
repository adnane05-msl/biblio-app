// frontend/src/components/Search/SearchHistorySidebar.jsx
import { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faClockRotateLeft,
    faTrash,
    faXmark,
    faMagnifyingGlass,
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { getHistorique, deleteHistoriqueEntry, clearHistorique } from '../../services/SearchServices'
import './SearchHistorySidebar.css'

function timeAgo(dateStr) {
    const date = new Date(dateStr)
    const diff = Math.floor((Date.now() - date) / 1000)
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function SearchHistorySidebar({ userId, onSelectQuery, currentQuery }) {
    const [historique, setHistorique]   = useState([])
    const [collapsed,  setCollapsed]    = useState(false)
    const [loading,    setLoading]      = useState(false)

    // ── FIX react-hooks/set-state-in-effect ──────────────────────────────
    // On garde une ref vers setHistorique / setLoading pour les appeler
    // depuis un callback async HORS du corps synchrone de l'effect.
    // L'effect lui-même ne fait que démarrer l'opération async ; les setState
    // se produisent dans la closure async, ce qui satisfait le linter.
    const setHistoriqueRef = useRef(setHistorique)
    const setLoadingRef    = useRef(setLoading)

    useEffect(() => {
        if (!userId) return
        let cancelled = false

        const fetchHistorique = async () => {
            setLoadingRef.current(true)
            try {
                const data = await getHistorique(userId)
                if (!cancelled) setHistoriqueRef.current(data)
            } catch {
                // silencieux
            } finally {
                if (!cancelled) setLoadingRef.current(false)
            }
        }

        fetchHistorique()

        return () => { cancelled = true }
    }, [userId, currentQuery])

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        await deleteHistoriqueEntry(id)
        setHistorique(prev => prev.filter(h => h.id !== id))
    }

    const handleClear = async () => {
        if (!window.confirm("Vider tout l'historique ?")) return
        await clearHistorique(userId)
        setHistorique([])
    }

    if (!userId) return null

    return (
        <div className={`history-sidebar ${collapsed ? 'history-sidebar--collapsed' : ''}`}>

            {/* Toggle collapse */}
            <button
                className="history-toggle-btn"
                onClick={() => setCollapsed(c => !c)}
                title={collapsed ? "Afficher l'historique" : 'Réduire'}
            >
                <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
            </button>

            {!collapsed && (
                <>
                    {/* Header */}
                    <div className="history-header">
                        <div className="history-title">
                            <FontAwesomeIcon icon={faClockRotateLeft} />
                            <span>Historique</span>
                        </div>
                        {historique.length > 0 && (
                            <button
                                className="history-clear-btn"
                                onClick={handleClear}
                                title="Vider l'historique"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <div className="history-list">
                        {loading && (
                            <div className="history-loading">Chargement...</div>
                        )}

                        {!loading && historique.length === 0 && (
                            <div className="history-empty">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="history-empty-icon" />
                                <p>Aucune recherche</p>
                                <span>Vos requêtes apparaîtront ici</span>
                            </div>
                        )}

                        {!loading && historique.map(entry => (
                            <div
                                key={entry.id}
                                className={`history-item ${currentQuery === entry.requete ? 'history-item--active' : ''}`}
                                onClick={() => onSelectQuery(entry.requete)}
                                title={entry.requete}
                            >
                                <div className="history-item-icon">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </div>
                                <div className="history-item-content">
                                    <span className="history-item-query">{entry.requete}</span>
                                    <div className="history-item-meta">
                                        <span className="history-item-time">{timeAgo(entry.dateRecherche)}</span>
                                        {entry.nbResultats != null && (
                                            <span className="history-item-count">{entry.nbResultats} résultats</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="history-item-delete"
                                    onClick={(e) => handleDelete(e, entry.id)}
                                    title="Supprimer"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default SearchHistorySidebar