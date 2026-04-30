import { useState } from 'react'
import './ArticleCard.css'

function ArticleCard({ article, onSave, projects }) {
    const [expanded, setExpanded] = useState(false)
    const [showSaveMenu, setShowSaveMenu] = useState(false)

    const sourceColors = {
        Crossref: '#2563eb',
        OpenAlex: '#16a34a',
        arXiv: '#dc2626',
    }

    const sourceColor = sourceColors[article.source] || '#6b7280'

    return (
        <div className="article-card">
            <div className="article-card-header">
                <div className="article-meta-top">
                    <span
                        className="article-source"
                        style={{ backgroundColor: sourceColor }}
                    >
                        {article.source}
                    </span>
                    {article.documentType && (
                        <span className="article-type">{article.documentType}</span>
                    )}
                    {article.year && (
                        <span className="article-year">📅 {article.year}</span>
                    )}
                    {article.citations != null && (
                        <span className="article-citations">
                            📊 {article.citations} citations
                        </span>
                    )}
                </div>

                {onSave && (
                    <div className="save-wrapper">
                        <button
                            className="btn-save"
                            onClick={() => setShowSaveMenu(!showSaveMenu)}
                        >
                            💾 Sauvegarder
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
                                            📁 {p.nomProjet}
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
                    👥 {article.authors}
                </p>
            )}

            {article.journal && (
                <p className="article-journal">
                    📖 {article.journal}
                    {article.publisher && article.publisher !== article.journal
                        ? ` — ${article.publisher}` : ''}
                </p>
            )}

            {article.doi && (
                <p className="article-doi">
                    DOI : <a href={`https://doi.org/${article.doi}`}
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