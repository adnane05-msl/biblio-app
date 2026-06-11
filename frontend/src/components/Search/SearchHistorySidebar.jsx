// frontend/src/components/Search/SearchHistorySidebar.jsx
import { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faClockRotateLeft,
    faXmark,
    faMagnifyingGlass,
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { getHistorique } from '../../services/SearchServices'
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
    const [historique,   setHistorique]   = useState([])
    const [collapsed,    setCollapsed]    = useState(true)
    const [loading,      setLoading]      = useState(false)
    const [searchText,   setSearchText]   = useState('')
    const [searchActive, setSearchActive] = useState(false)
    const searchInputRef = useRef(null)

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

    // Focus automatique quand la recherche s'ouvre
    useEffect(() => {
        if (searchActive && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [searchActive])

    const handleCloseSearch = () => {
        setSearchActive(false)
        setSearchText('')
    }

    // Filtrer l'historique selon le texte saisi
    const filteredHistorique = searchText.trim()
        ? historique.filter(h =>
            h.requete.toLowerCase().includes(searchText.toLowerCase().trim())
        )
        : historique

    if (!userId) return null

    return (
        <div className={`history-sidebar ${collapsed ? 'history-sidebar--collapsed' : ''}`}>

            {collapsed ? (
                /* ── État réduit ── */
                <div className="history-collapsed-indicator">
                    <div className="history-collapsed-icon" title="Historique des recherches">
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                    </div>
                    <button
                        className="history-expand-btn"
                        onClick={() => setCollapsed(false)}
                        title="Afficher l'historique"
                    >
                        <span className="history-expand-arrow">›</span>
                    </button>
                </div>
            ) : (
                /* ── État ouvert ── */
                <>
                    {/* ── Header ── */}
                    <div className="history-header">
                        <div className="history-title">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="history-title-icon" />
                            <span>Historique</span>
                            {historique.length > 0 && (
                                <span className="history-count-badge">{historique.length}</span>
                            )}
                        </div>
                        <div className="history-header-actions">
                            {/* Bouton recherche dans l'historique */}
                            {historique.length > 0 && (
                                <button
                                    className={`history-search-btn ${searchActive ? 'history-search-btn--active' : ''}`}
                                    onClick={() => setSearchActive(a => !a)}
                                    title="Rechercher dans l'historique"
                                >
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </button>
                            )}
                            {/* Bouton réduire */}
                            <button
                                className="history-collapse-btn"
                                onClick={() => setCollapsed(true)}
                                title="Réduire l'historique"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        </div>
                    </div>

                    {/* ── Barre de recherche dans l'historique ── */}
                    {searchActive && (
                        <div className="history-search-bar">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="history-search-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="history-search-input"
                                placeholder="Filtrer l'historique..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                            {searchText && (
                                <button
                                    className="history-search-clear"
                                    onClick={() => setSearchText('')}
                                    title="Effacer"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Message aucun résultat de filtre ── */}
                    {searchActive && searchText && filteredHistorique.length === 0 && (
                        <div className="history-search-empty">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <span>Aucune requête ne correspond à <strong>"{searchText}"</strong></span>
                            <button onClick={handleCloseSearch}>Annuler le filtre</button>
                        </div>
                    )}

                    {/* ── Liste ── */}
                    <div className="history-list">
                        {loading && (
                            <div className="history-loading">
                                <div className="history-loading-dots">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}

                        {!loading && historique.length === 0 && (
                            <div className="history-empty">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="history-empty-icon" />
                                <p>Aucune recherche</p>
                                <span>Vos requêtes apparaîtront ici</span>
                            </div>
                        )}

                        {!loading && filteredHistorique.map(entry => (
                            <div
                                key={entry.id}
                                className={`history-item ${currentQuery === entry.requete ? 'history-item--active' : ''}`}
                                onClick={() => onSelectQuery(entry.requete, entry.resultatsJson)}
                                title={entry.requete}
                            >
                                <div className="history-item-icon">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </div>
                                <div className="history-item-content">
                                    {/* Surligner le texte correspondant au filtre */}
                                    <span className="history-item-query">
                                        {searchText.trim()
                                            ? highlightMatch(entry.requete, searchText)
                                            : entry.requete}
                                    </span>
                                    <div className="history-item-meta">
                                        <span className="history-item-time">{timeAgo(entry.dateRecherche)}</span>
                                        {entry.nbResultats != null && (
                                            <span className="history-item-count">{entry.nbResultats} résultats</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// Surligne la partie correspondante dans le texte
function highlightMatch(text, search) {
    const idx = text.toLowerCase().indexOf(search.toLowerCase())
    if (idx === -1) return text
    return (
        <>
            {text.slice(0, idx)}
            <mark className="history-highlight">{text.slice(idx, idx + search.length)}</mark>
            {text.slice(idx + search.length)}
        </>
    )
}

export default SearchHistorySidebar