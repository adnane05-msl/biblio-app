import { useState } from 'react'
import './ArticleCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faChartColumn, faFloppyDisk, faFile, faUsers, faBook,faLink } from '@fortawesome/free-solid-svg-icons'

function ArticleCard({ article, onSave, projects, selected, onToggleSelect}) {
    const [expanded, setExpanded] = useState(false)
    const [showSaveMenu, setShowSaveMenu] = useState(false)

    
    


    return (
        <div className={`article-card ${selected ? 'selected' : ''}`}>
            {/* Checkbox sélection */}
            {onToggleSelect && (
                <div className="article-select">
                    <label className="custom-checkbox">
                        <input
                            type="checkbox"
                            checked={selected || false}
                            onChange={() => onToggleSelect(article)}
                            onClick={e => e.stopPropagation()}
                        />
                        <span className="checkmark">
                            {selected ? '✅' : '☐'}
                        </span>
                    </label>
                </div>
            )}
            <div className="article-card-header">
                <div className="article-meta-top">
                    {article.documentType && (
                        <span className="article-type">{article.documentType}</span>
                    )}
                    {article.year && (
                        <span className="article-year"><FontAwesomeIcon icon={faCalendar} /> {article.year}</span>
                    )}
                    {article.citations != null && (
                        <span className="article-citations">
                            <FontAwesomeIcon icon={faChartColumn} /> {article.citations} citations
                        </span>
                    )}
                </div>

                {onSave && (
                    <div className="save-wrapper">
                        <button
                            className="btn-save"
                            onClick={() => setShowSaveMenu(!showSaveMenu)}
                        >
                            <FontAwesomeIcon icon={faFloppyDisk} /> Sauvegarder
                        </button>
                        {showSaveMenu && (
                            <div className="save-menu">
                                {projects && projects.length > 0 ? (
                                    projects.map(p => (
                                        <button
                                            key={p.id}
                                            className="save-menu-item"
                                            onClick={() => {
                                                onSave(article, p.id)
                                                setShowSaveMenu(false)
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faFile} /> {p.nomProjet}
                                        </button>
                                    ))
                                ) : (
                                    <p className="save-menu-empty">
                                        Aucun projet disponible
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <h3 className="article-title">
                {article.url ? (
                    <a href={article.url} target="_blank" rel="noreferrer">
                        {article.title || 'Titre non disponible'}
                    </a>
                ) : (
                    article.title || 'Titre non disponible'
                )}
            </h3>

            {article.authors && (
                <p className="article-authors">
                    <FontAwesomeIcon icon={faUsers} /> {article.authors}
                </p>
            )}

            {article.journal && (
                <p className="article-journal">
                    <FontAwesomeIcon icon={faBook} /> {article.journal}
                    {article.publisher && article.publisher !== article.journal
                        ? ` — ${article.publisher}` : ''}
                </p>
            )}

            {article.doi && (
                <p className="article-doi">
                    <FontAwesomeIcon icon={faLink} />DOI : 
                    <a href={`https://doi.org/${article.doi}`}
                        target="_blank" rel="noreferrer">
                        {article.doi}
                    </a>
                </p>
            )}

            {article.abstractText && (
                <div className="article-abstract">
                    <p className={`abstract-text ${expanded ? 'expanded' : ''}`}>
                        {article.abstractText}
                    </p>
                    <button
                        className="btn-toggle-abstract"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? '▲ Réduire' : '▼ Voir le résumé'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default ArticleCard